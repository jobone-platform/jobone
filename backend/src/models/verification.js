import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employer",
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // MAGICAL LINE: This document will self-destruct in 600 seconds (10 minutes)
  },
});

const OTP = mongoose.model("OTP", otpSchema);
export default OTP;