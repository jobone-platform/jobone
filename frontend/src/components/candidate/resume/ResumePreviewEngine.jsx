import React, { useState, useRef, useEffect } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Printer,
  Sparkles,
  FileCheck,
  Check,
  Layout,
  ExternalLink,
} from "lucide-react";
import ResumeDocumentRenderer from "./ResumeTemplates";
import { TEMPLATES } from "./ResumeConstants";

export default function ResumePreviewEngine({
  resumeData,
  template = "classic",
  onTemplateChange,
  onPrint,
  onOpenATSModal,
}) {
  const [zoom, setZoom] = useState(100);
  const [pageCount, setPageCount] = useState(1);
  const previewContainerRef = useRef(null);
  const documentRef = useRef(null);

  // Estimate page count based on rendered content height
  useEffect(() => {
    if (!documentRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Standard A4 height at 96 DPI is approximately 1123px (297mm)
        // With padding, typical single-page content threshold is ~1050px
        const height = entry.contentRect.height;
        const estimated = Math.max(1, Math.ceil(height / 1050));
        setPageCount(estimated);
      }
    });

    observer.observe(documentRef.current);
    return () => observer.disconnect();
  }, [resumeData, template]);

  const handleZoomIn = () => setZoom((prev) => Math.min(150, prev + 10));
  const handleZoomOut = () => setZoom((prev) => Math.max(50, prev - 10));
  const handleResetZoom = () => setZoom(100);

  const currentTemplate = TEMPLATES.find((t) => t.id === template) || TEMPLATES[0];

  return (
    <div className="flex flex-col h-full bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
      {/* Top Floating Control Bar */}
      <div className="px-4 py-2.5 bg-surface-elevated/60 border-b border-border flex items-center justify-between gap-3 shrink-0 backdrop-blur-sm print:hidden">
        {/* Template Quick Indicator & Status */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface border border-border text-xs text-foreground font-medium">
            <Layout className="w-3.5 h-3.5 text-silver" />
            <span>{currentTemplate.name}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-surface/50 text-muted-foreground border border-border/50">
            <FileCheck className="w-3 h-3 text-silver" />
            <span>
              ~{pageCount} {pageCount === 1 ? "page" : "pages"} (A4)
            </span>
          </div>
        </div>

        {/* Zoom & Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Zoom controls */}
          <div className="flex items-center bg-surface border border-border rounded-lg p-0.5 text-xs text-muted-foreground">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              title="Zoom Out (-10%)"
              className="p-1.5 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              title="Reset to 100%"
              className="px-2 py-0.5 font-mono text-[11px] text-foreground hover:bg-surface-elevated rounded transition-colors"
            >
              {zoom}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= 150}
              title="Zoom In (+10%)"
              className="p-1.5 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Print Button */}
          <button
            type="button"
            onClick={onPrint}
            title="Export / Print PDF"
            className="p-2 rounded-lg bg-surface border border-border text-muted-foreground hover:text-foreground hover:border-silver/40 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Live Preview Paper Canvas */}
      <div
        ref={previewContainerRef}
        className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center bg-zinc-950/40 dark:bg-black/50 custom-scrollbar print:p-0 print:bg-white print:overflow-visible"
      >
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
            transition: "transform 0.15s ease-out",
          }}
          className="w-full flex justify-center print:transform-none"
        >
          {/* A4 Sheet Container */}
          <div
            ref={documentRef}
            id="printable-resume"
            className="w-[210mm] min-h-[297mm] bg-white text-zinc-900 rounded-sm shadow-2xl p-[20mm] box-border relative transition-all duration-200 select-text print:shadow-none print:p-[15mm] print:m-0 print:w-full print:rounded-none"
          >
            <ResumeDocumentRenderer resumeData={resumeData} template={template} />
          </div>
        </div>
      </div>

      {/* Footer notice print banner */}
      <div className="px-4 py-2 bg-surface-elevated/40 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground print:hidden">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time WYSIWYG preview</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Click links to verify URLs</span>
          <span>•</span>
          <button
            type="button"
            onClick={onOpenATSModal}
            className="text-silver hover:underline font-medium"
          >
            Check ATS Readiness
          </button>
        </div>
      </div>
    </div>
  );
}

