import React, { useState, useRef, useEffect } from "react";
import {
  Undo2,
  Redo2,
  Printer,
  Sparkles,
  Target,
  RefreshCw,
  Layout,
  Eye,
  Edit3,
  ChevronDown,
  Plus,
  Trash2,
  Copy,
  Check,
  Columns,
  CloudCheck,
  AlertCircle,
  FileText
} from "lucide-react";
import { TEMPLATES } from "./ResumeConstants";

export default function ResumeWorkspaceToolbar({
  title,
  onTitleChange,
  versions = [],
  currentVersionId,
  onSelectVersion,
  onCreateVersion,
  onDeleteVersion,
  saveStatus = "saved", // "saved" | "saving" | "unsaved"
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  selectedTemplate,
  onSelectTemplate,
  atsScore = 0,
  onOpenATSModal,
  onOpenJobMatcher,
  onOpenSyncModal,
  onPrint,
  viewMode = "split", // "split" | "editor" | "preview"
  onViewModeChange,
  syncing = false,
}) {
  const [versionMenuOpen, setVersionMenuOpen] = useState(false);
  const [templateMenuOpen, setTemplateMenuOpen] = useState(false);
  const [newVersionTitle, setNewVersionTitle] = useState("");
  const [showNewVersionInput, setShowNewVersionInput] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const versionRef = useRef(null);
  const templateRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (versionRef.current && !versionRef.current.contains(e.target)) {
        setVersionMenuOpen(false);
        setShowNewVersionInput(false);
      }
      if (templateRef.current && !templateRef.current.contains(e.target)) {
        setTemplateMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreateVersionSubmit = (e) => {
    e.preventDefault();
    if (!newVersionTitle.trim()) return;
    onCreateVersion(newVersionTitle.trim());
    setNewVersionTitle("");
    setShowNewVersionInput(false);
    setVersionMenuOpen(false);
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 80) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    if (score >= 60) return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    return "bg-rose-500/10 text-rose-400 border-rose-500/30";
  };

  const currentTemplateObj = TEMPLATES.find((t) => t.id === selectedTemplate) || TEMPLATES[0];
  const activeVersion = versions.find((v) => v.id === currentVersionId) || { name: "Primary Master" };

  return (
    <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-border shadow-sm print:hidden">
      <div className="max-w-[1920px] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left Section: Document Title & Version Switcher */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-surface-elevated border border-border flex items-center justify-center text-foreground shrink-0">
              <FileText className="w-4 h-4 text-silver" />
            </div>

            {/* Editable Title */}
            {isEditingTitle ? (
              <input
                type="text"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === "Enter" && setIsEditingTitle(false)}
                autoFocus
                className="bg-surface-elevated border border-border rounded px-2.5 py-1 text-sm font-semibold text-foreground focus:outline-none focus:border-silver/60 w-48 sm:w-64"
                placeholder="Resume Document Title"
              />
            ) : (
              <div
                onClick={() => setIsEditingTitle(true)}
                title="Click to rename resume"
                className="group flex items-center gap-1.5 cursor-pointer max-w-[200px] sm:max-w-[280px]"
              >
                <span className="text-sm font-semibold text-foreground truncate group-hover:text-silver transition-colors">
                  {title || "Untitled Resume"}
                </span>
                <Edit3 className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-border hidden sm:block" />

          {/* Multi-Version Selector Dropdown */}
          <div className="relative" ref={versionRef}>
            <button
              type="button"
              onClick={() => setVersionMenuOpen(!versionMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-elevated hover:bg-surface-elevated/80 border border-border text-xs text-muted-foreground hover:text-foreground transition-all"
              title="Manage Resume Versions & Variations"
            >
              <Copy className="w-3 h-3 text-silver" />
              <span className="font-medium max-w-[120px] truncate">{activeVersion.name}</span>
              <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
            </button>

            {versionMenuOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-64 rounded-xl bg-surface-elevated border border-border shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                  Resume Variations ({versions.length})
                </div>
                <div className="max-h-56 overflow-y-auto space-y-1 my-1 pr-1 custom-scrollbar">
                  {versions.map((ver) => (
                    <div
                      key={ver.id}
                      className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        ver.id === currentVersionId
                          ? "bg-silver/15 text-foreground font-semibold"
                          : "text-muted-foreground hover:bg-surface hover:text-foreground"
                      }`}
                      onClick={() => {
                        onSelectVersion(ver.id);
                        setVersionMenuOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {ver.id === currentVersionId && <Check className="w-3.5 h-3.5 text-silver shrink-0" />}
                        <span className="truncate">{ver.name}</span>
                      </div>
                      {versions.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete variation "${ver.name}"?`)) {
                              onDeleteVersion(ver.id);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition-opacity"
                          title="Delete version"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-border mt-1">
                  {showNewVersionInput ? (
                    <form onSubmit={handleCreateVersionSubmit} className="space-y-2">
                      <input
                        type="text"
                        value={newVersionTitle}
                        onChange={(e) => setNewVersionTitle(e.target.value)}
                        placeholder="e.g. Senior Frontend Tailored"
                        autoFocus
                        className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-silver/60"
                      />
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setShowNewVersionInput(false)}
                          className="px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-2.5 py-1 rounded bg-silver text-black font-semibold text-xs hover:bg-white"
                        >
                          Create
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowNewVersionInput(true)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-silver hover:bg-surface transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Duplicate as New Version</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Autosave Status Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-muted-foreground">
            {saveStatus === "saving" ? (
              <span className="flex items-center gap-1 text-silver">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Saving...</span>
              </span>
            ) : saveStatus === "unsaved" ? (
              <span className="flex items-center gap-1 text-amber-400">
                <AlertCircle className="w-3 h-3" />
                <span>Unsaved changes</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-muted-foreground/80">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Saved locally</span>
              </span>
            )}
          </div>
        </div>

        {/* Center Section: History (Undo/Redo) & Template Selector */}
        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <div className="flex items-center bg-surface-elevated border border-border rounded-lg p-0.5">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className="p-1.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-3.5 bg-border my-auto" />
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              className="p-1.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Template Selector Dropdown */}
          <div className="relative" ref={templateRef}>
            <button
              type="button"
              onClick={() => setTemplateMenuOpen(!templateMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface-elevated/80 border border-border text-xs text-foreground font-medium transition-all"
            >
              <Layout className="w-3.5 h-3.5 text-silver" />
              <span>{currentTemplateObj.name}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {templateMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-60 rounded-xl bg-surface-elevated border border-border shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  ATS-Optimized Templates
                </div>
                <div className="space-y-1 mt-1">
                  {TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => {
                        onSelectTemplate(tpl.id);
                        setTemplateMenuOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex flex-col gap-0.5 ${
                        selectedTemplate === tpl.id
                          ? "bg-silver/15 text-foreground font-semibold"
                          : "text-muted-foreground hover:bg-surface hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{tpl.name}</span>
                        {selectedTemplate === tpl.id && <Check className="w-3.5 h-3.5 text-silver" />}
                      </div>
                      <span className="text-[10px] text-muted-foreground/80 font-normal">
                        {tpl.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: ATS Score, Job Match, View Mode & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* ATS Score Button */}
          <button
            type="button"
            onClick={onOpenATSModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] ${getScoreBadgeColor(
              atsScore
            )}`}
            title="Real-time ATS Score & Optimization Engine"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>ATS: {atsScore}/100</span>
          </button>

          {/* Job Matcher Button */}
          <button
            type="button"
            onClick={onOpenJobMatcher}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface-elevated/80 border border-border text-xs text-foreground font-medium transition-all hover:border-silver/50"
            title="Compare against Job Description keywords"
          >
            <Target className="w-3.5 h-3.5 text-silver" />
            <span className="hidden sm:inline">Job Match</span>
          </button>

          {/* View Mode Switcher (Desktop) */}
          <div className="hidden md:flex items-center bg-surface-elevated border border-border rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => onViewModeChange("editor")}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === "editor"
                  ? "bg-silver/20 text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Editor Only"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("split")}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === "split"
                  ? "bg-silver/20 text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Split View"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("preview")}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === "preview"
                  ? "bg-silver/20 text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Preview Only"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-border hidden sm:block" />

          {/* Sync to Profile */}
          <button
            type="button"
            onClick={onOpenSyncModal}
            disabled={syncing}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface-elevated/80 border border-border text-xs text-foreground font-medium transition-all hover:border-silver/40 disabled:opacity-50"
            title="Sync changes to JobOne Profile Dossier"
          >
            {syncing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CloudCheck className="w-3.5 h-3.5 text-silver" />
            )}
            <span>Sync Profile</span>
          </button>

          {/* Export / Print Button */}
          <button
            type="button"
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-silver transition-all shadow-sm active:scale-95"
            title="Export as PDF or Print"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
}

