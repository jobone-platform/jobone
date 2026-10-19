import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, unique: true, sparse: true},
  isVerified: { type: Boolean, default: false },
  gender: { type: String, enum: ["Male", "Female", "Other", "Prefer not to say"] }, 
  skills: [String],
  
  // FACT: Added new portfolio Links array
  portfolioLinks: [{
    platform: { type: String }, // e.g., GitHub, LinkedIn, Behance
    url: { type: String }
  }],

  experience:[{
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    company: { type: String },
    role: { type: String },
    duration: { type: String },
    description: { type: String }
  }],

  // FACT: Added new Projects array
  projects: [{
    title: { type: String },
    technologies: { type: String },
    link: { type: String },
    description: { type: String }
  }],

  // FACT: Added new Certifications array
  certifications: [{
    name: { type: String },
    issuer: { type: String },
    date: { type: String }
  }],
  
  // FACT: Added Volunteering array
  volunteering: [{
    organization: { type: String },
    role: { type: String },
    duration: { type: String },
    description: { type: String }
  }],
  
  isFrozen: { type: Boolean, default: false }, // The "freeze" toggle
  createdJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }], 
  appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }], 
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isProfileComplete:{ type: Boolean,default:false},
  
  // FACT: resumeData now correctly holds the AI parsed fields INSIDE it
  resumeData: {
      name: String,
      phone: String,
      description: String,
      skills: [String],
      experience: [
          {
              role: String,
              company: String,
              duration: String,
              description: String
          }
      ],
      education: [
          {
              degree: String,
              university: String,
              ended: String,
              CGPA: String
          }
      ],
      projects: [
          {
              title: String,
              technologies: String,
              link: String,
              description: String
          }
      ],
      certifications: [
          {
              name: String,
              issuer: String,
              date: String
          }
      ],
      volunteering: [
          {
              organization: String,
              role: String,
              duration: String,
              description: String
          }
      ]
  },
  
  // FACT: This will now store the AWS S3 Key (e.g. "resumes/123-abc.pdf")
  resumeFileKey: { type: String },
  resume: { type: String }, // Leaving this as-is for backward compatibility (external links)

  // FACT: Optional verification and credentials documents for Jobseekers
  documents: {
    tenthMarksheet: { key: { type: String, default: "" }, name: { type: String, default: "" } },
    twelfthMarksheet: { key: { type: String, default: "" }, name: { type: String, default: "" } },
    ugMarksheet: { key: { type: String, default: "" }, name: { type: String, default: "" } },
    pgMarksheet: { key: { type: String, default: "" }, name: { type: String, default: "" } },
    aadharCard: { key: { type: String, default: "" }, name: { type: String, default: "" } },
    panCard: { key: { type: String, default: "" }, name: { type: String, default: "" } },
    otherDocuments: { key: { type: String, default: "" }, name: { type: String, default: "" } },
    medicalCertificate: { key: { type: String, default: "" }, name: { type: String, default: "" } },
    salarySlips: { key: { type: String, default: "" }, name: { type: String, default: "" } }
  },
  
  education:[{
    degree: { type: String },
    university:{ type: String},
    started:{type: String},
    ended:{type:String},
    CGPA:{type:String}
  }],
  description: { type: String },
  profilePicture: { type: String },
  employeeratings: [
        {
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" }, 
        rating: { type: Number, min: 1, max: 5 },
        review: { type: String },
        }
    ],
  employerrating:[
        {
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" }, 
        rating: { type: Number, min: 1, max: 5 },
        review: { type: String },
        }
    ]
});

const User = mongoose.model("User", userSchema);

export default User;