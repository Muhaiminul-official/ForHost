import express from "express";
import User from "../models/User.ts";
import jwt from "jsonwebtoken";
import { verifyToken } from "../middleware/auth.ts";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Get current user
router.get("/me", verifyToken, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Update current user
router.put("/me", verifyToken, async (req: any, res: any) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, { new: true }).select("-password");
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Update user status
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Update user role
router.put("/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Delete a user
router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

export default router;
