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
                            className="bg-indigo-50 text-indigo-700 text-[10px] px-2.5 py-1 border border-indigo-200 rounded-lg flex items-center gap-1 font-semibold"
                        >
              {course}
                            <button
                                type="button"
                                onClick={() => onRemove(idx)}
                                className="text-red-400 hover:text-red-600 leading-none text-sm"
                            >
                ×
              </button>
            </span>
                    ))}
                </div>
            )}

            {/* Input trigger */}
            <div
                className={`flex items-center gap-2 p-2 border rounded-lg cursor-text transition-all ${
                    open
                        ? "border-indigo-400 ring-2 ring-indigo-100 bg-white"
                        : "border-indigo-200 bg-white hover:border-indigo-300"
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
                    className="flex-1 outline-none text-xs bg-transparent text-indigo-800 placeholder-indigo-300"
                />
                {query && (
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={handleCustomAdd}
                        className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 hover:bg-indigo-100 whitespace-nowrap"
                    >
                        Add "{query}"
                    </button>
                )}
                <span className="text-indigo-300 text-xs select-none">
          {open ? "▴" : "▾"}
        </span>
            </div>

            {/* Dropdown panel */}
            {open && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-indigo-100 rounded-xl shadow-xl z-50 max-h-72 overflow-y-auto">

                    {/* No results state */}
                    {visibleCategories.every((c) => c.courses.length === 0) ? (
                        <div className="px-4 py-3 text-xs text-gray-400 text-center">
                            No matches — press Enter or click{" "}
                            <span className="font-bold text-indigo-600">Add "{query}"</span>{" "}
                            to save it
                        </div>
                    ) : (
                        visibleCategories.map((cat) => {
                            if (cat.courses.length === 0) return null;
                            const isExpanded =
                                query.trim() || expandedCategories.includes(cat.category);

                            return (
                                <div key={cat.category} className="border-b border-gray-50 last:border-0">

                                    {/* Category header */}
                                    <button
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => toggleCategory(cat.category)}
                                        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-indigo-50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wide text-indigo-500 group-hover:text-indigo-700">
                        {cat.category}
                      </span>
                                            <span className="text-[9px] bg-indigo-100 text-indigo-500 px-1.5 py-0.5 rounded-full font-bold">
                        {cat.courses.length}
                      </span>
                                        </div>
                                        <span className="text-indigo-300 text-[10px]">
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
                                                    className="w-full text-left px-5 py-1.5 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-800 transition-colors flex items-center gap-2"
                                                >
                                                    <span className="w-1 h-1 rounded-full bg-indigo-300 flex-shrink-0" />
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