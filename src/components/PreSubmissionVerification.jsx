import React, { useState } from 'react';
import { 
  FileCheck2, 
  AlertCircle, 
  Check, 
  ExternalLink, 
  Scale, 
  Search, 
  Sparkles, 
  FileText, 
  RotateCcw, 
  CheckCircle2, 
  Edit3, 
  X, 
  Sliders,
  Cpu,
  Download,
  Eye,
  ArrowRight
} from 'lucide-react';
import { PRE_SUBMISSION_DOCUMENT } from '../data/mockData';

export default function PreSubmissionVerification() {
  const [documentState, setDocumentState] = useState(PRE_SUBMISSION_DOCUMENT);
  const [selectedMismatchId, setSelectedMismatchId] = useState('mismatch-date');
  const [isScanning, setIsScanning] = useState(false);
  const [manualEditValue, setManualEditValue] = useState('');
  const [isEditingManually, setIsEditingManually] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const selectedMismatch = documentState.mismatches.find(m => m.id === selectedMismatchId) || documentState.mismatches[0];

  // Run or re-run the verification scan
  const handleTriggerScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 800);
  };

  // Accept source suggestion
  const handleAcceptSource = (mismatchId) => {
    const mismatch = documentState.mismatches.find(m => m.id === mismatchId);
    if (!mismatch) return;

    setDocumentState(prev => {
      const updatedMismatches = prev.mismatches.map(m => {
        if (m.id === mismatchId) {
          return { ...m, status: 'accepted' };
        }
        return m;
      });

      const updatedClauses = prev.clauses.map(clause => {
        if (clause.mismatchId === mismatchId) {
          return {
            ...clause,
            mismatchText: mismatch.sourceValue
          };
        }
        return clause;
      });

      return {
        ...prev,
        clauses: updatedClauses,
        mismatches: updatedMismatches
      };
    });
    setIsEditingManually(false);
  };

  // Ignore flag (Lawyer discretion)
  const handleIgnoreFlag = (mismatchId) => {
    setDocumentState(prev => ({
      ...prev,
      mismatches: prev.mismatches.map(m => {
        if (m.id === mismatchId) {
          return { ...m, status: 'ignored' };
        }
        return m;
      })
    }));
    setIsEditingManually(false);
  };

  // Submit manual edit
  const handleSaveManualEdit = (mismatchId) => {
    if (!manualEditValue.trim()) return;

    setDocumentState(prev => {
      const updatedMismatches = prev.mismatches.map(m => {
        if (m.id === mismatchId) {
          return { ...m, status: 'edited', customValue: manualEditValue };
        }
        return m;
      });

      const updatedClauses = prev.clauses.map(clause => {
        if (clause.mismatchId === mismatchId) {
          return {
            ...clause,
            mismatchText: manualEditValue
          };
        }
        return clause;
      });

      return {
        ...prev,
        clauses: updatedClauses,
        mismatches: updatedMismatches
      };
    });
    setIsEditingManually(false);
  };

  // Reset to initial document state
  const handleReset = () => {
    setDocumentState(PRE_SUBMISSION_DOCUMENT);
    setSelectedMismatchId('mismatch-date');
    setIsEditingManually(false);
    setManualEditValue('');
  };

  const pendingCount = documentState.mismatches.filter(m => m.status === 'pending').length;
  const resolvedCount = documentState.mismatches.length - pendingCount;

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="badge-tag badge-primary flex items-center gap-1">
                <FileCheck2 className="w-3.5 h-3.5 text-[var(--primary)]" />
                Feature 4
              </span>
              <span className="text-xs font-mono font-bold text-[var(--primary-dark)]">
                Nebius Token Factory Rerank API + Nemotron Super
              </span>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
              Pre-Submission Verification
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
              <strong>What it does:</strong> Before a draft is sent out, Belaw checks line by line whether client names, dates, amounts, and factual statements match the original case files. Inconsistencies are highlighted in red with source citations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerScan}
              disabled={isScanning}
              className="btn-primary text-xs flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              {isScanning ? 'Reranking Case Files...' : 'Run Verification Scan'}
            </button>
            <button
              onClick={handleReset}
              className="btn-secondary text-xs flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[var(--primary)]" />
              Reset Draft
            </button>
          </div>
        </div>

        {/* The Key Legal Principle Banner (Prominently Required) */}
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-amber-50 via-[var(--cream-100)] to-amber-50 border border-amber-300 flex items-start gap-3 shadow-xs">
          <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-[var(--primary-deep)] uppercase tracking-wider flex items-center gap-1.5">
              Core Legal Design Principle
            </div>
            <p className="text-sm font-serif font-bold text-[var(--text-primary)] mt-0.5">
              "Belaw does not say 'This document is correct.' It only says 'I found something that may not match your source.' Final judgment belongs to the lawyer."
            </p>
            <div className="text-[11px] text-[var(--text-secondary)] mt-1">
              Automated Rerank retrieval over private case repository. All decisions remain strictly with counsel.
            </div>
          </div>
        </div>
      </div>

      {/* Main Verification Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Interactive Legal Draft Document (7 cols) */}
        <div className="lg:col-span-7 space-y-4">

          <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)] shadow-xs">
            
            {/* Document Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4 mb-4">
              <div>
                <span className="text-[10px] font-mono text-[var(--primary-deep)] font-bold uppercase tracking-wider">
                  Draft Instrument Review
                </span>
                <h2 className="font-serif text-base font-bold text-[var(--text-primary)]">
                  {documentState.title}
                </h2>
                <div className="text-[11px] text-[var(--text-secondary)] flex items-center gap-2 mt-0.5">
                  <span>{documentState.matterId}</span>
                  <span>•</span>
                  <span>{documentState.version}</span>
                </div>
              </div>

              {/* Status pill */}
              <div className="text-right">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono ${
                  pendingCount > 0 
                    ? 'bg-red-100 text-red-700 border border-red-200' 
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}>
                  {pendingCount > 0 ? (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                      {pendingCount} Flagged Mismatch{pendingCount > 1 ? 'es' : ''}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      All Mismatches Resolved
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Document Clauses Text */}
            <div className="p-6 rounded-xl bg-[var(--white)] border border-[var(--border-strong)] font-serif text-sm leading-relaxed text-[var(--text-primary)] space-y-6 shadow-xs">
              
              {documentState.clauses.map((clause, idx) => {
                const mismatch = documentState.mismatches.find(m => m.id === clause.mismatchId);
                const isSelected = selectedMismatchId === clause.mismatchId;
                const isPending = mismatch?.status === 'pending';
                const isResolved = mismatch?.status === 'accepted' || mismatch?.status === 'edited';

                return (
                  <div key={clause.id} className="space-y-1.5">
                    <div className="text-xs font-sans font-bold text-[var(--primary-deep)]">
                      Section {idx + 1}. {clause.title}
                    </div>

                    <p>
                      {clause.content}

                      {/* Flagged or resolved item */}
                      {clause.hasMismatch && mismatch && (
                        <span 
                          onClick={() => {
                            setSelectedMismatchId(clause.mismatchId);
                            setIsEditingManually(false);
                          }}
                          className={`inline-block transition-all cursor-pointer ${
                            isPending
                              ? 'mismatch-highlight animate-pulseRedAlert'
                              : isResolved
                              ? 'bg-emerald-100 border-b-2 border-emerald-500 text-emerald-950 font-bold px-1.5 py-0.5 rounded'
                              : 'bg-stone-100 text-stone-600 line-through px-1 py-0.5 rounded'
                          } ${isSelected ? 'ring-2 ring-[var(--primary)]' : ''}`}
                          title={`Click to inspect Nebius citation: ${mismatch.type}`}
                        >
                          {clause.mismatchText}
                          {isPending && (
                            <span className="ml-1 text-[10px] font-sans font-bold bg-red-600 text-white px-1 py-0.2 rounded-full inline-flex items-center">
                              ⚠ Mismatch
                            </span>
                          )}
                          {isResolved && (
                            <span className="ml-1 text-[10px] font-sans font-bold text-emerald-700">
                              ✓
                            </span>
                          )}
                        </span>
                      )}

                      {clause.postContent}
                    </p>
                  </div>
                );
              })}

            </div>

            {/* Footer action bar */}
            <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <span className="text-xs text-[var(--text-secondary)]">
                Click any highlighted text above to inspect source citations.
              </span>
              <button
                onClick={() => setShowExportModal(true)}
                className="btn-primary text-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export Verified Audit Report
              </button>
            </div>

          </div>

          {/* Quick Mismatch List Navigator */}
          <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)]">
            <span className="text-xs font-bold text-[var(--text-primary)] block mb-2">
              Verification Checkpoints ({resolvedCount}/{documentState.mismatches.length} Completed):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {documentState.mismatches.map((m) => {
                const isSelected = selectedMismatchId === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedMismatchId(m.id);
                      setIsEditingManually(false);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected 
                        ? 'bg-[var(--white)] border-[var(--primary)] ring-1 ring-[var(--primary-light)]' 
                        : 'bg-[var(--cream-100)] border-[var(--border-subtle)] hover:bg-[var(--cream-200)]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[var(--text-primary)] truncate">
                        {m.type}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        m.status === 'pending' 
                          ? 'bg-red-100 text-red-700' 
                          : m.status === 'accepted' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-stone-200 text-stone-600'
                      }`}>
                        {m.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[var(--text-secondary)] mt-1 truncate">
                      Draft: <span className="text-red-700 font-semibold">{m.draftValue}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Nebius Token Factory Rerank Inspector & Lawyer Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">

          <div className="p-6 rounded-2xl bg-[var(--surface)] border-2 border-[var(--primary)] shadow-sm space-y-4">
            
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div>
                <span className="badge-tag badge-primary text-[10px] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[var(--primary)]" />
                  Nebius Rerank Inspector
                </span>
                <h3 className="font-serif text-base font-bold text-[var(--text-primary)] mt-1">
                  {selectedMismatch.type}
                </h3>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-[var(--text-muted)] block">Rerank Score</span>
                <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {selectedMismatch.rerankScore}
                </span>
              </div>
            </div>

            {/* Side-by-side comparison */}
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-800 block mb-0.5">
                  Draft Value (Unverified):
                </span>
                <div className="font-mono font-bold text-red-900 text-sm">
                  "{selectedMismatch.draftValue}"
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 block mb-0.5">
                  Original Case File Value (Verified):
                </span>
                <div className="font-mono font-bold text-emerald-950 text-sm">
                  "{selectedMismatch.sourceValue}"
                </div>
              </div>
            </div>

            {/* Citation & Source Snippet */}
            <div className="p-3.5 rounded-xl bg-[var(--cream-100)] border border-[var(--border-strong)] space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-primary)]">
                <span className="flex items-center gap-1.5 text-[var(--primary-deep)]">
                  <FileText className="w-3.5 h-3.5 text-[var(--primary)]" />
                  Source Citation:
                </span>
                <span className="text-[11px] font-mono bg-[var(--white)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
                  {selectedMismatch.sourceDoc}
                </span>
              </div>
              <div className="text-[11px] text-[var(--text-secondary)] font-mono">
                {selectedMismatch.sourcePage}
              </div>
              <blockquote className="p-2.5 rounded-lg bg-[var(--white)] border border-[var(--border-subtle)] font-serif text-xs italic text-[var(--text-primary)] leading-relaxed">
                {selectedMismatch.sourceSnippet}
              </blockquote>
              <p className="text-[11px] text-[var(--text-secondary)]">
                {selectedMismatch.explanation}
              </p>
            </div>

            {/* Lawyer Discretion Actions: Accept / Edit / Ignore */}
            <div className="pt-2 border-t border-[var(--border-subtle)] space-y-3">
              <span className="text-xs font-bold text-[var(--text-primary)] block">
                Lawyer Action & Adjudication:
              </span>

              {isEditingManually ? (
                <div className="p-3 rounded-xl bg-[var(--white)] border border-[var(--primary)] space-y-2 animate-fadeIn">
                  <label className="text-[11px] font-semibold text-[var(--text-primary)] block">
                    Custom Manual Entry:
                  </label>
                  <input
                    type="text"
                    value={manualEditValue}
                    onChange={(e) => setManualEditValue(e.target.value)}
                    placeholder="Enter corrected value..."
                    className="w-full px-3 py-1.5 rounded-lg bg-[var(--cream-50)] border border-[var(--border-strong)] text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => setIsEditingManually(false)}
                      className="btn-secondary text-xs py-1 px-2.5"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveManualEdit(selectedMismatch.id)}
                      className="btn-primary text-xs py-1 px-2.5"
                    >
                      Save Manual Correction
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleAcceptSource(selectedMismatch.id)}
                    className="btn-primary text-xs flex items-center justify-center gap-1 py-2 px-2"
                    title={`Update draft to match case record: ${selectedMismatch.sourceValue}`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Accept Match
                  </button>

                  <button
                    onClick={() => {
                      setManualEditValue(selectedMismatch.sourceValue);
                      setIsEditingManually(true);
                    }}
                    className="btn-secondary text-xs flex items-center justify-center gap-1 py-2 px-2"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </button>

                  <button
                    onClick={() => handleIgnoreFlag(selectedMismatch.id)}
                    className="btn-secondary text-xs flex items-center justify-center gap-1 py-2 px-2 text-stone-600 hover:text-stone-900"
                  >
                    <X className="w-3.5 h-3.5" />
                    Ignore
                  </button>
                </div>
              )}

              {/* Status Note */}
              <div className="text-[11px] text-[var(--text-muted)] text-center italic">
                {selectedMismatch.status === 'accepted' && "✓ Accepted: Draft updated to match official case file."}
                {selectedMismatch.status === 'ignored' && "Ignored: Lawyer exercised discretion to retain draft wording."}
                {selectedMismatch.status === 'edited' && "Edited: Lawyer provided custom wording."}
                {selectedMismatch.status === 'pending' && "Awaiting lawyer action."}
              </div>
            </div>

          </div>

          {/* Technical Telemetry Card */}
          <div className="p-4 rounded-2xl bg-[var(--cream-100)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] space-y-1.5">
            <div className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[var(--primary)]" />
              Retrieval & Verification Engine
            </div>
            <div>• Vector Store: Nebius Token Factory Private Case Repository</div>
            <div>• Comparison Model: Nemotron Super (Semantic Cross-Encoder)</div>
            <div>• Scope Boundary: Read-only access to active Matter #2025-089A only</div>
          </div>

        </div>

      </div>

      {/* Export Audit Certificate Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-[var(--surface)] border-2 border-[var(--primary)] p-6 shadow-modal space-y-4">
            
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                  Pre-Submission Audit Certificate
                </h3>
              </div>
              <button 
                onClick={() => setShowExportModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[var(--cream-100)] border border-[var(--border-subtle)] text-xs space-y-2 font-mono">
              <div>Matter: {documentState.matterId}</div>
              <div>Instrument: {documentState.title}</div>
              <div>Verification Engine: Nebius Rerank API + Nemotron Super</div>
              <div>Timestamp: {new Date().toLocaleString()}</div>
              <div>Resolved Inconsistencies: {resolvedCount} / {documentState.mismatches.length}</div>
              <div>Status: {pendingCount === 0 ? 'READY FOR PARTNER SIGN-OFF' : 'WARNING: PENDING UNREVIEWED FLAGS'}</div>
            </div>

            <p className="text-xs text-[var(--text-secondary)] italic">
              This audit certificate certifies that all dates, corporate entities, amounts, and forum selections have been cross-checked against executed case repository documents.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowExportModal(false)}
                className="btn-primary text-xs"
              >
                Close Certificate
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
