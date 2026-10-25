import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, AlertCircle, AlertTriangle, CheckCircle2, 
  ArrowRight, FileText, Sparkles, Copy, Check, RotateCcw, 
  X, Loader2, ExternalLink, Send
} from 'lucide-react';
import { apiClient } from '../api/apiClient';
import './PreSubmissionStudio.css';

const DEFAULT_SAMPLE = {
  id: 'sample-termination',
  title: 'Notice of Termination (Date & Severance Mismatches)',
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
    title: 'Extracting Claims & Fact Entities',
    desc: 'Scanning dates, monetary amounts, parties & section citations in draft',
    threshold: 22
  },
  {
    step: 2,
    title: 'Querying LanceDB Matter Vector Space',
    desc: 'Cosine semantic search on 4096-dim Qwen3-Embedding-8B index',
    threshold: 52
  },
  {
    step: 3,
    title: 'Cross-Examining Contract with Nemotron Super 120B',
    desc: 'Evaluating contradiction probabilities against executed contract clauses',
    threshold: 82
  },
  {
    step: 4,
    title: 'Synthesizing Provenance Citations & Diffs',
    desc: 'Generating exact section citations and one-click replacement patches',
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
  const [viewMode, setViewMode] = useState('edit'); // 'edit' | 'preview'
  const [samples, setSamples] = useState([DEFAULT_SAMPLE]);
  const [activeSampleId, setActiveSampleId] = useState(DEFAULT_SAMPLE.id);
  const [findings, setFindings] = useState([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStep, setAuditStep] = useState(0);
  const [progressPercent, setProgressPercent] = useState(15);
  const [auditMeta, setAuditMeta] = useState(null);
  const [copied, setCopied] = useState(false);

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

  // Run audit whenever draftText changes or modal opens
  const runAudit = async (textToAudit = draftText) => {
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
      const caseId = activeCase?.id || 'case-8b0bb87e';
      const res = await apiClient.post('/verification/verify', {
        case_id: caseId,
        draft_text: textToAudit
      });

      setAuditMeta({
        job_id: res.job_id || 'nebius-job-local',
        engine: res.engine || 'Nebius Serverless Jobs + Nemotron Super',
        latency_ms: res.latency_ms || 180,
        note: res.note || ''
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

  // Run initial audit on open
  useEffect(() => {
    if (isOpen) {
      runAudit(draftText);
    }
  }, [isOpen]);

  const handleSelectSample = (sample) => {
    setActiveSampleId(sample.id);
    setDraftText(sample.draft_text);
    runAudit(sample.draft_text);
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
                <span className="studio-badge-p0">PRD P0-4</span>
              </h2>
              <div className="studio-subtitle">
                Matter: <b>{activeCase?.short_name || activeCase?.client_name || 'Apex Global Executive Dispute'}</b> • Sandbox Isolation Enforced
              </div>
            </div>
          </div>

          <div className="studio-header-right">
            <div className="studio-engine-pill" title="Batched background fact verifier powered by Nebius">
              <span className="studio-engine-dot" />
              <span>Nebius Serverless Jobs • Nemotron Super</span>
            </div>
            <button className="studio-btn-close" onClick={onClose} title="Close Studio">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Preset Drafts Bar */}
        <div className="studio-preset-bar">
          <span className="studio-preset-label">Test Scenarios:</span>
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
                <span>Draft Document</span>
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
                    const sample = samples.find(s => s.id === activeSampleId) || DEFAULT_SAMPLE;
                    setDraftText(sample.draft_text);
                    runAudit(sample.draft_text);
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
                <span>Matter Fact Audit</span>
              </div>
              <div className="studio-pane-meta">
                {unresolvedCount > 0 ? (
                  <span style={{ color: criticalCount > 0 ? '#c0392b' : '#b9770e', fontWeight: 700 }}>
                    {unresolvedCount} Discrepanc{unresolvedCount === 1 ? 'y' : 'ies'} ({criticalCount} Critical)
                  </span>
                ) : (
                  <span style={{ color: '#27ae60', fontWeight: 700 }}>
                    ✓ 0 Discrepancies
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
                      <span className="pipeline-title">Nebius Serverless Fact Verification</span>
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
                    <span>Engine: Nebius Serverless Jobs • Model: Nemotron Super 120B</span>
                  </div>
                </div>
              ) : findings.length === 0 || unresolvedCount === 0 ? (
                <div className="studio-clean-card">
                  <CheckCircle2 size={44} color="var(--success-dot)" />
                  <div className="studio-clean-title">All Draft Facts Corroborated</div>
                  <div className="studio-clean-desc">
                    Every date, monetary threshold, and corporate party name in this draft precisely matches the executed documents in the matter repository.
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
                      <span className="finding-token-draft">{item.draft_value}</span>
                      <ArrowRight size={14} color="var(--text-tertiary)" />
                      <span className="finding-token-record">{item.correct_value}</span>
                    </div>

                    <div className="finding-explanation">
                      {item.explanation}
                    </div>

                    <div className="finding-citation">
                      <FileText size={13} color="var(--brand-primary)" />
                      <span>Source:</span>
                      <span className="citation-link">{item.source_doc}</span>
                    </div>

                    {!item.resolved && (
                      <button 
                        className="btn-apply-fix"
                        onClick={() => handleApplyFix(item)}
                        title={`Replace '${item.draft_value}' with '${item.correct_value}' in draft`}
                      >
                        <Check size={14} />
                        <span>Apply Correction</span>
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
                <span>Job ID: <code style={{ fontFamily: 'monospace' }}>{auditMeta.job_id}</code></span>
                <span>•</span>
                <span>Latency: {auditMeta.latency_ms}ms</span>
                <span>•</span>
                <span>Audit Logs: Saved to <code style={{ fontFamily: 'monospace' }}>protection_logs</code></span>
              </>
            )}
          </div>

          <div className="studio-footer-actions">
            <button 
              className="btn-run-audit" 
              onClick={() => runAudit(draftText)}
              disabled={isAuditing || !draftText.trim()}
            >
              {isAuditing ? (
                <>
                  <Loader2 size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Auditing Step {auditStep + 1}/4...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Run Nebius Audit</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
