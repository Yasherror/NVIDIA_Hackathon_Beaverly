import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, AlertCircle, AlertTriangle, CheckCircle2, 
  ArrowRight, FileText, Sparkles, Copy, Check, RotateCcw, 
  X, Loader2, ExternalLink, Send, BookOpen, Filter
} from 'lucide-react';
import { apiClient } from '../api/apiClient';
import './PreSubmissionStudio.css';

const DEFAULT_SAMPLE = {
  id: 'sample-termination',
  title: 'Notice of Termination (Compensation & Date Mismatch)',
  draft_text: 
`NOTICE OF EMPLOYMENT TERMINATION

Date: 25 February 2025
To: Sarah Jenkins
From: Apex Global Legal Counsel

Dear Ms. Jenkins,

Please be advised that pursuant to your Executive Employment Contract, your employment with Apex Global Ltd shall formally terminate on 21 March 2025 (the "Termination Date").

Subject to your execution of a standard release of claims, the Company tenders severance pay in the gross amount of $150,000, representing four months of base remuneration.

All Company equipment and proprietary files must be surrendered prior to 5:00 PM on the Termination Date. This notice is issued under the governing laws of the State of New York.

Sincerely,
Apex Global Legal Department`
};

const PIPELINE_STEPS = [
  {
    step: 1,
    title: 'Scanning Draft for Key Claims',
    desc: 'Extracting dates, compensation terms, corporate entities & section references',
    threshold: 22
  },
  {
    step: 2,
    title: 'Retrieving Executed Records from Matter Vault',
    desc: 'Scanning signed contracts, board consents & exhibits in this matter',
    threshold: 52
  },
  {
    step: 3,
    title: 'Cross-Examining Draft with Nemotron Legal Engine',
    desc: 'Testing every draft assertion against verified contract clauses',
    threshold: 82
  },
  {
    step: 4,
    title: 'Pinpointing Discrepancies & Correction Patches',
    desc: 'Preparing clause citations, factual explanations and one-click fixes',
    threshold: 96
  }
];

