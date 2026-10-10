import { useState, useRef, useEffect } from "react";
import { SKILLS_BY_TITLE } from "../data/skillsByTitle.js";
import { JOB_CATEGORIES } from "./ElasticTitleDropdown.jsx";

// Build a normalised lookup so partial/alternate titles still match
const buildFuzzyMap = () => {
    const map = {};
    JOB_CATEGORIES.forEach((cat) => {
        cat.titles.forEach((title) => {
            map[title.toLowerCase()] = SKILLS_BY_TITLE[title] ?? null;
        });
    });
    return map;
};
const FUZZY_MAP = buildFuzzyMap();

const getSuggestionsForTitle = (jobTitle) => {
    if (!jobTitle?.trim()) return [];

    // 1. Exact match
    if (SKILLS_BY_TITLE[jobTitle]) return SKILLS_BY_TITLE[jobTitle];

    // 2. Case-insensitive exact match
    const lower = jobTitle.toLowerCase();
    if (FUZZY_MAP[lower]) return FUZZY_MAP[lower];

    // 3. Partial match — find the closest title
    const keys = Object.keys(FUZZY_MAP);
    const partialMatch = keys.find(
        (k) => k.includes(lower) || lower.includes(k)
    );
    if (partialMatch && FUZZY_MAP[partialMatch]) return FUZZY_MAP[partialMatch];

    return [];
};

export default function SkillSuggestionsDropdown({ skills, jobTitle, onAdd, onRemove }) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target))
                setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const suggestions = getSuggestionsForTitle(jobTitle);

    const filtered = suggestions.filter(
        (s) =>
            s.toLowerCase().includes(query.toLowerCase()) &&
            !skills.includes(s)
    );

    const handleSelect = (skill) => {
        if (!skills.includes(skill)) onAdd(skill);
        setQuery("");
    };

    const handleCustomAdd = () => {
        const val = query.trim();
        if (val && !skills.includes(val)) {
            onAdd(val);
            setQuery("");
        }
    };

    return (
        <div ref={wrapRef} className="relative">

            {/* Selected skill tags */}
            {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {skills.map((skill, index) => (
                        <div
                            key={index}
                            className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs border border-blue-100 font-semibold"
                        >
                            <span>{skill}</span>
                            <button
                                type="button"
                                onClick={() => onRemove(index)}
                                className="ml-2 hover:text-red-500 leading-none"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Input trigger */}
            <div
                className={`flex items-center gap-2 p-2.5 border rounded-xl cursor-text transition-all ${
                    open
                        ? "border-blue-400 ring-2 ring-blue-100 bg-white"
                        : "border-gray-300 bg-gray-50 hover:border-blue-300"
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
                            if (filtered.length > 0) handleSelect(filtered[0]);
                            else handleCustomAdd();
                        }
                        if (e.key === "Escape") setOpen(false);
                    }}
                    placeholder={
                        !jobTitle?.trim()
                            ? "Enter a job title first..."
                            : skills.length > 0
                                ? "Add more skills..."
                                : "Click to browse or type a skill..."
                    }
                    className="flex-1 outline-none text-sm bg-transparent text-gray-700 placeholder-gray-400"
                />
                {query && (
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={handleCustomAdd}
                        className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 hover:bg-blue-100 whitespace-nowrap"
                    >
                        Add "{query}"
                    </button>
                )}
                <span className="text-gray-400 text-xs select-none">
          {open ? "▴" : "▾"}
        </span>
            </div>

            {/* Dropdown */}
            {open && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">

                    {/* No job title */}
                    {!jobTitle?.trim() ? (
                        <div className="px-4 py-4 text-center">
                            <p className="text-xs text-gray-400">Enter a job title first to get</p>
                            <p className="text-xs font-bold text-blue-500 mt-0.5">
                                relevant skill suggestions
                            </p>
                        </div>

                        /* No results for query */
                    ) : filtered.length === 0 && query ? (
                        <div className="px-4 py-3 text-xs text-gray-400 text-center">
                            No match — press Enter or click{" "}
                            <span className="font-bold text-blue-600">Add "{query}"</span>
                        </div>

                        /* No suggestions for this title */
                    ) : suggestions.length === 0 ? (
                        <div className="px-4 py-3 text-center">
                            <p className="text-xs text-gray-400">No preset skills for</p>
                            <p className="text-xs font-bold text-gray-600">"{jobTitle}"</p>
                            <p className="text-xs text-gray-400 mt-1">Type a skill above and press Add</p>
                        </div>

                        /* Skills list */
                    ) : (
                        <div>
                            <div className="px-3 py-2 border-b border-gray-50 flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wide text-blue-500">
                  Suggested for "{jobTitle}"
                </span>
                                <span className="text-[10px] text-gray-400">
                  {filtered.length} skills
                </span>
                            </div>
                            <div className="p-3 flex flex-wrap gap-2">
                                {filtered.map((skill) => (
                                    <button
                                        key={skill}
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => handleSelect(skill)}
                                        className="px-3 py-1.5 text-xs font-semibold rounded-full border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                                    >
                                        + {skill}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}