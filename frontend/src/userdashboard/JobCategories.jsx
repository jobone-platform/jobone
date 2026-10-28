import React from "react";
import { useNavigate } from "react-router-dom";

const categories = [
    { name: "Accounting", icon: "💼", color: "bg-blue-50 text-blue-600", span: "col-span-1" },
    { name: "Marketing", icon: "📢", color: "bg-purple-50 text-purple-600", span: "col-span-2" },
    { name: "Design", icon: "🎨", color: "bg-pink-50 text-pink-600", span: "col-span-1" },
    { name: "Development", icon: "💻", color: "bg-indigo-50 text-indigo-600", span: "col-span-2" },
    { name: "HR", icon: "🧑‍💼", color: "bg-orange-50 text-orange-600", span: "col-span-1" },
    { name: "Automotive", icon: "🚗", color: "bg-slate-50 text-slate-600", span: "col-span-1" },
    { name: "Customer Service", icon: "🎧", color: "bg-green-50 text-green-600", span: "col-span-1" },
    { name: "Health Care", icon: "🏥", color: "bg-red-50 text-red-600", span: "col-span-2" },
    { name: "Project Management", icon: "📂", color: "bg-amber-50 text-amber-600", span: "col-span-1" },
];

export default function DashboardCategories() {
    const navigate = useNavigate();

    const handleClick = (category) => {
        navigate(`/jobs?title=${encodeURIComponent(category)}`);
    };

    return (
        <section className="py-12 max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Explore Categories
                    </h2>
                    <p className="text-gray-500 mt-1">Discover your next career move by industry</p>
                </div>
                <button className="text-indigo-600 font-semibold hover:text-indigo-700 transition">
                    View All Categories →
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[120px]">
                {categories.map((cat, index) => (
                    <div
                        key={index}
                        onClick={() => handleClick(cat.name)}
                        className={`${cat.span} group relative overflow-hidden flex flex-col justify-end p-6 
                        bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl shadow-sm 
                        hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer`}
                    >
                        {/* Background Decoration */}
                        <div className={`absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150 ${cat.color}`} />

                        <div className="relative z-10">
                            <div className={`w-12 h-12 mb-3 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${cat.color}`}>
                                {cat.icon}
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                                {cat.name}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
