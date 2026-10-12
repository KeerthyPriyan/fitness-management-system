const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    passwordHash: { type: String, required: true, select: false },
    passwordSalt: { type: String, required: true, select: false },
    age: { type: Number, required: true, min: 13, max: 120 },
    heightCm: { type: Number, required: true, min: 80, max: 250 },
    weightKg: { type: Number, required: true, min: 20, max: 500 },
    goal: { type: String, required: true, trim: true, maxlength: 120 },
    activity: { type: String, required: true, enum: ["Light", "Moderate", "High", "Elite"] },
    location: { type: String, trim: true, maxlength: 100, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
