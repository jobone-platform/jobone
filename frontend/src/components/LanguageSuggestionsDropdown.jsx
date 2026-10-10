import { useState, useRef, useEffect } from "react";

const LANGUAGE_CATEGORIES = [
    {
        category: "Most Common",
        languages: [
            "English",
            "Hindi",
        ],
    },
    {
        category: "Indian Languages",
        languages: [
            "Assamese",
            "Bengali",
            "Bodo",
            "Dogri",
            "Gujarati",
            "Kannada",
            "Kashmiri",
            "Konkani",
            "Maithili",
            "Malayalam",
            "Manipuri",
            "Marathi",
            "Nepali",
            "Odia",
            "Punjabi",
            "Sanskrit",
            "Santali",
            "Sindhi",
            "Tamil",
            "Telugu",
            "Urdu",
        ],
    },
    {
        category: "International Languages",
        languages: [
            "Arabic",
            "Bengali (Bangladesh)",
            "Burmese",
            "Cantonese",
            "Czech",
            "Danish",
            "Dutch",
            "Filipino / Tagalog",
            "Finnish",
            "French",
            "German",
            "Greek",
            "Hebrew",
            "Hungarian",
            "Indonesian",
            "Italian",
            "Japanese",
            "Javanese",
            "Korean",
            "Malay",
            "Mandarin Chinese",
            "Norwegian",
            "Persian / Farsi",
            "Polish",
            "Portuguese",
            "Romanian",
            "Russian",
            "Serbian",
            "Sinhala",
            "Spanish",
            "Swahili",
            "Swedish",
            "Thai",
            "Turkish",
            "Ukrainian",
            "Vietnamese",
            "Yoruba",
            "Zulu",
        ],
    },
];

export default function LanguageSuggestionsDropdown({ languages, onAdd, onRemove }) {
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

    // Auto-expand matching categories when searching
    useEffect(() => {
        if (query.trim()) {
            const matching = LANGUAGE_CATEGORIES.filter((cat) =>
                cat.languages.some(
                    (l) =>
                        l.toLowerCase().includes(query.toLowerCase()) &&
                        !languages.includes(l)
                )
            ).map((cat) => cat.category);
            setExpandedCategories(matching);
        } else {
            setExpandedCategories([]);
        }
    }, [query, languages]);

    const toggleCategory = (category) => {
        setExpandedCategories((prev) =>
            prev.includes(category)
                ? prev.filter((c) => c !== category)
                : [...prev, category]
        );
    };

    const handleSelect = (language) => {
        if (!languages.includes(language)) onAdd(language);
        setQuery("");
    };

    const handleCustomAdd = () => {
        const val = query.trim();
        if (val && !languages.includes(val)) {
            onAdd(val);
            setQuery("");
        }
    };

    const visibleCategories = query.trim()
        ? LANGUAGE_CATEGORIES.map((cat) => ({
            ...cat,
            languages: cat.languages.filter(
                (l) =>
                    l.toLowerCase().includes(query.toLowerCase()) &&
                    !languages.includes(l)
            ),
        })).filter((cat) => cat.languages.length > 0)
        : LANGUAGE_CATEGORIES.map((cat) => ({
            ...cat,
            languages: cat.languages.filter((l) => !languages.includes(l)),
        }));

    return (
        <div ref={wrapRef} className="relative">

            {/* Selected tags */}
            {languages.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                    {languages.map((lang, idx) => (
                        <span
                            key={idx}
                            className="bg-indigo-50 text-indigo-700 text-[10px] px-2.5 py-1 border border-indigo-200 rounded-lg flex items-center gap-1 font-semibold"
                        >
              {lang}
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
                            const firstMatch = visibleCategories[0]?.languages[0];
                            if (firstMatch) handleSelect(firstMatch);
                            else handleCustomAdd();
                        }
                        if (e.key === "Escape") setOpen(false);
                    }}
                    placeholder={
                        languages.length > 0
                            ? "Add more languages..."
                            : "Click to browse or search languages..."
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
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-indigo-100 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
                    {visibleCategories.every((c) => c.languages.length === 0) ? (
                        <div className="px-4 py-3 text-xs text-gray-400 text-center">
                            No matches — press Enter or click{" "}
                            <span className="font-bold text-indigo-600">
                Add "{query}"
              </span>{" "}
                            to save it
                        </div>
                    ) : (
                        visibleCategories.map((cat) => {
                            if (cat.languages.length === 0) return null;
                            const isExpanded =
                                !!query.trim() || expandedCategories.includes(cat.category);

                            return (
                                <div
                                    key={cat.category}
                                    className="border-b border-gray-50 last:border-0"
                                >
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
                        {cat.languages.length}
                      </span>
                                        </div>
                                        <span className="text-indigo-300 text-[10px]">
                      {isExpanded ? "▴" : "▾"}
                    </span>
                                    </button>

                                    {/* Language list */}
                                    {isExpanded && (
                                        <div className="pb-1">
                                            {cat.languages.map((lang) => (
                                                <button
                                                    key={lang}
                                                    type="button"
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={() => handleSelect(lang)}
                                                    className="w-full text-left px-5 py-1.5 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-800 transition-colors flex items-center gap-2"
                                                >
                                                    <span className="w-1 h-1 rounded-full bg-indigo-300 flex-shrink-0" />
                                                    {lang}
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