import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, MapPin, Briefcase, Clock, Building2, IndianRupee, ArrowRight, X } from "lucide-react";
import CompanyDisplay from "../components/CompanyDisplay";
import JobDetailsModal from "../components/JobDetailsModal"; // Re-using existing modal

export default function RecommendedJobs() {
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendations = async (allJobsList) => {
      try {
        const stored = localStorage.getItem("userInfo");
        if (!stored) {
          navigate('/login');
          return;
        }
        const token = JSON.parse(stored)?.token;
        if (!token) {
          navigate('/login');
          return;
        }

        const { data } = await axios.get("https://jobone-if7l.onrender.com/ai/recommend-jobs", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (data && data.recommendedJobs) {
          const richRecommendations = data.recommendedJobs.map(aiJob => {
            const fullJob = allJobsList.find(j => j._id === aiJob.jobId);
            return {
              ...fullJob,
              matchScore: aiJob.matchScore,
              reason: aiJob.reason,
              _id: aiJob.jobId,
              title: fullJob?.title || aiJob.title
            };
          }).filter(j => j.postedByCompany || j.postedByName); // Ensure we found the full job

          setRecommendedJobs(richRecommendations);
        }
      } catch (err) {
        console.error("Failed to fetch recommendations", err);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    const fetchAllJobs = async () => {
      try {
        const { data } = await axios.get("https://jobone-mrpy.onrender.com/jobs?limit=100");
        const allJobs = data.data || data || [];
        fetchRecommendations(allJobs);
      } catch (err) {
        console.error("Failed to load all jobs", err);
        setLoadingRecommendations(false);
      }
    };

    fetchAllJobs();
  }, [navigate]);

  const getLocationStr = (job) => {
    if (!job) return "Remote";
    if (typeof job.location === "string") return job.location;
    if (job.location?.address) return job.location.address;
    return "Remote";
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <span className="text-indigo-600 font-bold text-sm uppercase tracking-wider bg-white border border-indigo-100 px-4 py-1.5 rounded-full inline-flex items-center gap-2 shadow-sm mb-4">
            <Sparkles size={16} className="text-indigo-500" /> AI Matched For You
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            Recommended Jobs
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            These jobs have been uniquely matched to your profile, skills, and experience using our AI recommendation engine.
          </p>
        </div>

        {loadingRecommendations ? (
          <div className="flex flex-col justify-center items-center py-20">
            <Sparkles size={40} className="text-indigo-500 animate-pulse mb-4" />
            <p className="text-indigo-600 font-bold text-lg">Generating personalized AI recommendations...</p>
          </div>
        ) : recommendedJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendedJobs.map((job) => (
              <div
                key={job._id}
                onClick={() => setSelectedJob(job)}
                className={`bg-white rounded-3xl border p-6 shadow-md hover:shadow-xl transition-all cursor-pointer group flex flex-col relative overflow-hidden ${
                  job.matchScore > 70
                    ? "border-amber-400 hover:border-amber-500 shadow-amber-100/50"
                    : "border-indigo-100 hover:border-indigo-300"
                }`}
              >
                <div className={`absolute top-0 right-0 px-4 py-2 rounded-bl-2xl font-bold flex items-center gap-1 text-sm border-b border-l ${
                  job.matchScore > 70 
                    ? "bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900 border-amber-300 shadow-sm"
                    : "bg-indigo-50 text-indigo-700 border-indigo-100"
                }`}>
                  <Sparkles size={14} /> {job.matchScore || 95}% Match
                </div>

                <div className="flex items-start gap-4 mb-5 mt-2">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center p-2 shrink-0">
                    <img
                      src={job.postedByCompany?.profilePicture || "https://ui-avatars.com/api/?name=" + (job.postedByCompany?.companyName || "Company")}
                      alt="Logo"
                      className="max-w-full max-h-full object-contain rounded-xl"
                      onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=Company"; }}
                    />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium mt-1">
                      <Building2 size={14} />
                      <CompanyDisplay job={job} fallback="Confidential" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="flex items-center gap-1.5 bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-100">
                    <MapPin size={12} /> {getLocationStr(job)}
                  </span>
                  <span className="flex items-center gap-1.5 bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-100">
                    <Briefcase size={12} /> {job.jobType || "Full-Time"}
                  </span>
                  <span className="flex items-center gap-1.5 bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-100">
                    <IndianRupee size={12} /> {job.salary || "Not Disclosed"}
                  </span>
                </div>

                {job.reason && (
                  <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50 mb-6 flex-1">
                    <p className="text-xs text-indigo-800 leading-relaxed font-medium">
                      <span className="font-bold">Why you match:</span> {job.reason}
                    </p>
                  </div>
                )}

                <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Clock size={12} /> {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                  <div className="text-indigo-600 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    View Details <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">No recommendations yet</h3>
            <p className="text-slate-500">Update your profile with more skills and experience to get AI-matched jobs.</p>
            <Link to="/editprofile2" className="mt-6 inline-block bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition">
              Update Profile
            </Link>
          </div>
        )}
      </div>
      
      {/* Job Details Modal */}
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApplySuccess={() => {
            alert("Applied successfully!");
            setSelectedJob(null);
          }}
        />
      )}
    </div>
  );
}
