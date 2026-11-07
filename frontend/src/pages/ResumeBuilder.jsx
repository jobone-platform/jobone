import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import axios from "axios";
import CandidateLayout from "../components/candidate/CandidateLayout";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../routes/Context";

// Modular Resume Components
import ResumeWorkspaceToolbar from "../components/candidate/resume/ResumeWorkspaceToolbar";
import ResumeEditorPanel from "../components/candidate/resume/ResumeEditorPanel";
import ResumePreviewEngine from "../components/candidate/resume/ResumePreviewEngine";
import ResumeATSAnalyzerModal from "../components/candidate/resume/ResumeATSAnalyzerModal";
import ResumeJobMatcherModal from "../components/candidate/resume/ResumeJobMatcherModal";
import ResumeSyncModal from "../components/candidate/resume/ResumeSyncModal";
import {
  INITIAL_RESUME_SCHEMA,
  calculateATSScore,
  TEMPLATES,
} from "../components/candidate/resume/ResumeConstants";

// Notification Toast Banner
import { CheckCircle2, AlertCircle, X, Loader2, Sparkles } from "lucide-react";

export default function ResumeBuilder() {
  const { user, token } = useAuth();

  // Active View Mode: 'split' | 'editor' | 'preview'
  const [viewMode, setViewMode] = useState("split");
  // Mobile tab toggle: 'editor' | 'preview'
  const [mobileTab, setMobileTab] = useState("editor");

  // Selected Template
  const [template, setTemplate] = useState("classic");

  // Active Section in Editor
  const [activeSection, setActiveSection] = useState("personal");

  // Modals
  const [isATSModalOpen, setIsATSModalOpen] = useState(false);
  const [isJobMatcherOpen, setIsJobMatcherOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Loading & Saving States
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [saveStatus, setSaveStatus] = useState("saved"); // 'saved' | 'saving' | 'unsaved'
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // Resolve active authentication token and user ID
  const activeToken = useMemo(() => {
    if (token) return token;
    try {
      const stored = JSON.parse(localStorage.getItem("userInfo"));
      return stored?.token || localStorage.getItem("userToken");
    } catch {
      return null;
    }
  }, [token]);

  const resolvedUserId = useMemo(() => {
    if (user?.userId || user?.id || user?.user?.id || user?.user?._id || user?._id) {
      return user.userId || user.id || user.user?.id || user.user?._id || user._id;
    }
    try {
      const stored = JSON.parse(localStorage.getItem("userInfo"));
      return (
        stored?.userId ||
        stored?.id ||
        stored?.user?.id ||
        stored?.user?._id ||
        stored?._id
      );
    } catch {
      return null;
    }
  }, [user]);

  // Version Drafts State
  const [versions, setVersions] = useState([
    {
      id: "master",
      name: "Primary Master",
      updatedAt: new Date().toISOString(),
    },
  ]);
  const [currentVersionId, setCurrentVersionId] = useState("master");

  // Main Resume Document State
  const [resumeData, setResumeData] = useState(() => ({
    ...INITIAL_RESUME_SCHEMA,
    title: "Primary Master",
  }));

  // Undo / Redo History Stack (up to 25 steps)
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);
  const isUndoRedoActionRef = useRef(false);

  const pushToHistory = useCallback((state) => {
    if (isUndoRedoActionRef.current) {
      isUndoRedoActionRef.current = false;
      return;
    }

    const currentHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    currentHistory.push(JSON.parse(JSON.stringify(state)));

    if (currentHistory.length > 25) {
      currentHistory.shift();
    }

    historyRef.current = currentHistory;
    historyIndexRef.current = currentHistory.length - 1;
  }, []);

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      isUndoRedoActionRef.current = true;
      const prevState = historyRef.current[historyIndexRef.current];
      setResumeData(JSON.parse(JSON.stringify(prevState)));
      setSaveStatus("unsaved");
    }
  }, []);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      isUndoRedoActionRef.current = true;
      const nextState = historyRef.current[historyIndexRef.current];
      setResumeData(JSON.parse(JSON.stringify(nextState)));
      setSaveStatus("unsaved");
    }
  }, []);

  // Update Resume Handler
  const handleResumeDataChange = useCallback(
    (updater) => {
      setResumeData((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        pushToHistory(next);
        setSaveStatus("unsaved");
        return next;
      });
    },
    [pushToHistory]
  );

  // LocalStorage Key for this user's versions
  const storageKey = useMemo(() => {
    return resolvedUserId ? `jobone_resume_versions_${resolvedUserId}` : "jobone_resume_versions_guest";
  }, [resolvedUserId]);

  // Load Initial Profile and Version Drafts
  useEffect(() => {
    const initializeResume = async () => {
      setLoading(true);

      // Check localStorage for saved versions
      let savedVersions = null;
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) savedVersions = JSON.parse(raw);
      } catch (err) {
        console.warn("Failed to parse saved versions from localStorage", err);
      }

      if (savedVersions && Array.isArray(savedVersions) && savedVersions.length > 0) {
        setVersions(
          savedVersions.map((v) => ({
            id: v.id,
            name: v.name,
            updatedAt: v.updatedAt,
          }))
        );
        const activeVer = savedVersions[0];
        setCurrentVersionId(activeVer.id);
        setResumeData(activeVer.data);
        if (activeVer.data.template) setTemplate(activeVer.data.template);
        historyRef.current = [JSON.parse(JSON.stringify(activeVer.data))];
        historyIndexRef.current = 0;
        setLoading(false);
        return;
      }

      // If no local versions, load profile from Backend
      if (!resolvedUserId || !activeToken) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get(`${API_BASE_URL}/user/${resolvedUserId}`, {
          headers: { Authorization: `Bearer ${activeToken}` },
        });

        const safeList = (val) => (Array.isArray(val) ? val : []);
        const safeParseArray = (val) => {
          if (Array.isArray(val)) return val;
          if (typeof val === "string") {
            try {
              return JSON.parse(val);
            } catch {
              return [];
            }
          }
          return [];
        };

        const existingResume = data.resumeData || {};

        // Merge backend profile data into ATS resume schema
        const initialDoc = {
          ...INITIAL_RESUME_SCHEMA,
          title: existingResume.title || data.title || `${data.name || "My"} Master Resume`,
          template: existingResume.template || "classic",
          contact: {
            name: existingResume.contact?.name || existingResume.name || data.name || "",
            title:
              existingResume.contact?.title ||
              existingResume.title ||
              data.title ||
              data.headline ||
              "",
            email: existingResume.contact?.email || existingResume.email || data.email || "",
            phone: existingResume.contact?.phone || existingResume.phone || data.phone || "",
            location:
              existingResume.contact?.location ||
              existingResume.location ||
              data.location ||
              "",
            website: existingResume.contact?.website || existingResume.website || "",
            linkedin: existingResume.contact?.linkedin || existingResume.linkedin || "",
            github: existingResume.contact?.github || existingResume.github || "",
            portfolio: existingResume.contact?.portfolio || existingResume.portfolio || "",
          },
          summary: existingResume.summary || data.description || "",
          skills: safeList(
            existingResume.skills?.length
              ? existingResume.skills
              : safeParseArray(data.skills)
          ),
          experience: safeList(
            existingResume.experience?.length
              ? existingResume.experience
              : safeParseArray(data.experience)
          ),
          education: safeList(
            existingResume.education?.length
              ? existingResume.education
              : safeParseArray(data.education)
          ),
          projects: safeList(
            existingResume.projects?.length
              ? existingResume.projects
              : safeParseArray(data.projects)
          ),
          certifications: safeList(
            existingResume.certifications?.length
              ? existingResume.certifications
              : safeParseArray(data.certifications)
          ),
          volunteering: safeList(existingResume.volunteering || data.volunteering || []),
          customSections: safeList(existingResume.customSections || []),
          hiddenSections: safeList(existingResume.hiddenSections || []),
        };

        setResumeData(initialDoc);
        if (initialDoc.template) setTemplate(initialDoc.template);

        const initialVersion = [
          {
            id: "master",
            name: initialDoc.title || "Primary Master",
            data: initialDoc,
            updatedAt: new Date().toISOString(),
          },
        ];

        setVersions(initialVersion);
        setCurrentVersionId("master");
        localStorage.setItem(storageKey, JSON.stringify(initialVersion));

        historyRef.current = [JSON.parse(JSON.stringify(initialDoc))];
        historyIndexRef.current = 0;
      } catch (err) {
        console.error("Failed to load user profile for resume builder:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeResume();
  }, [resolvedUserId, activeToken, storageKey]);

  // Debounced Autosave to localStorage (1000ms debounce)
  useEffect(() => {
    if (loading) return;

    setSaveStatus("saving");
    const timer = setTimeout(() => {
      try {
        let storedVersions = [];
        try {
          const raw = localStorage.getItem(storageKey);
          if (raw) storedVersions = JSON.parse(raw);
        } catch {
          storedVersions = [];
        }

        const now = new Date().toISOString();
        const updatedVersionList = storedVersions.map((v) =>
          v.id === currentVersionId
            ? {
                ...v,
                name: resumeData.title || v.name,
                data: { ...resumeData, template },
                updatedAt: now,
              }
            : v
        );

        // If current version not found in array, add it
        const exists = updatedVersionList.some((v) => v.id === currentVersionId);
        if (!exists) {
          updatedVersionList.push({
            id: currentVersionId,
            name: resumeData.title || "Untitled Resume",
            data: { ...resumeData, template },
            updatedAt: now,
          });
        }

        localStorage.setItem(storageKey, JSON.stringify(updatedVersionList));
        setVersions(
          updatedVersionList.map((v) => ({
            id: v.id,
            name: v.name,
            updatedAt: v.updatedAt,
          }))
        );
        setSaveStatus("saved");
      } catch (err) {
        console.error("Autosave failed", err);
        setSaveStatus("unsaved");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [resumeData, template, currentVersionId, storageKey, loading]);

  // Version Management Actions
  const handleSelectVersion = (versionId) => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const allVersions = JSON.parse(raw);
      const target = allVersions.find((v) => v.id === versionId);
      if (target && target.data) {
        setCurrentVersionId(versionId);
        setResumeData(target.data);
        if (target.data.template) setTemplate(target.data.template);
        historyRef.current = [JSON.parse(JSON.stringify(target.data))];
        historyIndexRef.current = 0;
      }
    } catch (err) {
      console.error("Failed to switch version:", err);
    }
  };

  const handleCreateVersion = (name) => {
    const newId = `ver_${Date.now()}`;
    const newDoc = {
      ...resumeData,
      title: name,
    };

    try {
      const raw = localStorage.getItem(storageKey);
      const allVersions = raw ? JSON.parse(raw) : [];
      const updated = [
        ...allVersions,
        {
          id: newId,
          name,
          data: newDoc,
          updatedAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setVersions(
        updated.map((v) => ({
          id: v.id,
          name: v.name,
          updatedAt: v.updatedAt,
        }))
      );
      setCurrentVersionId(newId);
      setResumeData(newDoc);
      historyRef.current = [JSON.parse(JSON.stringify(newDoc))];
      historyIndexRef.current = 0;

      setFeedback({
        type: "success",
        message: `Created new resume variation "${name}"`,
      });
      setTimeout(() => setFeedback({ type: "", message: "" }), 3500);
    } catch (err) {
      console.error("Failed to create version:", err);
    }
  };

  const handleDeleteVersion = (versionId) => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const allVersions = JSON.parse(raw);
      const filtered = allVersions.filter((v) => v.id !== versionId);
      if (filtered.length === 0) return;

      localStorage.setItem(storageKey, JSON.stringify(filtered));
      setVersions(
        filtered.map((v) => ({
          id: v.id,
          name: v.name,
          updatedAt: v.updatedAt,
        }))
      );

      if (currentVersionId === versionId) {
        const next = filtered[0];
        setCurrentVersionId(next.id);
        setResumeData(next.data);
        if (next.data.template) setTemplate(next.data.template);
        historyRef.current = [JSON.parse(JSON.stringify(next.data))];
        historyIndexRef.current = 0;
      }
    } catch (err) {
      console.error("Failed to delete version:", err);
    }
  };

  // Keyboard Shortcuts (Undo, Redo, Print, Save)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Print: Ctrl+P or Cmd+P
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        window.print();
        return;
      }

      // Save: Ctrl+S or Cmd+S
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setSaveStatus("saved");
        setFeedback({
          type: "success",
          message: "Resume saved locally.",
        });
        setTimeout(() => setFeedback({ type: "", message: "" }), 2500);
        return;
      }

      // Undo: Ctrl+Z (without shift)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "z")
      ) {
        e.preventDefault();
        handleRedo();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Sync to Candidate Profile Dossier
  const handleSyncToProfile = async () => {
    if (!resolvedUserId || !activeToken) {
      setFeedback({
        type: "error",
        message: "You must be signed in to sync your resume to your profile.",
      });
      return;
    }

    setSyncing(true);
    setFeedback({ type: "", message: "" });

    try {
      const skillsFlat = (resumeData.skills || []).map((s) =>
        typeof s === "string" ? s : s.name
      );

      await axios.patch(
        `${API_BASE_URL}/user/${resolvedUserId}`,
        {
          resumeData: {
            ...resumeData,
            template,
          },
          skills: skillsFlat,
          description: resumeData.summary || undefined,
          experience: resumeData.experience || [],
          education: resumeData.education || [],
          projects: resumeData.projects || [],
          certifications: resumeData.certifications || [],
        },
        {
          headers: { Authorization: `Bearer ${activeToken}` },
        }
      );

      setIsSyncModalOpen(false);
      setFeedback({
        type: "success",
        message: "Resume synced successfully to your Candidate Dossier & Profile!",
      });
      setTimeout(() => setFeedback({ type: "", message: "" }), 4000);
    } catch (err) {
      console.error("Failed to sync resume to profile", err);
      setFeedback({
        type: "error",
        message: "Failed to sync to profile. Please try again.",
      });
    } finally {
      setSyncing(false);
    }
  };

  // Add skill from Job Matcher directly into resume
  const handleAddSkillFromMatcher = (newSkill) => {
    if (!newSkill) return;
    const exists = (resumeData.skills || []).some(
      (s) => (typeof s === "string" ? s : s.name).toLowerCase() === newSkill.toLowerCase()
    );
    if (exists) return;

    handleResumeDataChange((prev) => ({
      ...prev,
      skills: [...(prev.skills || []), newSkill],
    }));

    setFeedback({
      type: "success",
      message: `Added "${newSkill}" to your Skills Matrix!`,
    });
    setTimeout(() => setFeedback({ type: "", message: "" }), 3000);
  };

  // Real-time ATS Score calculation
  const atsAnalysis = useMemo(() => {
    return calculateATSScore(resumeData);
  }, [resumeData]);

  return (
    <CandidateLayout>
      <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-background text-foreground">
        {/* Workspace Top Toolbar */}
        <ResumeWorkspaceToolbar
          title={resumeData.title || "My Master Resume"}
          onTitleChange={(newTitle) =>
            handleResumeDataChange((prev) => ({ ...prev, title: newTitle }))
          }
          versions={versions}
          currentVersionId={currentVersionId}
          onSelectVersion={handleSelectVersion}
          onCreateVersion={handleCreateVersion}
          onDeleteVersion={handleDeleteVersion}
          saveStatus={saveStatus}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
          selectedTemplate={template}
          onSelectTemplate={(newTpl) => {
            setTemplate(newTpl);
            handleResumeDataChange((prev) => ({ ...prev, template: newTpl }));
          }}
          atsScore={atsAnalysis.score}
          onOpenATSModal={() => setIsATSModalOpen(true)}
          onOpenJobMatcher={() => setIsJobMatcherOpen(true)}
          onOpenSyncModal={() => setIsSyncModalOpen(true)}
          onPrint={() => window.print()}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          syncing={syncing}
        />

        {/* Feedback / Toast Notification */}
        {feedback.message && (
          <div className="max-w-[1920px] mx-auto w-full px-4 pt-3 print:hidden animate-in fade-in slide-in-from-top-2">
            <div
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs shadow-md ${
                feedback.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-400"
              }`}
            >
              <div className="flex items-center gap-2">
                {feedback.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedback({ type: "", message: "" })}
                className="opacity-70 hover:opacity-100 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Mobile View Toggle Bar (Only visible on small screens) */}
        <div className="md:hidden px-4 pt-3 print:hidden">
          <div className="flex items-center rounded-xl bg-surface-elevated border border-border p-1 text-xs">
            <button
              type="button"
              onClick={() => setMobileTab("editor")}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
                mobileTab === "editor"
                  ? "bg-silver text-black font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Editor Form
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("preview")}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
                mobileTab === "preview"
                  ? "bg-silver text-black font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Live Preview & A4
            </button>
          </div>
        </div>

        {/* Main Workspace Body */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <Loader2 className="w-8 h-8 text-silver animate-spin mb-3" />
            <p className="text-sm font-medium text-foreground">Loading Resume Workspace...</p>
            <p className="text-xs text-muted-foreground mt-1">
              Fetching profile credentials and ATS parsing configuration.
            </p>
          </div>
        ) : (
          <main className="flex-1 max-w-[1920px] w-full mx-auto p-4 sm:p-6 grid gap-6">
            {/* Desktop Layout depending on viewMode */}
            <div
              className={`grid h-full gap-6 ${
                viewMode === "split"
                  ? "grid-cols-1 lg:grid-cols-12"
                  : "grid-cols-1"
              }`}
            >
              {/* Left Column: Editor Panel */}
              <div
                className={`${
                  viewMode === "split"
                    ? "lg:col-span-6 xl:col-span-5 h-[calc(100vh-8.5rem)]"
                    : viewMode === "editor"
                    ? "w-full max-w-4xl mx-auto h-[calc(100vh-8.5rem)]"
                    : "hidden"
                } ${mobileTab === "editor" ? "block" : "hidden md:block"}`}
              >
                <ResumeEditorPanel
                  resumeData={resumeData}
                  onChange={handleResumeDataChange}
                  activeSection={activeSection}
                  onSelectSection={setActiveSection}
                  onOpenATSModal={() => setIsATSModalOpen(true)}
                  onOpenJobMatcher={() => setIsJobMatcherOpen(true)}
                />
              </div>

              {/* Right Column: Live WYSIWYG A4 Preview */}
              <div
                className={`${
                  viewMode === "split"
                    ? "lg:col-span-6 xl:col-span-7 h-[calc(100vh-8.5rem)]"
                    : viewMode === "preview"
                    ? "w-full max-w-5xl mx-auto h-[calc(100vh-8.5rem)]"
                    : "hidden"
                } ${mobileTab === "preview" ? "block" : "hidden md:block"}`}
              >
                <ResumePreviewEngine
                  resumeData={resumeData}
                  template={template}
                  onTemplateChange={(newTpl) => {
                    setTemplate(newTpl);
                    handleResumeDataChange((prev) => ({ ...prev, template: newTpl }));
                  }}
                  onPrint={() => window.print()}
                  onOpenATSModal={() => setIsATSModalOpen(true)}
                />
              </div>
            </div>
          </main>
        )}

        {/* ATS Score & Recommendations Modal */}
        <ResumeATSAnalyzerModal
          isOpen={isATSModalOpen}
          onClose={() => setIsATSModalOpen(false)}
          resumeData={resumeData}
          onNavigateSection={(secId) => {
            setActiveSection(secId);
            setIsATSModalOpen(false);
            if (window.innerWidth < 768) setMobileTab("editor");
          }}
        />

        {/* Job Matcher & Keyword Optimizer Modal */}
        <ResumeJobMatcherModal
          isOpen={isJobMatcherOpen}
          onClose={() => setIsJobMatcherOpen(false)}
          resumeData={resumeData}
          onAddSkill={handleAddSkillFromMatcher}
        />

        {/* Sync to Profile Confirmation Modal */}
        <ResumeSyncModal
          isOpen={isSyncModalOpen}
          onClose={() => setIsSyncModalOpen(false)}
          onConfirm={handleSyncToProfile}
          saving={syncing}
          resumeData={resumeData}
        />
      </div>
    </CandidateLayout>
  );
}
