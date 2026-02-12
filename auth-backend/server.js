const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const helmet = require("helmet");
const { apiLimiter, authLimiter } = require("./middleware/rateLimiter");

const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");

const morgan = require("morgan");
const requestLogger = require("./middleware/loggerMiddleware");
const logger = require("./utils/logger");

// Create logs directory
const fs = require("fs");
if (!fs.existsSync("./logs")) {
  fs.mkdirSync("./logs");
}

const app = express();

// Security middleware
app.use(helmet());

// HTTP request logging
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);
app.use(requestLogger);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/", apiLimiter);
app.use("/api/auth/", authLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
