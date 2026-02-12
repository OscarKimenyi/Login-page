const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  generateVerificationToken,
  sendVerificationEmail,
  sendPasswordResetEmail
} = require("../utils/emailService");
const authMiddleware = require("../middleware/auth");

// Register with email verification
router.post("/register", async (req, res) => {
  try {
    console.log("Registration attempt:", req.body.email);

    const { email, password, name } = req.body;

    // Basic validation
    if (!email || !password || !name) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const verificationToken = generateVerificationToken();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password: password,
      name: name.trim(),
      verificationToken,
      verificationTokenExpires,
      isVerified: false
    });

    await user.save();

    //Send verification email
    await sendVerificationEmail(user.email, user.name, verificationToken);
    console.log("User created, verification email sent");

    res.status(201).json({
      success: true,
      message: "Registration successful! Please check your email to verify your account.",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Registration failed. Please try again.",
    });
  }
});

// Verify email
router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user){
      return res.status(400).json({message: "Invalid or expired verification token"});
    }
    
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully! You can now log in."
    });
  } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({message: "Email verification failed. Please try again."});
    }
  });
  
  // Resend verification email
  //   const token = jwt.sign(
  //     { userId: user._id, email: user.email, name: user.name },
  //     process.env.JWT_SECRET,
  //     { expiresIn: "24h" },
  //   );

  //   // Set cookie
  //   res.cookie("token", token, {
  //     httpOnly: true,
  //     secure: process.env.NODE_ENV === "production",
  //     sameSite: "strict",
  //     maxAge: 24 * 60 * 60 * 1000,
  //   });

  //   res.status(201).json({
  //     success: true,
  //     message: "Registration successful",
  //     user: {
  //       id: user._id,
  //       email: user.email,
  //       name: user.name,
  //     },
  //     token,
  //   });
  // } catch (error) {
  //   console.error("❌ Registration error:", error);

  //   // Handle duplicate key error
  //   if (error.code === 11000) {
  //     return res.status(400).json({
  //       message: "User already exists",
  //     });
  //   }

  //   res.status(500).json({
  //     message: "Registration failed. Please try again.",
  //   });
  // }

// Resend verification email
router.post("/resend-verification", async (req, res) => {
  try{
    const {email} = req.body;

    const user = await User.findOne({email: email.toLowerCase()});
    if (!user){
      return res.status(400).json({message: "User not found"});
    }

    if (user.isVerified){
      return res.status(400).json({message: "Email is already verified"});
    }

    const verificationToken = generateVerificationToken();
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(user.email, user.name, verificationToken);

    res.json({
      success: true,
      message: "Verification email resent. Please check your inbox."
    });
  } catch (error){
    console.error("Resend verification email error:", error);
    res.status(500).json({message: "Failed to resend verification email. Please try again."});
  }
});

// Login with verification check
router.post("/login", async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // check if account is locked
    if (user.isLocked()){
      return res.status(423).json({
        message: "Account is locked. Please try again later."
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      
      // Lock account after 5 failed attempts
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
        console.warn(`Account locked due to multiple failed login attempts: ${user.email}`);
      }
      await user.save();
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
        needsVerification: true
      });
    }

    // Reset failed login attempts on successful login
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    await user.save();

    // Create refresh token
    const refreshToken = jwt.sign(
      { userId: user._id, tokenVersion: Date.now() },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // Store refresh token in database
    user.refreshToken = refreshToken;
    user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await user.save();

    // Set cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    
    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isVerified: user.isVerified
      },
      token,
      refreshToken
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Login failed. Please try again.",
    });
  }
});

// Refresh token endpoint
router.post("/refresh-token", async (req, res) => {
  try {
    const refreshToken = req.body;
    const cookieRefreshToken = req.cookies.refreshToken;
    const token = refreshToken || cookieRefreshToken;

    if (!token) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

     // Generate new access token
    const newToken = jwt.sign(
      { userId: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000
    });

    res.json({ 
      success: true, 
      token: newToken 
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

// Logout (clear refresh token)
router.post("/logout", async (req, res) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.userId);
      if (user) {
        user.refreshToken = undefined;
        user.refreshTokenExpires = undefined;
        await user.save();
      }
    }
  } catch (error) {
    // Ignore token verification errors on logout
  }

  res.clearCookie("token");
  res.clearCookie("refreshToken");
  res.json({ success: true, message: "Logged out successfully" });
});


// Check auth status
// router.get("/status", async (req, res) => {
//   try {
//     const token = req.cookies.token;
//     if (!token) {
//       return res.json({ isAuthenticated: false });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.userId).select("-password");

//     if (!user) {
//       return res.json({ isAuthenticated: false });
//     }

//     res.json({
//       isAuthenticated: true,
//       user: {
//         id: user._id,
//         email: user.email,
//         name: user.name,
//       },
//     });
//   } catch (error) {
//     res.json({ isAuthenticated: false });
//   }
// });

module.exports = router;
