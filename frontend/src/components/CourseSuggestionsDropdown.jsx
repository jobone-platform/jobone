    import { useState, useRef, useEffect } from "react";

const COURSE_CATEGORIES = [
    {
        category: "Streams (10+2)",
        courses: [
            "Science (PCM)",
            "Science (PCB)",
            "Science (PCM + Biology)",
            "Commerce",
            "Arts / Humanities",
            "Vocational",
        ],
    },
    {
        category: "Engineering & Technology",
        courses: [
            "B.Tech / B.E.",
            "M.Tech / M.E.",
            "BCA",
            "MCA",
            "B.Sc Computer Science",
            "M.Sc Computer Science",
            "Diploma in Computer Science",
            "Diploma in Electronics",
            "Diploma in Mechanical",
            "Diploma in Civil",
            "Diploma in Electrical",
        ],
    },
    {
        category: "Management & Commerce",
        courses: [
            "MBA",
            "BBA",
            "PGDM",
            "B.Com",
            "M.Com",
            "CA (Chartered Accountant)",
            "CMA",
            "CS (Company Secretary)",
            "CFA",
            "CFP",
            "B.Com Accounting",
            "B.Com Banking",
        ],
    },
    {
        category: "Medical & Health",
        courses: [
            "MBBS",
            "BDS",
            "BAMS",
            "BHMS",
            "B.Pharm",
            "M.Pharm",
            "B.Sc Nursing",
            "GNM Nursing",
            "ANM",
            "DMLT",
            "B.Sc MLT",
            "Physiotherapy (BPT)",
        ],
    },
    {
        category: "Arts & Humanities",
        courses: [
            "BA",
            "MA",
            "B.A. English",
            "B.A. Hindi",
            "B.A. History",
            "B.A. Political Science",
            "B.A. Psychology",
            "B.A. Sociology",
        ],
    },
    {
        category: "Science",
        courses: [
            "B.Sc",
            "M.Sc",
            "B.Sc Physics",
            "B.Sc Chemistry",
            "B.Sc Mathematics",
            "B.Sc Biotechnology",
            "B.Sc Agriculture",
        ],
    },
    {
        category: "Law",
        courses: ["LLB", "LLM", "BA LLB", "BBA LLB"],
    },
    {
        category: "Education",
        courses: ["B.Ed", "M.Ed", "D.El.Ed", "B.P.Ed"],
    },
    {
        category: "Design & Media",
        courses: [
            "B.Des",
            "M.Des",
            "BFA",
            "Mass Communication",
            "Journalism",
            "Animation & VFX",
        ],
    },
    {
        category: "Hotel & Hospitality",
        courses: [
            "BHM (Hotel Management)",
            "Diploma in Hotel Management",
            "Diploma in Culinary Arts",
        ],
    },
    {
        category: "ITI / Vocational",
        courses: [
            "ITI - Electrician",
            "ITI - Fitter",
            "ITI - Welder",
            "ITI - Machinist",
            "ITI - Plumber",
            "ITI - COPA",
            "ITI - Mechanic (Motor Vehicle)",
        ],
    },
    {
        category: "General",
        courses: ["Any Graduate", "Any Post Graduate", "Any Diploma", "Any Stream"],
    },
];

