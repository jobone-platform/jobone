import { useEffect, useState } from "react";
import axios from "axios";
import { FaLock, FaMapMarkerAlt, FaClock, FaGlobe } from "react-icons/fa";
import JobDetailsModal from "../components/JobDetailsModal";

/**
 * FeaturedJobs (updated)
 * - Job cards now match the job list style (rounded-2xl, border, avatar fallback, meta row).
 * - Clicking a featured job opens the JobDetailsModal (same behavior as Jobs.jsx).
 */

const badgeColors = {
    "part-time": "bg-purple-100 text-purple-600",
    "short-term": "bg-green-100 text-green-600",
    "daily": "bg-yellow-100 text-yellow-600",
};

function timeAgoFrom(dateString) {
    if (!dateString) return "Recently posted";
    const postedDate = new Date(dateString);
    const diff = (Date.now() - postedDate.getTime()) / 1000; // seconds
    if (diff < 60) return `${Math.floor(diff)} sec ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
}

export default function FeaturedJobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const { data } = await axios.get(
                    "https://jobone-mrpy.onrender.com/jobs"
                );
                const jobArray = data?.data || [];
                const latestJobs = jobArray.slice(-6).reverse();
                setJobs(latestJobs);
            } catch (error) {
                console.error("Error fetching jobs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    if (loading) {
        return (
            <section className="py-12 text-center bg-gray-50">
                <p className="text-gray-500">Loading featured jobs...</p>
            </section>
        );
    }

    if (jobs.length === 0) {
        return (
            <section className="py-12 text-center bg-gray-50">
                <p className="text-gray-500">No jobs posted yet.</p>
            </section>
        );
    }

    return (
        <section className="w-full max-w-6xl mx-auto px-4 mt-10 mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Latest Jobs for You
            </h2>

            {/* GRID LIKE IMAGE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobs.map((job) => (
                    <div
                        key={job._id}
                        onClick={() => setSelectedJob(job)}
                        className="relative bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                    >
                        {/* Curved Gradient Accent */}
                        <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-bl-[100px]" />

                        {/* CONTENT */}
                        <div className="relative z-10">
                            <p className="text-xs text-gray-400 font-medium mb-1">
                                We are hiring for
                            </p>

                            <h3 className="text-lg font-semibold text-gray-900 leading-snug mb-2">
                                {job.title}
                            </h3>

                            {/* Meta Row */}
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <FaMapMarkerAlt className="text-gray-400" />
                    {job.location || "Remote"}
                </span>
                                <span>•</span>
                                <span className="capitalize">{job.jobType}</span>
                                <span>•</span>
                                <span className="capitalize">{job.mode}</span>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {timeAgoFrom(job.postedAt)}
                </span>

                                <button className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100 transition">
                                    View
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL (UNCHANGED – BACKEND INTEGRATION SAFE) */}
            {selectedJob && (
                <JobDetailsModal
                    job={selectedJob}
                    onClose={() => setSelectedJob(null)}
                />
            )}
        </section>
    );
}
