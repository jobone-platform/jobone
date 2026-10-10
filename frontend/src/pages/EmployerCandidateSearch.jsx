import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Loader2,
  ArrowRight,
  Code,
  Mail,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

export default function Candidates() {
  const navigate = useNavigate();

  // FACT: Search state is now broken into an array of visual chips and a text input
  const [searchSkills, setSearchSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCandidates, setTotalCandidates] = useState(0);

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      try {
        const stored = localStorage.getItem("employerInfo");
        const token = stored ? JSON.parse(stored).token : null;

        const { data } = await axios.get(
          `https://jobone-mrpy.onrender.com/employer/search-candidates?skills=${encodeURIComponent(appliedQuery)}&page=${page}&limit=20`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setCandidates(data.candidates || []);
        setTotalPages(data.totalPages || 1);
        setTotalCandidates(data.totalCandidates || 0);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [page, appliedQuery]);

  // FACT: Adds a skill to the visual array
  const handleAddSkill = (e) => {
    e?.preventDefault();
    const trimmed = skillInput.trim();
    if (trimmed && !searchSkills.includes(trimmed)) {
      setSearchSkills([...searchSkills, trimmed]);
    }
    setSkillInput("");
  };

  // FACT: Removes a skill from the visual array
  const handleRemoveSkill = (skillToRemove) => {
    setSearchSkills(searchSkills.filter((s) => s !== skillToRemove));
  };

  const handleSearch = () => {
    // If the user typed a skill but forgot to click Add, add it automatically before searching
    let finalSkills = [...searchSkills];
    const trimmedInput = skillInput.trim();
    if (trimmedInput && !finalSkills.includes(trimmedInput)) {
      finalSkills.push(trimmedInput);
      setSearchSkills(finalSkills);
      setSkillInput("");
    }

    setPage(1);
    setAppliedQuery(finalSkills.join(","));
  };

  const handleClear = () => {
    setSearchSkills([]);
    setSkillInput("");
    setAppliedQuery("");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 font-sans mt-16 sm:mt-20">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors font-bold text-sm uppercase tracking-wide"
        >
          <ArrowLeft size={16} /> Back
        </button>
        {/* Header & Search Bar */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mb-8 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={28} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
            Candidate Database
          </h1>
          <p className="text-slate-500 font-medium mb-8">
            {totalCandidates > 0
              ? `Showing ${totalCandidates} candidates.`
              : "Search our talent pool by specific technical skills."}
          </p>

          <div className="max-w-2xl mx-auto text-left">
            {/* FACT: Skill Chips UI */}
            {searchSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {searchSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1.5 bg-slate-800 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm animate-in fade-in zoom-in duration-200"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-300 hover:text-rose-400 transition-colors p-0.5 rounded-md"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Search Input Controls */}
            <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Type a skill and press Enter..."
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-bold shadow-inner"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="bg-slate-200 text-slate-700 px-6 py-4 rounded-xl font-bold hover:bg-slate-300 transition-colors shrink-0"
                >
                  Add
                </button>

                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={
                    loading || (searchSkills.length === 0 && !skillInput.trim())
                  }
                  className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md shrink-0"
                >
                  Search
                </button>

                {(appliedQuery || searchSkills.length > 0) && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="bg-rose-50 text-rose-600 px-6 py-4 rounded-xl font-bold hover:bg-rose-100 transition-colors border border-rose-100 shrink-0"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : candidates.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800">
              No candidates found
            </h3>
            <p className="text-slate-500 mt-2">
              Try searching for different or broader skills.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {candidates.map((candidate) => (
                <div
                  key={candidate._id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={
                        candidate.profilePicture ||
                        (candidate.gender === "Female" 
                          ? "https://cdn-icons-png.flaticon.com/512/3135/3135768.png"
                          : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png")
                      }
                      alt={candidate.name}
                      className="w-16 h-16 rounded-full object-cover border border-slate-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-lg text-slate-900 line-clamp-1">
                        {candidate.name}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium truncate">
                        <Mail size={12} className="shrink-0" />{" "}
                        {candidate.email}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-end mb-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <Code size={12} /> Top Skills
                      </p>
                      {candidate.matchCount !== undefined && (
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                            candidate.matchCount === candidate.totalSearched
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              : "bg-amber-100 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {candidate.matchCount} / {candidate.totalSearched}{" "}
                          Match
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {candidate.skills?.slice(0, 5).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md border border-slate-200"
                        >
                          {skill}
                        </span>
                      ))}
                      {candidate.skills?.length > 5 && (
                        <span className="px-2 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-md">
                          +{candidate.skills.length - 5}
                        </span>
                      )}
                      {!candidate.skills?.length && (
                        <span className="text-xs text-slate-400 italic">
                          No skills listed
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 line-clamp-3 mb-6 flex-1">
                    {candidate.description ||
                      candidate.resumeData?.description ||
                      "No professional summary provided."}
                  </p>

                  <button
                    onClick={() =>
                      navigate(`/profile/${candidate._id}`, {
                        state: { applicantList: candidates.map((c) => c._id) },
                      })
                    }
                    className="w-full mt-auto flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    View Full Profile <ArrowRight size={16} />
                  </button>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="p-3 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>

                <span className="text-sm font-bold text-slate-700">
                  Page {page} of {totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                  className="p-3 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
