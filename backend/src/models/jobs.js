import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true }, 
  
  // FACT: Added the 9 specific Industries and Subdomain requirement
  industry: { 
    type: String, 
    required: true,
    enum: [
      "IT & Software", "Banking & Finance", "Sales & Marketing", 
      "Healthcare & Pharma", "Engineering & Manufacturing", 
      "Operations & Logistics", "Customer Support", "HR & Admin", "Education & EdTech"
    ]
  },
  subdomain: { type: String, required: true },

  jobSummary: { type: String, required: true },
  keyResponsibilities: { type: String, required: true }, 
  jobFeatures: { type: [String], default: ["", ""] },

  jobType: [{
    type: String,
    enum: ["permanent", "temporary", "internship", "part-time", "full-time", "contractual", "freelance", "volunteer opportunity"]
  }],

  workDaysPattern: {
    type: String,
    enum: ["Mon to Fri", "Mon to Sat", "Sat to Sun", "Custom"]
  },

  customWorkDaysDescription: { type: String },
  skillsRequired: { type: [String], default: [] },
  
  location: {
    type: { type: String, enum: ['Point'], required: false },
    coordinates: { type: [Number], required: false, index: '2dsphere', default: undefined },
    address: { type: String, default: "Remote" } 
  },
  pinCode: { type: Number }, 
  
  salaryMin: { type: Number, required: true },
  salaryMax: { type: Number, required: true },
  salaryCurrency: { type: String, default: "INR" },
  salaryFrequency: { type: String, enum: ["Hour", "Day", "Week", "Month", "Year", "Lump-Sum"], default: "Month" },

  incentives: { type: [String], default: [] },
  screeningQuestions: [{ type: String }],
  requestedDocuments: [{ type: String, default: [] }],
  
  durationType: { type: String, enum: ["Day", "Week", "Month"], required: false },
  startDate: { type: Date, default: null },
  endDate: { type: Date, required: false, default: null },
  isFlexibleDuration: { type: Boolean, default: false },
  applicationDeadline: { type: Date, required: false },

  shifts: [{
    shiftName: { type: String, required: true }, 
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  }],
  isFlexibleShifts: { type: Boolean, default: false },

  mode: [{ 
    type: String, 
    enum: ["Work from home", "Work from office", "Work from field"], 
  }],
  
  noOfDays: { type: Number, required: false }, 
  noOfPeopleRequired: { type: Number, required: true },
  genderPreference: { type: String, enum:["Male","Female","Other","No Preference"], default: "No Preference" },
  
  qualifications: [{ type: String }],
  courses: [{ type: String }],
  ageLimit: {
    min: { type: Number },
    max: { type: Number },
    isAny: { type: Boolean, default: false }
  },

  languages: [{ type: String }], 

  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employer", required: true },
  postedByImage: { type: String }, 
  postedByName: { type: String },
  postedByCompany: { type: String, default: "" },
  postedAt: { type: Date, default: Date.now },
  expiringAt: { type: Date }, 
  status: { 
    type: String, 
    enum: ["pending_approval", "active", "inactive", "closed", "deadline passed", "rejected", "hidden"], 
    default: "pending_approval" 
  },
  
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 

  isThirdPartyRecruiting: { type: Boolean, default: false },
  hiringCompanyName: { type: String, default: "" },
  showHiringCompanyName: { type: Boolean, default: false }
});

// Force 2dsphere index for geospatial queries
JobSchema.index({ location: "2dsphere" });

const Job = mongoose.model("Job", JobSchema);
export default Job;