import mongoose from "mongoose";

const directRequestSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  donor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["Pending", "Accepted", "Declined"], default: "Pending" },
  contactInfo: { type: String },
  message: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("DirectRequest", directRequestSchema);