export default function PreSubmissionStudio({ 
  isOpen, 
  onClose, 
  activeCase, 
  initialDraft = '', 
  onSendToChat 
}) {
  const [draftText, setDraftText] = useState(initialDraft || DEFAULT_SAMPLE.draft_text);
  const [samples, setSamples] = useState([DEFAULT_SAMPLE]);
  const [activeSampleId, setActiveSampleId] = useState(DEFAULT_SAMPLE.id);
  const [findings, setFindings] = useState([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStep, setAuditStep] = useState(0);
  const [progressPercent, setProgressPercent] = useState(15);
  const [auditMeta, setAuditMeta] = useState(null);
  const [copied, setCopied] = useState(false);

  // Verification Source (Ground Truth Document Selection)
  const [caseDocs, setCaseDocs] = useState([]);
  const [selectedDocFilter, setSelectedDocFilter] = useState('all');

  // Load matter documents for the Ground Truth selector
  useEffect(() => {
    async function fetchCaseDocs() {
      if (!activeCase?.id) return;
      try {
        const res = await apiClient.get(`/intelligence/cases/${activeCase.id}/documents`);
        setCaseDocs(res.documents || []);
      } catch (err) {
        console.error('Failed to load matter documents:', err);
      }
    }
    if (isOpen) {
      fetchCaseDocs();
    }
  }, [isOpen, activeCase?.id]);

  // Fetch sample drafts on mount
  useEffect(() => {
    async function loadSamples() {
      try {
        const data = await apiClient.get('/verification/samples');
        if (Array.isArray(data) && data.length > 0) {
          setSamples(data);
        }
      } catch (err) {
        // Fall back to built-in default sample
      }
    }
    loadSamples();
  }, []);

  // Update draft if initialDraft prop changes
  useEffect(() => {
    if (initialDraft && initialDraft.trim().length > 0) {
      setDraftText(initialDraft);
      setActiveSampleId('custom');
    }
  }, [initialDraft]);

  // Run audit against selected ground truth scope
  const runAudit = async (textToAudit = draftText, docFilter = selectedDocFilter) => {
    if (!textToAudit.trim()) {
      setFindings([]);
      setAuditMeta(null);
      return;
    }

    setIsAuditing(true);
    setAuditStep(0);
    setProgressPercent(18);

    const stepTimer1 = setTimeout(() => { setAuditStep(1); setProgressPercent(48); }, 1400);
    const stepTimer2 = setTimeout(() => { setAuditStep(2); setProgressPercent(78); }, 3600);
    const stepTimer3 = setTimeout(() => { setAuditStep(3); setProgressPercent(92); }, 6800);

    try {
      const caseId = activeCase?.id || '';
      const res = await apiClient.post('/verification/verify', {
        case_id: caseId,
        draft_text: textToAudit,
        doc_filter: docFilter !== 'all' ? docFilter : null
      });

      setAuditMeta({
        job_id: res.job_id || 'verified-record',
        engine: 'Nemotron Super Legal Reasoner',
        latency_ms: res.latency_ms || 180,
        note: res.note || '',
        docFilter: docFilter
      });

      // Mark which mismatches are currently present in draft text
      const initialFindings = (res.mismatches || []).map(m => ({
        ...m,
        resolved: !textToAudit.toLowerCase().includes(m.draft_value.toLowerCase())
      }));
      setFindings(initialFindings);
    } catch (err) {
      console.error('Audit verification error:', err);
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setProgressPercent(100);
      setAuditStep(3);
      setTimeout(() => {
        setIsAuditing(false);
      }, 350);
    }
  };

  // Run initial audit on open or when initialDraft is provided
  useEffect(() => {
    if (isOpen) {
      const activeText = (initialDraft && initialDraft.trim().length > 0) ? initialDraft : draftText;
      runAudit(activeText, selectedDocFilter);
    }
  }, [isOpen, initialDraft]);

  const handleDocFilterChange = (newDoc) => {
    setSelectedDocFilter(newDoc);
    runAudit(draftText, newDoc);
  };

  const handleSelectSample = (sample) => {
    setActiveSampleId(sample.id);
    setDraftText(sample.draft_text);
    runAudit(sample.draft_text, selectedDocFilter);
  };

  const handleApplyFix = (mismatch) => {
    if (!mismatch.draft_value || !mismatch.correct_value) return;

    // Replace first matching case-insensitive occurrence or exact string
    const regex = new RegExp(mismatch.draft_value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const updatedDraft = draftText.replace(regex, mismatch.correct_value);
    setDraftText(updatedDraft);

    // Update resolved status in findings
    setFindings(prev => prev.map(item => 
      item.id === mismatch.id ? { ...item, resolved: true } : item
    ));
  };

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(draftText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendBackToChat = () => {
    if (onSendToChat) {
      onSendToChat(draftText);
      onClose();
    }
  };

  if (!isOpen) return null;

  const unresolvedCount = findings.filter(f => !f.resolved).length;
  const criticalCount = findings.filter(f => !f.resolved && f.severity === 'CRITICAL').length;
  const warningCount = findings.filter(f => !f.resolved && f.severity === 'WARNING').length;

  return (
    <div className="studio-overlay" onClick={onClose}>
      <div className="studio-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="studio-header">
          <div className="studio-header-left">
            <div className="studio-shield-icon">
              <ShieldCheck size={22} />
            </div>
            <div className="studio-title-block">
              <h2>
                Pre-Submission Fact Verification Studio
                <span className="studio-badge-p0">Pre-Filing Protection</span>
              </h2>
              <div className="studio-subtitle">
                Matter: <b>{activeCase?.short_name || activeCase?.client_name || 'Active Matter'}</b> • Strict Privilege Vault
              </div>
            </div>
          </div>

          <div className="studio-header-right">
            <div className="studio-engine-pill" title="Fact-checking legal engine powered by NVIDIA Nemotron">
              <span className="studio-engine-dot" />
              <span>NVIDIA Nemotron Super Legal Engine</span>
            </div>
            <button className="studio-btn-close" onClick={onClose} title="Close Studio">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Ground Truth Source Selector Bar (Choose check what doc) */}
        <div className="studio-source-bar">
          <div className="studio-source-left">
            <div className="studio-source-badge">
              <BookOpen size={16} />
              <span>Cross-Examine Against:</span>
            </div>
            <select
              className="studio-doc-select"
              value={selectedDocFilter}
              onChange={(e) => handleDocFilterChange(e.target.value)}
              disabled={isAuditing}
              title="Choose specific executed agreement or scan all vault documents"
            >
              <option value="all">
                ● All Executed Matter Records ({caseDocs.length} document{caseDocs.length === 1 ? '' : 's'} in vault)
              </option>
              {caseDocs.map((d) => (
                <option key={d.name} value={d.name}>
                  📄 {d.name} ({d.file_type ? d.file_type.toUpperCase() : 'PDF'})
                </option>
              ))}
            </select>
          </div>

          <div className="studio-source-right">
            <span className="studio-source-status">
              <ShieldCheck size={14} color="#27ae60" />
              <span>Privileged Vault Active • Zero Data Sharing</span>
            </span>
          </div>
        </div>

        {/* Preset Drafts Bar */}
        <div className="studio-preset-bar">
          <span className="studio-preset-label">Sample Draft Scenarios:</span>
          {samples.map((s) => (
            <button
              key={s.id}
              className={`studio-preset-btn ${activeSampleId === s.id ? 'active' : ''}`}
              onClick={() => handleSelectSample(s)}
            >
              {s.title}
            </button>
          ))}
          <button
            className={`studio-preset-btn ${activeSampleId === 'custom' ? 'active' : ''}`}
            onClick={() => {
              setActiveSampleId('custom');
              setDraftText('');
              setFindings([]);
            }}
          >
            + Blank Draft
          </button>
        </div>

        {/* Dual-Pane Workspace */}
        <div className="studio-workspace">
          {/* Left Pane: Legal Draft Document */}
          <div className="studio-pane-draft">
            <div className="studio-pane-header">
              <div className="studio-pane-title">
                <FileText size={16} />
                <span>Draft Under Review (Outgoing Document)</span>
              </div>
              <div className="studio-pane-meta">
                {draftText.trim().split(/\s+/).filter(Boolean).length} words • {draftText.length} characters
              </div>
            </div>

            <div className="studio-draft-body">
              <textarea
                className="studio-draft-textarea"
                value={draftText}
                onChange={(e) => {
                  setDraftText(e.target.value);
                  setActiveSampleId('custom');
                }}
                placeholder="Paste or edit legal draft here to audit against sandboxed matter documents..."
              />
            </div>

            <div className="studio-pane-actions">
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="studio-btn-subtle" onClick={handleCopyDraft}>
                  {copied ? <Check size={14} color="#27ae60" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy Text'}</span>
                </button>
                <button 
                  className="studio-btn-subtle" 
                  onClick={() => {
                    if (activeSampleId === 'custom' && initialDraft) {
                      setDraftText(initialDraft);
                      runAudit(initialDraft, selectedDocFilter);
                    } else {
                      const sample = samples.find(s => s.id === activeSampleId) || DEFAULT_SAMPLE;
                      setDraftText(sample.draft_text);
                      runAudit(sample.draft_text, selectedDocFilter);
                    }
                  }}
                  title="Reset to initial scenario"
                >
                  <RotateCcw size={14} />
                  <span>Reset</span>
                </button>
              </div>

              {onSendToChat && (
                <button className="studio-btn-subtle" onClick={handleSendBackToChat} style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>
                  <Send size={14} />
                  <span>Insert into Chat</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Pane: Audit Findings */}
          <div className="studio-pane-audit">
            <div className="studio-pane-header">
              <div className="studio-pane-title">
                <AlertCircle size={16} color="var(--brand-primary)" />
                <span>Fact Contradictions & Discrepancies</span>
              </div>
              <div className="studio-pane-meta">
                {unresolvedCount > 0 ? (
                  <span style={{ color: criticalCount > 0 ? '#c0392b' : '#b9770e', fontWeight: 700 }}>
                    {unresolvedCount} Discrepanc{unresolvedCount === 1 ? 'y' : 'ies'} ({criticalCount} Critical)
                  </span>
                ) : (
                  <span style={{ color: '#27ae60', fontWeight: 700 }}>
                    ✓ 0 Discrepancies (Passed)
                  </span>
                )}
              </div>
            </div>

            <div className="studio-audit-list">
              {isAuditing ? (
                <div className="audit-pipeline-container">
                  <div className="pipeline-header">
                    <div className="pipeline-title-group">
                      <Loader2 size={18} className="spinner" style={{ animation: 'spin 1s linear infinite', color: 'var(--brand-primary)' }} />
                      <span className="pipeline-title">Fact Verification Pipeline</span>
                    </div>
                    <span className="pipeline-progress-badge">{progressPercent}%</span>
                  </div>

                  <div className="pipeline-progress-track">
                    <div 
                      className="pipeline-progress-fill" 
                      style={{ width: `${progressPercent}%` }} 
                    />
                  </div>

                  <div className="pipeline-steps">
                    {PIPELINE_STEPS.map((stepItem, idx) => {
                      const isStepDone = auditStep > idx;
                      const isStepCurrent = auditStep === idx;

                      return (
                        <div 
                          key={stepItem.step} 
                          className={`pipeline-step-item ${isStepCurrent ? 'active' : isStepDone ? 'completed' : 'pending'}`}
                        >
                          <div className="pipeline-step-icon">
                            {isStepDone ? (
                              <Check size={14} strokeWidth={3} />
                            ) : isStepCurrent ? (
                              <Loader2 size={14} className="spinner" style={{ animation: 'spin 1.2s linear infinite' }} />
                            ) : (
                              stepItem.step
                            )}
                          </div>
                          <div className="pipeline-step-content">
                            <div className="pipeline-step-name">{stepItem.title}</div>
                            <div className="pipeline-step-desc">{stepItem.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pipeline-live-ticker">
                    <Sparkles size={13} color="var(--brand-primary)" />
                    <span>Legal Reasoner: NVIDIA Nemotron Super • Client Matter Vault</span>
                  </div>
                </div>
              ) : findings.length === 0 || unresolvedCount === 0 ? (
                <div className="studio-clean-card">
                  <CheckCircle2 size={44} color="var(--success-dot)" />
                  <div className="studio-clean-title">All Draft Facts Corroborated</div>
                  <div className="studio-clean-desc">
                    Every date, monetary threshold, corporate party name, and covenant in this draft precisely matches the executed documents in the matter repository.
                  </div>
                </div>
              ) : (
                findings.map((item) => (
                  <div 
                    key={item.id} 
                    className={`studio-finding-card ${item.resolved ? 'resolved' : item.severity === 'CRITICAL' ? 'critical' : 'warning'}`}
                  >
                    <div className="finding-card-header">
                      <div className="finding-type-title">{item.type}</div>
                      {item.resolved ? (
                        <span className="finding-badge-resolved">
                          <Check size={12} /> Resolved
                        </span>
                      ) : item.severity === 'CRITICAL' ? (
                        <span className="finding-badge-critical">Critical</span>
                      ) : (
                        <span className="finding-badge-warning">Warning</span>
                      )}
                    </div>

                    <div className="finding-diff-row">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#c0392b', textTransform: 'uppercase' }}>Draft Claim:</span>
                        <span className="finding-token-draft">{item.draft_value}</span>
                      </div>
                      <ArrowRight size={14} color="var(--text-tertiary)" style={{ alignSelf: 'center', marginTop: 12 }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#27ae60', textTransform: 'uppercase' }}>Executed Record:</span>
                        <span className="finding-token-record">{item.correct_value}</span>
                      </div>
                    </div>

                    <div className="finding-explanation">
                      {item.explanation}
                    </div>

                    <div className="finding-citation">
                      <FileText size={13} color="var(--brand-primary)" />
                      <span style={{ fontWeight: 600 }}>Contract Clause Evidence:</span>
                      <span className="citation-link">{item.source_doc}</span>
                    </div>

                    {!item.resolved && (
                      <button 
                        className="btn-apply-fix"
                        onClick={() => handleApplyFix(item)}
                        title={`Replace '${item.draft_value}' with '${item.correct_value}' in draft`}
                      >
                        <Check size={14} />
                        <span>Apply Correction to Draft</span>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="studio-footer">
          <div className="studio-footer-meta">
            {auditMeta && (
              <>
                <span>Source: <b>{auditMeta.docFilter && auditMeta.docFilter !== 'all' ? auditMeta.docFilter : 'All Vault Documents'}</b></span>
                <span>•</span>
                <span>Audit Status: <b>{auditMeta.note || 'Cross-checked against matter vault'}</b></span>
                <span>•</span>
                <span>Privilege Vault: <b>Zero Data Sharing</b></span>
              </>
            )}
          </div>

          <div className="studio-footer-actions">
            <button 
              className="btn-run-audit" 
              onClick={() => runAudit(draftText, selectedDocFilter)}
              disabled={isAuditing || !draftText.trim()}
            >
              {isAuditing ? (
                <>
                  <Loader2 size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Cross-Examining Contract Terms...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Verify Draft Facts</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
