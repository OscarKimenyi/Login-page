const axios = require("axios");

const verifyCaptcha = async (req, res, next) => {
  const { captchaToken } = req.body;

  if (!captchaToken) {
    return res.status(400).json({ message: "Captcha token is required" });
  }

  try {
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: captchaToken,
        },
      },
    );

    if (response.data.success) {
      next();
    } else {
      res.status(400).json({ message: "Captcha verification failed" });
    }
  } catch (error) {
    console.error("Captcha verification error:", error);
    res.status(500).json({ message: "Captcha verification failed" });
  }
};

module.exports = verifyCaptcha;
