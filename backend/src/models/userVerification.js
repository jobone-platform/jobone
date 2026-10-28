import mongoose from "mongoose";

const userOtpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["verification", "password_reset"],
    default: "verification",
  },
  attempts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // Self-destructs in 10 minutes
  },
});

const UserOTP = mongoose.model("UserOTP", userOtpSchema);
export default UserOTP;