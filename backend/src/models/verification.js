import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employer",
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
    expires: 600, // Document self-destructs in 10 minutes
  },
});

const OTP = mongoose.model("OTP", otpSchema);
export default OTP;