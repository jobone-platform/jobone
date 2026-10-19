import mongoose from "mongoose";

const userOtpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // Self-destructs in 10 minutes
  },
});

const UserOTP = mongoose.model("UserOTP", userOtpSchema);
export default UserOTP;