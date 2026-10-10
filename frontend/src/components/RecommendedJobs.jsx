import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const RecommendedJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const JOBS_PER_PAGE = 6;

    const fetchRecommendedJobs = async () => {
        try {
            setLoading(true);
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            const token = userInfo?.token
            const res = await axios.get("https://jobone-if7l.onrender.com/ai/recommend-jobs", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setJobs(res.data.recommendedJobs || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load recommendations");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommendedJobs();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-lg font-semibold">Loading recommendations...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-2xl font-bold mb-6">Recommended Jobs For You</h1>

            {jobs.length === 0 ? (
                <p>No recommendations found. Upload your resume first.</p>
            ) : (
                <>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {jobs.slice(0, currentPage * JOBS_PER_PAGE).map((job, index) => (
                        <motion.div
                            key={job.jobId || index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white p-5 rounded-2xl shadow-md hover:shadow-lg transition"
                        >
                            <h2 className="text-lg font-semibold mb-2">{job.title}</h2>

                            {/* Match Score */}
                            <div className="mb-3">
                                <p className="text-sm font-medium mb-1">
                                    Match: {job.matchScore}%
                                </p>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-green-500 h-2 rounded-full"
                                        style={{ width: `${job.matchScore}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Reason */}
                            <p className="text-sm text-gray-600 mb-4">{job.reason}</p>

                            {/* Buttons */}
                            <div className="flex justify-between items-center">
                                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                                    Apply
                                </button>
                                <button className="text-blue-500 text-sm hover:underline">
                                    View Details
                                </button>
                            </div>
                        </motion.div>
                    ))}
                    </div>

                    {jobs.length > currentPage * JOBS_PER_PAGE && (
                        <div className="flex justify-center mt-8">
                            <button
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="bg-indigo-600 text-white font-medium px-8 py-3 rounded-full shadow-md hover:bg-indigo-700 transition"
                            >
                                Load More Recommendations
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default RecommendedJobs;
