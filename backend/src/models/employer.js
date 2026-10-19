import mongoose from "mongoose";

const employerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, unique: true, sparse: true },
  
  // FACT: Removed the Gender field entirely as per instructions.
  
  employerType: { 
    type: String, 
    enum: ["company", "individual"], 
    default: "company" 
  },
 isFrozen: { type: Boolean, default: false },
  natureOfBusiness: { 
    type: String, 
    enum: ["Proprietorship", "Partnership", "Trust/NGO", "Public LTD", "Private LTD", "LLP", "ERP", ""],
    default: ""
  },

  companyName: { type: String, default: "" },
  companyWebsite: { type: String, default: "", trim: true },
  
  createdJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
  description: { type: String },
  profilePicture: { type: String },
  isProfileComplete: { type: Boolean, default: false },
  
  location: { type: String, default: "" },
  officeLocation: {
    type: { type: String, enum: ['Point'], required: false },
    coordinates: { type: [Number], required: false, default: undefined },
    address: { type: String, default: "" } 
  },

  industry: { type: String, default: "" },
  googleId: { type: String }, 
  authProvider: { type: String, enum: ["local", "google"], default: "local" },
  isVerified: { type: Boolean, default: false },
  isApproved: { 
    type: String, 
    enum: ["pending", "approved", "rejected"], 
    default: "pending" 
  },
  
  aadharCard: { type: String, default: "" },
  panCard: { type: String, default: "" },
  gstForm: { type: String, default: "" },
  otherBusinessCertificate: { type: String, default: "" },
  tradeLicense: { type: String, default: "" },
  educationDocuments: { type: String, default: "" },
  
  ratingsReceived: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, min: 1, max: 5 },
      review: { type: String },
    }
  ],
}, { timestamps: true });

const Employer = mongoose.model("Employer", employerSchema);
export default Employer;