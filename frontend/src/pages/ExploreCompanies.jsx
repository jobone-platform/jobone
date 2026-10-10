import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Building2, Search, MapPin, Briefcase, Filter, ArrowLeft } from "lucide-react";

export default function ExploreCompanies() {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchCompanies = async () => {
      try {
        const res = await axios.get("https://jobone-mrpy.onrender.com/employer/explore");
        setCompanies(res.data);
        setFilteredCompanies(res.data);
      } catch (err) {
        console.error("Error fetching companies:", err);
        setError("Failed to load companies. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    let result = companies;
    if (searchTerm) {
      result = result.filter(
        (c) =>
          c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedIndustry) {
      result = result.filter((c) => c.industry === selectedIndustry);
    }
    setFilteredCompanies(result);
  }, [searchTerm, selectedIndustry, companies]);

  const industries = [...new Set(companies.map(c => c.industry).filter(Boolean))];

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-indigo-900 rounded-3xl p-8 sm:p-16 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
          
          <button
            onClick={() => navigate(-1)}
            className="absolute top-6 left-4 sm:left-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors font-bold text-sm uppercase tracking-wide bg-black/20 hover:bg-black/40 px-4 py-2 rounded-xl backdrop-blur-md z-20"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="relative z-10">
            <h1 className="text-3xl sm:text-5xl font-extrabold mb-6 tracking-tight">
              Explore Top Companies
            </h1>
            <p className="text-indigo-200 text-lg sm:text-xl max-w-2xl mx-auto mb-10">
              Discover companies that align with your career goals. Browse employers who are actively hiring and find your next opportunity.
            </p>

            {/* Search and Filters */}
            <div className="max-w-4xl mx-auto bg-white p-3 rounded-2xl flex flex-col sm:flex-row gap-3 shadow-xl">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by company or employer name..."
                  className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-100 text-slate-800 font-medium placeholder-slate-400 outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="sm:w-64 relative flex-shrink-0">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <select
                  className="w-full pl-12 pr-10 py-3 sm:py-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-100 text-slate-800 font-medium appearance-none outline-none transition-all cursor-pointer"
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                >
                  <option value="">All Industries</option>
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Companies Grid */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-800">
              {filteredCompanies.length} {filteredCompanies.length === 1 ? "Company" : "Companies"} Hiring
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-3xl p-6 h-64 animate-pulse border border-slate-100">
                  <div className="w-16 h-16 bg-slate-200 rounded-2xl mb-4"></div>
                  <div className="w-3/4 h-6 bg-slate-200 rounded-lg mb-3"></div>
                  <div className="w-1/2 h-4 bg-slate-200 rounded-lg mb-6"></div>
                  <div className="flex gap-2">
                    <div className="w-24 h-8 bg-slate-200 rounded-lg"></div>
                    <div className="w-24 h-8 bg-slate-200 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center font-medium">
              {error}
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-sm">
              <Building2 className="mx-auto text-slate-300 mb-4" size={64} />
              <h3 className="text-xl font-bold text-slate-800 mb-2">No companies found</h3>
              <p className="text-slate-500">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company) => {
                const displayName = company.companyName || company.name || "Confidential Employer";
                return (
                  <div
                    key={company._id}
                    onClick={() => navigate(`/company/${company._id}`)}
                    className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:border-indigo-100 transition-all cursor-pointer group flex flex-col h-full"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center p-2 group-hover:scale-105 transition-transform shadow-sm">
                        {company.profilePicture ? (
                          <img
                            src={company.profilePicture}
                            alt={displayName}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Building2 size={32} className="text-slate-300" />
                        )}
                      </div>
                      <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        {company.jobCount} {company.jobCount === 1 ? "Job" : "Jobs"}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {displayName}
                    </h3>
                    
                    <div className="flex items-center text-sm text-slate-500 gap-2 mb-1 line-clamp-1">
                      <MapPin size={16} className="text-slate-400 shrink-0" />
                      <span>{company.location || "Location not provided"}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-slate-500 gap-2 mb-6 line-clamp-1">
                      <Briefcase size={16} className="text-slate-400 shrink-0" />
                      <span>{company.industry || "Industry not specified"}</span>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-indigo-600 font-bold text-sm group-hover:underline">
                        View Profile
                      </span>
                      <span className="text-slate-400 group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
