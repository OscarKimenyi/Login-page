const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");

// Protected route
router.get("/", authMiddleware, (req, res) => {
  res.json({
    message: "Welcome to dashboard",
    user: req.user,
  });
});

module.exports = router;
