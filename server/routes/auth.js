const crypto = require("node:crypto");
const { promisify } = require("node:util");
const express = require("express");
const User = require("../models/User");

const router = express.Router();
const scrypt = promisify(crypto.scrypt);
const TOKEN_LIFETIME_SECONDS = 7 * 24 * 60 * 60;
const allowedActivities = new Set(["Light", "Moderate", "High", "Elite"]);

const issueToken = (userId) => {
  const secret = process.env.AUTH_TOKEN_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_TOKEN_SECRET must be set to a value at least 32 characters long.");
  }

  const payload = Buffer.from(
    JSON.stringify({
      userId: String(userId),
      expiresAt: Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_SECONDS,
    })
  ).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
};

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  age: user.age,
  heightCm: user.heightCm,
  weightKg: user.weightKg,
  goal: user.goal,
  activity: user.activity,
  location: user.location,
});

const parseProfile = (body) => {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const goal = typeof body.goal === "string" ? body.goal.trim() : "";
  const activity = typeof body.activity === "string" ? body.activity : "";
  const location = typeof body.location === "string" ? body.location.trim() : "";
  const age = Number(body.age);
  const heightCm = Number(body.heightCm);
  const weightKg = Number(body.weightKg);

  if (!name || name.length > 80) return { error: "Enter a name between 1 and 80 characters." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return { error: "Enter a valid email address." };
  }
  if (!Number.isInteger(age) || age < 13 || age > 120) return { error: "Age must be between 13 and 120." };
  if (!Number.isFinite(heightCm) || heightCm < 80 || heightCm > 250) {
    return { error: "Height must be between 80 and 250 cm." };
  }
  if (!Number.isFinite(weightKg) || weightKg < 20 || weightKg > 500) {
    return { error: "Weight must be between 20 and 500 kg." };
  }
  if (!goal || goal.length > 120) return { error: "Enter a fitness goal of up to 120 characters." };
  if (!allowedActivities.has(activity)) return { error: "Choose a valid activity level." };
  if (location.length > 100) return { error: "Location must be 100 characters or fewer." };
  return { profile: { name, email, age, heightCm, weightKg, goal, activity, location } };
};

router.post("/register", async (req, res) => {
  const { profile, error } = parseProfile(req.body || {});
  if (error) return res.status(400).json({ message: error });

  const secret = process.env.AUTH_TOKEN_SECRET;
  if (!secret || secret.length < 32) {
    return res.status(500).json({ message: "Server authentication is not configured." });
  }

  const password = req.body.password;
  if (typeof password !== "string" || password.length < 8 || password.length > 128) {
    return res.status(400).json({ message: "Password must be between 8 and 128 characters." });
  }

  try {
    const passwordSalt = crypto.randomBytes(16).toString("hex");
    const passwordHash = (await scrypt(password, passwordSalt, 64)).toString("hex");
    const user = await User.create({ ...profile, passwordHash, passwordSalt });
    return res.status(201).json({ token: issueToken(user._id), user: publicUser(user) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }
    if (error.message.startsWith("AUTH_TOKEN_SECRET")) {
      return res.status(500).json({ message: "Server authentication is not configured." });
    }
    console.error("Account registration failed:", error.message);
    return res.status(500).json({ message: "Could not create your account. Please try again." });
  }
});

router.post("/login", async (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = req.body?.password;
  if (!email || typeof password !== "string" || password.length > 128) {
    return res.status(400).json({ message: "Enter your email and password." });
  }

  try {
    const user = await User.findOne({ email }).select("+passwordHash +passwordSalt");
    if (!user) return res.status(401).json({ message: "Email or password is incorrect." });

    const submittedHash = await scrypt(password, user.passwordSalt, 64);
    const savedHash = Buffer.from(user.passwordHash, "hex");
    if (submittedHash.length !== savedHash.length || !crypto.timingSafeEqual(submittedHash, savedHash)) {
      return res.status(401).json({ message: "Email or password is incorrect." });
    }

    return res.json({ token: issueToken(user._id), user: publicUser(user) });
  } catch (error) {
    if (error.message.startsWith("AUTH_TOKEN_SECRET")) {
      return res.status(500).json({ message: "Server authentication is not configured." });
    }
    console.error("Account login failed:", error.message);
    return res.status(500).json({ message: "Could not log in. Please try again." });
  }
});

module.exports = router;
