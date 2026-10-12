const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use((req, res, next) => {
  const origin = req.get("origin");
  if (origin) {
    const isLocalDevOrigin = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
    const configuredOrigin = process.env.CLIENT_ORIGIN;
    if (isLocalDevOrigin || origin === configuredOrigin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
    }
  }
  if (req.method === "OPTIONS") return res.sendStatus(204);
  return next();
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Fitness Management API is running",
  });
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/profile", require("./routes/profile"));

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exitCode = 1;
});
