import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  jobHost: { type: mongoose.Schema.Types.ObjectId, ref: "Employer", required: true },
  appliedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  status: { 
    type: String, 
    enum: ["applied", "shortlisted", "Interview Scheduled", "Interview Conducted", "Assignment Scheduled", "hired", "NCTT"], 
    default: "applied" 
  },
  applicantHasSeen: { type: Boolean, default: true },
  employerMessage: { type: String, default: "" },
  meetingLink: { type: String, default: "" },
  
  applicantMessage: { type: String, default: "" }, 
  
  // FACT: Added the screening answers array
  screeningAnswers: [{
    question: { type: String, required: true },
    answer: { type: String, required: true }
  }],
  
  rescheduleRequest: {
    isRequested: { type: Boolean, default: false },
    reason: { type: String, default: "" },
    proposedTime: { type: String, default: "" },
    requestStatus: { type: String, enum: ["pending", "approved", "rejected", "none"], default: "none" }
  },

  appliedAt: { type: Date, default: Date.now },
}); 

// Query indexes for fast ATS lookup and candidate history
applicationSchema.index({ job_id: 1, appliedAt: -1 });
applicationSchema.index({ appliedBy: 1, appliedAt: -1 });
applicationSchema.index({ jobHost: 1, appliedAt: -1 });
applicationSchema.index({ jobHost: 1, appliedBy: 1 });

// Prevent duplicate applications at DB layer
applicationSchema.index({ job_id: 1, appliedBy: 1 }, { unique: true });

const Application = mongoose.model("Application", applicationSchema);
export default Application;