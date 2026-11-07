import React, { useState } from "react";
import axios from "axios";
import {
  Download,
  FileSpreadsheet,
  Archive,
  Building2,
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Search,
  Loader2,
  Lock,
} from "lucide-react";
import { API_BASE_URL } from "../../config/api";

export default function AdminExportCentre({
  allEmployers = [],
  allJobseekers = [],
  allJobs = [],
  adminInfo = {},
}) {
  const [downloadingType, setDownloadingType] = useState(null);
  const [selectedSingleEmpId, setSelectedSingleEmpId] = useState("");
  const [singleEmpSearch, setSingleEmpSearch] = useState("");
  const [exportHistory, setExportHistory] = useState([]);

  const role = adminInfo?.role || "superAdmin";
  const isSuperAdmin = role === "superAdmin";
  const canExportEmployers = isSuperAdmin || role === "employerAdmin";
  const canExportJobseekers = isSuperAdmin || role === "jobseekerAdmin";

  const triggerDownload = async (url, filename, typeLabel) => {
    setDownloadingType(typeLabel);
    try {
      const token = adminInfo?.token;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Record in session export history
      setExportHistory((prev) => [
        {
          id: `EXP-${Date.now().toString().slice(-6)}`,
          name: filename,
          type: typeLabel,
          timestamp: new Date().toLocaleTimeString(),
          status: "Completed",
        },
        ...prev,
      ]);
    } catch (err) {
      alert(err.response?.data?.message || "Export failed. Please check permissions.");
    } finally {
      setDownloadingType(null);
    }
  };

  const handleExportAll = () => {
    triggerDownload(
      `${API_BASE_URL}/admin/export/all`,
      "JobOne_Platform_DB.zip",
      "Full Database ZIP"
    );
  };

  const handleExportEmployers = () => {
    triggerDownload(
      `${API_BASE_URL}/admin/export/employers`,
      "JobOne_Employers_Jobs.xlsx",
      "Employers XLSX"
    );
  };

  const handleExportJobseekers = () => {
    triggerDownload(
      `${API_BASE_URL}/admin/export/jobseekers`,
      "JobOne_Jobseekers_Jobs.xlsx",
      "Candidates XLSX"
    );
  };

  const handleExportSingleEmployer = () => {
    if (!selectedSingleEmpId) return;
    const emp = allEmployers.find((e) => e._id === selectedSingleEmpId);
    const cleanName = emp?.companyName ? emp.companyName.replace(/\s+/g, "_") : "Employer";
    triggerDownload(
      `${API_BASE_URL}/admin/employers/${selectedSingleEmpId}/export`,
      `JobOne_${cleanName}_Profile.xlsx`,
      "Single Employer XLSX"
    );
  };

  const filteredEmployersList = allEmployers.filter((e) => {
    if (!singleEmpSearch.trim()) return true;
    const q = singleEmpSearch.toLowerCase();
    return (
      (e.companyName || "").toLowerCase().includes(q) ||
      (e.name || "").toLowerCase().includes(q) ||
      (e.email || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ─── Top Control Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--theme-border)]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] flex items-center justify-center text-[var(--theme-accent-silver)]">
              <Download size={18} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-[var(--theme-text)]">
                Executive Export & Reporting Centre
              </h1>
              <p className="text-xs text-[var(--theme-text-muted)]">
                Cryptographically validated data extraction pipelines for offline intelligence and reporting
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] text-xs font-mono text-[var(--theme-text)]">
          <Lock size={13} className="text-[#C0C0C0]" />
          <span>RBAC Export Clearance: {role}</span>
        </div>
      </div>

      {/* ─── Export Pipeline Cards Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Full Database Backup */}
        <div className="p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] flex items-center justify-center text-[var(--theme-text)] mb-3">
              <Archive size={18} />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-sm text-[var(--theme-text)]">
                Platform Master Database Dump
              </h3>
              <span className="px-1.5 py-0.5 rounded font-mono text-[9px] font-bold bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] text-[var(--theme-text)]">
                ZIP
              </span>
            </div>
            <p className="text-xs text-[var(--theme-text-muted)] mt-1 leading-relaxed">
              Consolidated archive containing individual Excel workbooks for Users, Employers, Jobs, Applications, Admins, and Support Contacts.
            </p>
            <div className="mt-3 text-[11px] font-mono text-[var(--theme-text-muted)] space-y-1">
              <div>Scope: 6 platform collections</div>
              <div>Estimated Size: ~250 KB compressed</div>
            </div>
          </div>

          <div>
            {isSuperAdmin ? (
              <button
                type="button"
                disabled={downloadingType === "Full Database ZIP"}
                onClick={handleExportAll}
                className="w-full py-2.5 px-4 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs font-mono font-bold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                {downloadingType === "Full Database ZIP" ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Compressing Collections...</span>
                  </>
                ) : (
                  <>
                    <Download size={14} />
                    <span>Download Master Archive</span>
                  </>
                )}
              </button>
            ) : (
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono text-center">
                SuperAdmin Clearance Required
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Employers Directory */}
        <div className="p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] flex items-center justify-center text-[var(--theme-text)] mb-3">
              <Building2 size={18} />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-sm text-[var(--theme-text)]">
                Employers & Postings Dossier
              </h3>
              <span className="px-1.5 py-0.5 rounded font-mono text-[9px] font-bold bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] text-[var(--theme-text)]">
                XLSX
              </span>
            </div>
            <p className="text-xs text-[var(--theme-text-muted)] mt-1 leading-relaxed">
              Corporate organization profiles, point-of-contact details, verification status, and all active/pending job postings.
            </p>
            <div className="mt-3 text-[11px] font-mono text-[var(--theme-text-muted)] space-y-1">
              <div>Scope: {allEmployers.length} employers • {allJobs.length} jobs</div>
              <div>Sheet count: 2 multi-tab tables</div>
            </div>
          </div>

          <div>
            {canExportEmployers ? (
              <button
                type="button"
                disabled={downloadingType === "Employers XLSX"}
                onClick={handleExportEmployers}
                className="w-full py-2.5 px-4 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] text-xs font-mono font-bold disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                {downloadingType === "Employers XLSX" ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Compiling Spreadsheet...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet size={14} />
                    <span>Download Employers XLSX</span>
                  </>
                )}
              </button>
            ) : (
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono text-center">
                EmployerAdmin Clearance Required
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Candidates Talent Pool */}
        <div className="p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] flex items-center justify-center text-[var(--theme-text)] mb-3">
              <Users size={18} />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-sm text-[var(--theme-text)]">
                Talent Pool & Applicants Register
              </h3>
              <span className="px-1.5 py-0.5 rounded font-mono text-[9px] font-bold bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] text-[var(--theme-text)]">
                XLSX
              </span>
            </div>
            <p className="text-xs text-[var(--theme-text-muted)] mt-1 leading-relaxed">
              Comprehensive talent profiles, verified email accounts, core skill sets, highest degrees, and platform positions.
            </p>
            <div className="mt-3 text-[11px] font-mono text-[var(--theme-text-muted)] space-y-1">
              <div>Scope: {allJobseekers.length} verified candidates</div>
              <div>Format: Microsoft Excel OpenXML</div>
            </div>
          </div>

          <div>
            {canExportJobseekers ? (
              <button
                type="button"
                disabled={downloadingType === "Candidates XLSX"}
                onClick={handleExportJobseekers}
                className="w-full py-2.5 px-4 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] text-xs font-mono font-bold disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                {downloadingType === "Candidates XLSX" ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Compiling Spreadsheet...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet size={14} />
                    <span>Download Candidates XLSX</span>
                  </>
                )}
              </button>
            ) : (
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono text-center">
                JobseekerAdmin Clearance Required
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Single Employer Dossier Export Section ─────────────────────── */}
      {canExportEmployers && (
        <div className="p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs space-y-4">
          <div>
            <h3 className="font-display font-bold text-sm text-[var(--theme-text)]">
              Single-Entity Profile Export
            </h3>
            <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
              Generate a dedicated compliance report for a specific corporate employer
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)]"
              />
              <input
                type="text"
                placeholder="Filter employer by company name or email..."
                value={singleEmpSearch}
                onChange={(e) => setSingleEmpSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs text-[var(--theme-text)] placeholder-[var(--theme-text-muted)] focus:outline-hidden"
              />
            </div>

            <select
              value={selectedSingleEmpId}
              onChange={(e) => setSelectedSingleEmpId(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs font-mono text-[var(--theme-text)] focus:outline-hidden cursor-pointer"
            >
              <option value="">-- Choose Corporate Entity ({filteredEmployersList.length} available) --</option>
              {filteredEmployersList.slice(0, 50).map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.companyName || emp.name} ({emp.email}) - {emp.isApproved}
                </option>
              ))}
            </select>

            <button
              type="button"
              disabled={!selectedSingleEmpId || downloadingType === "Single Employer XLSX"}
              onClick={handleExportSingleEmployer}
              className="px-4 py-2 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs font-mono font-bold hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center justify-center gap-1.5 shadow-xs cursor-pointer shrink-0"
            >
              {downloadingType === "Single Employer XLSX" ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Download size={13} />
              )}
              <span>Export Dossier</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── In-Session Export Activity Roster ───────────────────────────── */}
      {exportHistory.length > 0 && (
        <div className="p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[var(--theme-text-muted)]">
              In-Session Download Activity Log
            </h4>
            <span className="text-[10px] font-mono text-[var(--theme-text-muted)]">
              {exportHistory.length} downloads completed
            </span>
          </div>

          <div className="divide-y divide-[var(--theme-border)] text-xs font-mono">
            {exportHistory.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span className="font-bold text-[var(--theme-text)]">{item.name}</span>
                  <span className="text-[var(--theme-text-muted)]">({item.type})</span>
                </div>
                <div className="text-[var(--theme-text-muted)]">{item.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Compliance Notice Banner ───────────────────────────────────── */}
      <div className="p-4 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs font-mono text-[var(--theme-text-muted)] flex items-start gap-3">
        <ShieldCheck size={18} className="shrink-0 mt-0.5 text-[#C0C0C0]" />
        <p className="leading-relaxed">
          Platform data exports contain sensitive corporate identity filings and candidate contact details. Downloaded files must be processed in compliance with data privacy regulations and internal security standards.
        </p>
      </div>
    </div>
  );
}