export default function CourseSuggestionsDropdown({ courses, onAdd, onRemove }) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState([]);
    const wrapRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target))
                setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // When searching, auto-expand categories that have matches
    useEffect(() => {
        if (query.trim()) {
            const matchingCategories = COURSE_CATEGORIES.filter((cat) =>
                cat.courses.some(
                    (c) =>
                        c.toLowerCase().includes(query.toLowerCase()) &&
                        !courses.includes(c)
                )
            ).map((cat) => cat.category);
            setExpandedCategories(matchingCategories);
        } else {
            setExpandedCategories([]);
        }
    }, [query]);

    const toggleCategory = (category) => {
        setExpandedCategories((prev) =>
            prev.includes(category)
                ? prev.filter((c) => c !== category)
                : [...prev, category]
        );
    };

    const handleSelect = (course) => {
        if (!courses.includes(course)) onAdd(course);
        setQuery("");
    };

    const handleCustomAdd = () => {
        const val = query.trim();
        if (val && !courses.includes(val)) {
            onAdd(val);
            setQuery("");
        }
    };

    // Filter categories and courses based on search query
    const visibleCategories = query.trim()
        ? COURSE_CATEGORIES.map((cat) => ({
            ...cat,
            courses: cat.courses.filter(
                (c) =>
                    c.toLowerCase().includes(query.toLowerCase()) &&
                    !courses.includes(c)
            ),
        })).filter((cat) => cat.courses.length > 0)
        : COURSE_CATEGORIES.map((cat) => ({
            ...cat,
            courses: cat.courses.filter((c) => !courses.includes(c)),
        }));

    return (
        <div ref={wrapRef} className="relative">

            {/* Selected tags */}
            {courses.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                    {courses.map((course, idx) => (
                        <span
                            key={idx}
                            className="bg-[var(--theme-gold-surface)] text-[var(--theme-gold)] border border-[var(--theme-gold-border)] text-[10px] font-mono px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold"
                        >
              {course}
                            <button
                                type="button"
                                onClick={() => onRemove(idx)}
                                className="text-[var(--theme-text-muted)] hover:text-rose-400 leading-none text-sm cursor-pointer ml-1"
                            >
                ×
              </button>
            </span>
                    ))}
                </div>
            )}

            {/* Input trigger */}
            <div
                className={`flex items-center gap-2 p-2 border rounded-xl cursor-text transition-all ${
                    open
                        ? "border-[var(--theme-gold-border)] ring-1 ring-[var(--theme-gold-border)] bg-[var(--theme-surface-elevated)]"
                        : "border-[var(--theme-border)] bg-[var(--theme-surface-elevated)] hover:border-[var(--theme-gold-border)]"
                }`}
                onClick={() => setOpen(true)}
            >
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setOpen(true)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            // pick first visible result or add custom
                            const firstMatch = visibleCategories[0]?.courses[0];
                            if (firstMatch) handleSelect(firstMatch);
                            else handleCustomAdd();
                        }
                        if (e.key === "Escape") setOpen(false);
                    }}
                    placeholder={
                        courses.length > 0
                            ? "Add more courses..."
                            : "Click to browse or search courses..."
                    }
                    className="flex-1 outline-none text-xs bg-transparent text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] font-mono"
                />
                {query && (
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={handleCustomAdd}
                        className="text-[10px] font-bold text-black bg-[var(--theme-gold)] hover:bg-[var(--theme-gold-bright)] px-2 py-0.5 rounded shadow-sm whitespace-nowrap cursor-pointer transition-colors"
                    >
                        Add "{query}"
                    </button>
                )}
                <span className="text-[var(--theme-text-muted)] text-xs select-none">
          {open ? "▴" : "▾"}
        </span>
            </div>

            {/* Dropdown panel */}
            {open && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl shadow-2xl z-50 max-h-72 overflow-y-auto">

                    {/* No results state */}
                    {visibleCategories.every((c) => c.courses.length === 0) ? (
                        <div className="px-4 py-3 text-xs text-[var(--theme-text-muted)] text-center font-mono">
                            No matches — press Enter or click{" "}
                            <span className="font-bold text-[var(--theme-gold)]">Add "{query}"</span>{" "}
                            to save it
                        </div>
                    ) : (
                        visibleCategories.map((cat) => {
                            if (cat.courses.length === 0) return null;
                            const isExpanded =
                                query.trim() || expandedCategories.includes(cat.category);

                            return (
                                <div key={cat.category} className="border-b border-[var(--theme-border)] last:border-0">

                                    {/* Category header */}
                                    <button
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => toggleCategory(cat.category)}
                                        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[var(--theme-surface-hover)] transition-colors group cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wide text-[var(--theme-gold)] group-hover:text-[var(--theme-gold-bright)] font-mono">
                        {cat.category}
                      </span>
                                            <span className="text-[9px] bg-[var(--theme-gold-surface)] text-[var(--theme-gold)] border border-[var(--theme-gold-border)] px-1.5 py-0.5 rounded-full font-bold font-mono">
                        {cat.courses.length}
                      </span>
                                        </div>
                                        <span className="text-[var(--theme-text-muted)] text-[10px]">
                      {isExpanded ? "▴" : "▾"}
                    </span>
                                    </button>

                                    {/* Course list */}
                                    {isExpanded && (
                                        <div className="pb-1">
                                            {cat.courses.map((course) => (
                                                <button
                                                    key={course}
                                                    type="button"
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={() => handleSelect(course)}
                                                    className="w-full text-left px-5 py-1.5 text-xs text-[var(--theme-text)] hover:bg-[var(--theme-gold-surface)] hover:text-[var(--theme-gold)] transition-colors flex items-center gap-2 cursor-pointer font-mono"
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-gold)] flex-shrink-0" />
                                                    {course}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}