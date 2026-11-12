import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Loader2,
  Code,
  Mail,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Sparkles,
  User,
  ExternalLink,
  SlidersHorizontal,
  LayoutGrid,
  LayoutList,
  Phone,
  Briefcase,
  Award,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "../config/api";
import EmployerLayout from "../components/employer/EmployerLayout";

const POPULAR_SKILLS = [
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "Next.js",
  "Tailwind CSS",
  "AWS",
  "Docker",
  "PostgreSQL",
  "MongoDB",
  "Figma",
  "DevOps",
  "Product Management",
];

export default function Candidates() {
  const navigate = useNavigate();

  // Search state
  const [searchSkills, setSearchSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // "grid" vs "table"

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCandidates, setTotalCandidates] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchCandidates = async () => {
      setLoading(true);
      try {
        const stored = localStorage.getItem("employerInfo");
        const token = stored ? JSON.parse(stored).token : null;

        const { data } = await axios.get(
          `${API_BASE_URL}/employer/search-candidates?skills=${encodeURIComponent(
            appliedQuery
          )}&page=${page}&limit=18`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }
        );

        setCandidates(data.candidates || []);
        setTotalPages(data.totalPages || 1);
        setTotalCandidates(data.totalCandidates || 0);
      } catch (error) {
        if (
          axios.isCancel(error) ||
          error.name === "CanceledError" ||
          error.name === "AbortError"
        ) {
          return;
        }
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
    return () => {
      controller.abort();
    };
  }, [page, appliedQuery]);

  const handleAddSkill = (skillToAdd) => {
    const target = (skillToAdd || skillInput).trim();
    if (target && !searchSkills.some((s) => s.toLowerCase() === target.toLowerCase())) {
      setSearchSkills([...searchSkills, target]);
    }
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSearchSkills(searchSkills.filter((s) => s !== skillToRemove));
  };

  const handleSearch = () => {
    let finalSkills = [...searchSkills];
    const trimmedInput = skillInput.trim();
    if (
      trimmedInput &&
      !finalSkills.some((s) => s.toLowerCase() === trimmedInput.toLowerCase())
    ) {
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

  const masterList = candidates.map((c) => c._id);

  return (
    <EmployerLayout
      activeTab="candidates"
      title="Candidates"
      breadcrumbs={[
        { label: "Dashboard", path: "/employerdashboard" },
        { label: "Candidates" },
      ]}
    >
      <div className="space-y-6 pb-20">
        {/* HEADER & TALENT SOURCING TITLE */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono tracking-widest text-foreground/50 uppercase">
                Talent Sourcing
              </span>
              <span className="text-foreground/30 font-mono">/</span>
              <span className="text-xs font-mono text-silver uppercase">
                Global Candidate Pool
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-foreground">
              Candidate Database & Skill Search
            </h1>
            <p className="text-xs font-sans text-foreground/50 mt-1">
              Source verified active candidates across the JobOne talent network matching your stack requirements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-xl bg-surface border border-border text-xs font-mono text-foreground">
              Active Talent: <strong className="text-silver">{totalCandidates}</strong>
            </span>
          </div>
        </div>

        {/* SEARCH WORKSPACE CARD */}
        <div className="p-6 rounded-3xl bg-surface border border-border shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-silver" />
              <span className="text-xs font-mono uppercase tracking-wider text-foreground font-bold">
                Skill Query Builder
              </span>
            </div>
            <span className="text-[11px] font-mono text-foreground/50">
              Type keywords or select popular tags below
            </span>
          </div>

          {/* ACTIVE SKILL CHIPS */}
          {searchSkills.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {searchSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-elevated border border-silver/40 text-foreground text-xs font-mono font-bold shadow-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-foreground/40 hover:text-rose-400 transition-colors p-0.5 rounded"
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* INPUT CONTROLS */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40"
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
                placeholder="Type a skill (e.g. React, Python, Product Design) and press Enter..."
                className="w-full pl-10 pr-4 py-2.5 bg-elevated border border-border rounded-xl text-xs font-sans text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-silver transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAddSkill()}
                className="px-4 py-2.5 rounded-xl bg-elevated border border-border text-foreground hover:bg-surface text-xs font-mono transition-colors"
              >
                + Add Tag
              </button>

              <button
                type="button"
                onClick={handleSearch}
                disabled={loading || (searchSkills.length === 0 && !skillInput.trim())}
                className="px-5 py-2.5 rounded-xl bg-foreground text-background font-mono text-xs font-bold hover:bg-silver transition-colors disabled:opacity-50 shadow-sm"
              >
                Search Talent
              </button>

              {(appliedQuery || searchSkills.length > 0) && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-mono transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* POPULAR SKILL SUGGESTIONS */}
          <div className="pt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono text-foreground/40 mr-1">Popular:</span>
            {POPULAR_SKILLS.map((popSkill) => {
              const isSelected = searchSkills.some(
                (s) => s.toLowerCase() === popSkill.toLowerCase()
              );
              return (
                <button
                  key={popSkill}
                  type="button"
                  disabled={isSelected}
                  onClick={() => {
                    handleAddSkill(popSkill);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-colors border ${
                    isSelected
                      ? "bg-elevated/40 text-foreground/30 border-border cursor-not-allowed"
                      : "bg-elevated hover:bg-surface border-border text-foreground/70 hover:text-foreground hover:border-silver/40"
                  }`}
                >
                  +{popSkill}
                </button>
              );
            })}
          </div>
        </div>

        {/* RESULTS HEADER & VIEW SWITCHER */}
        <div className="flex items-center justify-between gap-4">
          <div className="text-xs font-mono text-foreground/60">
            {appliedQuery ? (
              <>
                Filtered by: <span className="text-silver font-bold">{appliedQuery}</span> &bull;{" "}
                {totalCandidates} match{totalCandidates === 1 ? "" : "es"}
              </>
            ) : (
              <>Showing all verified candidates ({totalCandidates})</>
            )}
          </div>

          <div className="flex items-center p-1 rounded-xl bg-surface border border-border">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === "grid"
                  ? "bg-elevated text-foreground shadow-sm"
                  : "text-foreground/50 hover:text-foreground"
              }`}
              title="Grid View"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === "table"
                  ? "bg-elevated text-foreground shadow-sm"
                  : "text-foreground/50 hover:text-foreground"
              }`}
              title="Table View"
            >
              <LayoutList size={14} />
            </button>
          </div>
        </div>

        {/* CANDIDATES PRESENTATION */}
        {loading ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-silver mb-3" size={32} />
            <p className="text-xs font-mono tracking-widest text-foreground/50 uppercase">
              Searching Candidate Database...
            </p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="p-16 rounded-3xl bg-surface border border-border text-center">
            <User size={36} className="mx-auto text-foreground/30 mb-3" />
            <h3 className="text-lg font-display font-bold text-foreground">
              No matching candidates found
            </h3>
            <p className="text-xs font-sans text-foreground/50 max-w-sm mx-auto mt-1 mb-6">
              Try removing some skills to broaden your search criteria across our talent network.
            </p>
            <button
              onClick={handleClear}
              className="px-4 py-2 rounded-xl bg-elevated border border-border text-xs font-mono text-foreground hover:bg-surface transition-colors"
            >
              Clear Search Query
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidates.map((candidate) => (
              <div
                key={candidate._id}
                className="p-5 rounded-2xl bg-surface border border-border hover:border-silver/40 transition-all flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div>
                  {/* Top info */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={
                          candidate.profilePicture ||
                          (candidate.gender === "Female"
                            ? "https://cdn-icons-png.flaticon.com/512/3135/3135768.png"
                            : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png")
                        }
                        alt={candidate.name}
                        className="w-12 h-12 rounded-xl object-cover border border-border bg-elevated shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className="font-display font-bold text-base text-foreground truncate">
                          {candidate.name}
                        </h3>
                        <p className="text-xs font-mono text-foreground/50 truncate flex items-center gap-1 mt-0.5">
                          <Mail size={12} className="shrink-0" /> {candidate.email}
                        </p>
                      </div>
                    </div>

                    {candidate.matchCount !== undefined && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
                        {candidate.matchCount}/{candidate.totalSearched} Match
                      </span>
                    )}
                  </div>

                  {/* Skills Pills */}
                  <div className="space-y-1.5 mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-foreground/40 block">
                      Key Competencies:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills?.slice(0, 5).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-elevated border border-border text-[10px] font-mono text-foreground/80"
                        >
                          {skill}
                        </span>
                      ))}
                      {candidate.skills?.length > 5 && (
                        <span className="px-2 py-0.5 rounded-md bg-elevated text-foreground/40 text-[10px] font-mono">
                          +{candidate.skills.length - 5}
                        </span>
                      )}
                      {!candidate.skills?.length && (
                        <span className="text-[11px] font-sans text-foreground/40 italic">
                          No skills listed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description Bio */}
                  <p className="text-xs font-sans text-foreground/70 line-clamp-2 leading-relaxed">
                    {candidate.description ||
                      candidate.resumeData?.description ||
                      "Candidate summary not yet provided."}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-border">
                  <button
                    onClick={() =>
                      navigate(`/profile/${candidate._id}`, {
                        state: { applicantList: masterList },
                      })
                    }
                    className="w-full py-2.5 rounded-xl bg-foreground text-background font-mono text-xs font-bold hover:bg-silver transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    View Full Profile Dossier <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* TABLE VIEW */
          <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="bg-elevated/70 border-b border-border">
                    <th className="p-4 font-mono text-[11px] text-foreground/60 uppercase tracking-widest">
                      Candidate
                    </th>
                    <th className="p-4 font-mono text-[11px] text-foreground/60 uppercase tracking-widest">
                      Contact
                    </th>
                    <th className="p-4 font-mono text-[11px] text-foreground/60 uppercase tracking-widest">
                      Skills
                    </th>
                    <th className="p-4 font-mono text-[11px] text-foreground/60 uppercase tracking-widest">
                      Match Score
                    </th>
                    <th className="p-4 font-mono text-[11px] text-foreground/60 uppercase tracking-widest text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {candidates.map((candidate) => (
                    <tr key={candidate._id} className="hover:bg-elevated/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              candidate.profilePicture ||
                              (candidate.gender === "Female"
                                ? "https://cdn-icons-png.flaticon.com/512/3135/3135768.png"
                                : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png")
                            }
                            alt={candidate.name}
                            className="w-9 h-9 rounded-xl object-cover border border-border bg-elevated shrink-0"
                          />
                          <span className="font-display font-bold text-sm text-foreground">
                            {candidate.name}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 font-mono text-foreground/70">
                        <div>{candidate.email}</div>
                        {candidate.phone && (
                          <div className="text-foreground/40">{candidate.phone}</div>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {candidate.skills?.slice(0, 3).map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-elevated border border-border text-[10px] font-mono text-foreground/70"
                            >
                              {s}
                            </span>
                          ))}
                          {candidate.skills?.length > 3 && (
                            <span className="text-[10px] font-mono text-foreground/40">
                              +{candidate.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4 font-mono">
                        {candidate.matchCount !== undefined ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            {candidate.matchCount}/{candidate.totalSearched}
                          </span>
                        ) : (
                          <span className="text-foreground/40 text-[10px]">&mdash;</span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() =>
                            navigate(`/profile/${candidate._id}`, {
                              state: { applicantList: masterList },
                            })
                          }
                          className="px-3 py-1.5 rounded-lg bg-foreground text-background font-mono text-xs font-bold hover:bg-silver inline-flex items-center gap-1"
                        >
                          Profile <ChevronRight size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="p-2.5 rounded-xl border border-border bg-surface text-foreground hover:bg-elevated disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-xs font-mono text-foreground/70 px-3">
              Page <strong className="text-foreground">{page}</strong> of{" "}
              <strong className="text-foreground">{totalPages}</strong>
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="p-2.5 rounded-xl border border-border bg-surface text-foreground hover:bg-elevated disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </EmployerLayout>
  );
}
