import mongoose from "mongoose";

const pendingRegistrationSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["candidate", "employer"],
    required: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  data: {
    name: { type: String, required: true, trim: true },
    password: { type: String, required: true }, // Securely pre-hashed with bcrypt
    phone: { type: String, required: true, trim: true },
    countryCode: { type: String, default: "+91" },
    // Employer-specific attributes
    employerType: { type: String, enum: ["company", "individual"], default: "company" },
    companyName: { type: String, default: "", trim: true },
  },
  otp: {
    type: String,
    required: true, // Securely pre-hashed with bcrypt
  },
  attempts: {
    type: Number,
    default: 0,
  },
  lastResendAt: {
    type: Date,
    default: Date.now,
  },
  resendCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // MongoDB TTL index: auto-deletes document after 10 minutes (600 seconds)
  },
});

pendingRegistrationSchema.index({ email: 1, role: 1 });

const PendingRegistration = mongoose.model("PendingRegistration", pendingRegistrationSchema);

export default PendingRegistration;

