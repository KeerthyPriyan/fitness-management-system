const express = require("express");
const User = require("../models/User");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();
const editableFields = ["name", "age", "heightCm", "weightKg", "goal", "activity", "location"];
const allowedActivities = new Set(["Light", "Moderate", "High", "Elite"]);

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

router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "Profile not found." });
    return res.json({ user: publicUser(user) });
  } catch (error) {
    console.error("Profile lookup failed:", error.message);
    return res.status(500).json({ message: "Could not load your profile. Please try again." });
  }
});

router.put("/", async (req, res) => {
  const updates = {};
  for (const field of editableFields) {
    if (Object.prototype.hasOwnProperty.call(req.body || {}, field)) {
      updates[field] = req.body[field];
    }
  }

  if (typeof updates.name !== "string" || !updates.name.trim() || updates.name.trim().length > 80) {
    return res.status(400).json({ message: "Enter a name between 1 and 80 characters." });
  }
  updates.name = updates.name.trim();

  const numericFields = [
    ["age", 13, 120, true],
    ["heightCm", 80, 250, false],
    ["weightKg", 20, 500, false],
  ];
  for (const [field, min, max, integerOnly] of numericFields) {
    const value = Number(updates[field]);
    if (!Number.isFinite(value) || value < min || value > max || (integerOnly && !Number.isInteger(value))) {
      return res.status(400).json({ message: `Enter a valid ${field === "heightCm" ? "height" : field === "weightKg" ? "weight" : "age"}.` });
    }
    updates[field] = value;
  }

  if (typeof updates.goal !== "string" || !updates.goal.trim() || updates.goal.trim().length > 120) {
    return res.status(400).json({ message: "Enter a fitness goal of up to 120 characters." });
  }
  updates.goal = updates.goal.trim();
  if (!allowedActivities.has(updates.activity)) {
    return res.status(400).json({ message: "Choose a valid activity level." });
  }
  if (typeof updates.location !== "string" || updates.location.trim().length > 100) {
    return res.status(400).json({ message: "Location must be 100 characters or fewer." });
  }
  updates.location = updates.location.trim();

  try {
    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).json({ message: "Profile not found." });
    return res.json({ user: publicUser(user) });
  } catch (error) {
    console.error("Profile update failed:", error.message);
    return res.status(500).json({ message: "Could not save your profile. Please try again." });
  }
});

module.exports = router;
