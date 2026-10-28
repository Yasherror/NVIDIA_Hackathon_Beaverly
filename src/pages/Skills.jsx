import React, { useState, useEffect } from 'react';
import { 
  Globe, Lock, ExternalLink, Pencil, Trash2, ChevronDown, Sparkles, 
  CheckCircle2, History, RotateCcw, X, Clock, ArrowRight, ShieldCheck, AlertCircle 
} from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { useAppContext } from '../context/AppContext';
import beaverFenceDivider from '../assets/beaver_fence_divider.png';
import './Skills.css';

export default function Skills() {
  const { refreshSkills } = useAppContext();
  const [skillsList, setSkillsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Version history & Rollback state (PRD P1-1)
  const [activeModal, setActiveModal] = useState(null); // 'history' | 'edit' | null
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [versionsData, setVersionsData] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Edit Form state
  const [editForm, setEditForm] = useState({
    name: '',
    trigger_pattern: '',
    replacement: '',
    category: '',
    change_reason: ''
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const [casesMap, setCasesMap] = useState({});

  const fetchSkills = async () => {
    try {
      const data = await apiClient.get('/skills/');
      setSkillsList(data);
      const casesData = await apiClient.get('/cases/');
      const map = {};
      (casesData || []).forEach(c => {
        map[c.id] = `${c.short_name || c.client_name} (Matter #${c.matter_id ? c.matter_id.replace('MATTER-2026-', '') : c.id})`;
      });
      setCasesMap(map);
    } catch (err) {
      console.error('Failed to load skills or cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleToggle = async (skillId) => {
    try {
      await apiClient.patch(`/skills/${skillId}/toggle`);
      await fetchSkills();
      await refreshSkills();
    } catch (err) {
      console.error('Failed to toggle skill:', err);
    }
  };

  const handleDelete = async (skillId) => {
    if (!window.confirm('Are you sure you want to delete this skill and its entire revision history?')) return;
    try {
      await apiClient.delete(`/skills/${skillId}`);
      showToast('Skill and version snapshots permanently deleted');
      await fetchSkills();
      await refreshSkills();
    } catch (err) {
      console.error('Failed to delete skill:', err);
    }
  };

  // Open Version History Modal (PRD P1-1)
  const handleOpenHistory = async (skill) => {
    setSelectedSkill(skill);
    setActiveModal('history');
    setLoadingVersions(true);
    try {
      const data = await apiClient.get(`/skills/${skill.id}/versions`);
      setVersionsData(data.versions || []);
    } catch (err) {
      console.error('Failed to fetch skill versions:', err);
      setVersionsData([]);
    } finally {
      setLoadingVersions(false);
    }
  };

  // Execute One-Click Rollback (PRD P1-1)
  const handleRollback = async (version) => {
    if (!selectedSkill) return;
    try {
      const res = await apiClient.post(`/skills/${selectedSkill.id}/rollback/${version.id}`);
      showToast(`✓ Rolled back to v${version.version_number}: "${version.replacement}"`);
      // Refresh modal versions
      const updatedVersions = await apiClient.get(`/skills/${selectedSkill.id}/versions`);
      setVersionsData(updatedVersions.versions || []);
      await fetchSkills();
      await refreshSkills();
    } catch (err) {
      console.error('Rollback failed:', err);
      alert('Failed to rollback skill version.');
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (skill) => {
    setSelectedSkill(skill);
    setEditForm({
      name: skill.name || '',
      trigger_pattern: skill.trigger_pattern || '',
      replacement: skill.replacement || '',
      category: skill.category || 'Drafting Habit',
      change_reason: ''
    });
    setActiveModal('edit');
  };

  // Submit Edit Revision (PRD P1-1)
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedSkill || !editForm.replacement.trim()) return;
    setIsSubmittingEdit(true);
    try {
      const res = await apiClient.put(`/skills/${selectedSkill.id}`, editForm);
      showToast(`✓ Saved revision v${res.version} for ${res.name}`);
      setActiveModal(null);
      await fetchSkills();
      await refreshSkills();
    } catch (err) {
      console.error('Failed to update skill:', err);
      alert('Failed to save skill revision.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const globalSkills = skillsList.filter(s => s.scope === 'global');
  const caseSkills = skillsList.filter(s => s.scope === 'case-specific');

  // Group case-specific skills by case_id
  const caseGroups = caseSkills.reduce((acc, skill) => {
    const key = skill.case_id || 'unassigned';
    if (!acc[key]) acc[key] = [];
    acc[key].push(skill);
    return acc;
  }, {});

  return (
    <div className="skills-page-container">
      {toastMessage && (
        <div className="skills-floating-toast">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="skills-top-bar">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className="skills-page-title">Drafting Habits & Knowledge Vault</h1>
            <span className="p1-feature-badge">Self-Evolving Firm Memory</span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Persistent Attorney Habits vs Strictly Isolated Matter Covenants with One-Click Version History
          </p>
        </div>
        <div className="skills-top-right">
          <img 
            src="/assets/mascot.png" 
            alt="Barry the Beaver" 
            className="skills-mascot-peek" 
            onError={(e) => { e.target.src = '/src/assets/belawbeaver.jpg'; }}
          />
          <div className="skills-count-pill">{skillsList.length} habits mastered</div>
        </div>
      </div>

      {/* Global Skills Section */}
      <div className="skills-section">
        <div className="skills-section-header">
          <Globe size={24} color="var(--brand-primary)" />
          <span>Global Lawyer Memory <span className="skills-section-subtitle">— habits applied automatically across all matters</span></span>
        </div>
        
        <div className="skills-grid">
          {globalSkills.map(s => (
            <div key={s.id} className="skill-card" style={{ opacity: s.active === 0 ? 0.6 : 1 }}>
              <div className="skill-card-header">
                <span className="skill-card-title">{s.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="skill-version-badge" title="Current Active Version">
                    v{s.current_version || 1}
                  </span>
                  <span className="skill-version-pill">{s.category || 'Global'}</span>
                </div>
              </div>
              <div className="skill-card-meta">
                {s.trigger_pattern && s.replacement ? (
                  <span style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
                    "{s.trigger_pattern}" → "{s.replacement}"
                  </span>
                ) : (
                  `Learned from ${s.occurrences || 1} correction(s)`
                )}
              </div>
              
              <div className="skill-card-history-row">
                <button 
                  className="btn-history-trigger"
                  onClick={() => handleOpenHistory(s)}
                  title="View revision snapshots and rollback"
                >
                  <History size={13} />
                  <span>{s.version_count > 1 ? `${s.version_count} revisions • History & Rollback` : 'v1 • View History'}</span>
                </button>
              </div>

              <div className="skill-card-footer">
                <span className="skill-card-date">
                  Confidence: {Math.round((s.confidence || 0.95) * 100)}%
                </span>
                <div className="skill-card-actions">
                  <button 
                    onClick={() => handleOpenEdit(s)}
                    className="skill-icon-action-btn"
                    title="Edit habit and save new revision"
                  >
                    <Pencil size={15} />
                  </button>
                  <button 
                    onClick={() => handleToggle(s.id)}
                    style={{
                      border: 'none',
                      background: s.active !== 0 ? '#397347' : '#999',
                      color: '#fff',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    {s.active !== 0 ? 'Active' : 'Off'}
                  </button>
                  <button 
                    onClick={() => handleDelete(s.id)}
                    className="skill-icon-action-btn delete"
                    title="Delete skill"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {globalSkills.length === 0 && (
            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', gridColumn: '1 / -1', padding: '16px' }}>
              No global habits recorded yet. Correct Beaverly in chat to evolve your first skill!
            </div>
          )}
        </div>
      </div>

      <div className="skills-divider-section">
        <div className="skills-divider-line"></div>
        <div className="skills-divider-center" title="OpenShell Cryptographic Memory Isolation Boundary">
          <img 
            src={beaverFenceDivider} 
            alt="Beaverly Memory Fence Isolation" 
            className="skills-fence-divider-img"
            onError={(e) => { e.target.src = '/assets/beaver_fence_divider.png'; }}
          />
          <div className="skills-divider-tag">
            <Lock size={11} />
            <span>STRICT ATTORNEY-CLIENT PRIVILEGE BOUNDARY (ZERO CROSS-MATTER LEAKAGE)</span>
          </div>
        </div>
        <div className="skills-divider-line"></div>
      </div>

      {/* Case-Specific Memory Section */}
      <div className="skills-section">
        <div className="skills-section-header">
          <Lock size={24} color="var(--brand-primary)" />
          <span>Matter-Specific Knowledge <span className="skills-section-subtitle">— strictly isolated to designated matter (permanently purged on case closure)</span></span>
        </div>

        {Object.keys(caseGroups).length === 0 ? (
          <div style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', padding: '16px' }}>
            No matter-specific memories yet. Defining a party designation in chat stores it here exclusively.
          </div>
        ) : (
          Object.entries(caseGroups).map(([caseId, groupSkills]) => (
            <div key={caseId} className="case-group" style={{ marginBottom: '24px' }}>
              <div className="case-group-header">
                <ChevronDown size={20} />
                <span>{casesMap[caseId] || `Matter Container: ${caseId}`}</span>
                <span style={{ fontSize: '0.72rem', marginLeft: 'auto', padding: '2px 8px', borderRadius: '10px', backgroundColor: '#f2e8dc', color: 'var(--brand-primary)', fontWeight: 700 }}>
                  Privilege Sandboxed
                </span>
              </div>
              <div className="skills-grid three-cols">
                {groupSkills.map(s => (
                  <div key={s.id} className="skill-card" style={{ opacity: s.active === 0 ? 0.6 : 1 }}>
                    <div className="skill-card-header">
                      <Lock size={16} color="var(--brand-primary)" style={{ marginTop: 2 }} />
                      <span className="skill-card-title">{s.name}</span>
                      <span className="skill-version-badge">v{s.current_version || 1}</span>
                      <span className="skill-version-pill" style={{ backgroundColor: '#fbeeed', color: '#a33b3b' }}>Matter Only</span>
                    </div>
                    <div className="skill-card-meta" style={{ marginLeft: 24 }}>
                      <span style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
                        "{s.trigger_pattern}" → "{s.replacement}"
                      </span>
                    </div>
                    
                    <div className="skill-card-history-row" style={{ marginLeft: 24 }}>
                      <button 
                        className="btn-history-trigger"
                        onClick={() => handleOpenHistory(s)}
                        title="View revision snapshots and rollback"
                      >
                        <History size={13} />
                        <span>{s.version_count > 1 ? `${s.version_count} revisions • History & Rollback` : 'v1 • View History'}</span>
                      </button>
                    </div>

                    <div className="skill-card-footer">
                      <span className="skill-card-date">
                        Confidence: {Math.round((s.confidence || 0.95) * 100)}%
                      </span>
                      <div className="skill-card-actions">
                        <button 
                          onClick={() => handleOpenEdit(s)}
                          className="skill-icon-action-btn"
                          title="Edit habit and save new revision"
                        >
                          <Pencil size={15} />
                        </button>
                        <button 
                          onClick={() => handleToggle(s.id)}
                          style={{
                            border: 'none',
                            background: s.active !== 0 ? '#397347' : '#999',
                            color: '#fff',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          {s.active !== 0 ? 'Active' : 'Off'}
                        </button>
                        <button 
                          onClick={() => handleDelete(s.id)}
                          className="skill-icon-action-btn delete"
                          title="Delete skill"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal 1: Version History & Rollback Modal (PRD P1-1) */}
      {activeModal === 'history' && selectedSkill && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content version-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="history-modal-icon-wrap">
                  <History size={20} color="var(--brand-primary)" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                    Skill Version History & Rollback
                  </h2>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    <b>{selectedSkill.name}</b> • {selectedSkill.scope === 'global' ? 'Global Lawyer Memory' : 'Matter Sandboxed'}
                  </div>
                </div>
              </div>
              <button className="btn-modal-close" onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto', padding: '16px 22px' }}>
              <div className="history-banner-info">
                <ShieldCheck size={16} color="var(--brand-primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>
                  <b>PRD P1-1 Rollback Safeguard:</b> Beaverly maintains immutable version snapshots for every habit correction. Rollback restores previous wording instantly with audit trail logging.
                </span>
              </div>

              {loadingVersions ? (
                <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                  Loading revision timeline...
                </div>
              ) : versionsData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                  No historical snapshots recorded yet.
                </div>
              ) : (
                <div className="vhist-timeline">
                  {versionsData.map((v, idx) => {
                    const isLatest = idx === 0;
                    return (
                      <div key={v.id} className={`vhist-item ${isLatest ? 'current-active' : ''}`}>
                        <div className="vhist-node">
                          <span className="vhist-dot" />
                          {idx < versionsData.length - 1 && <span className="vhist-connector-line" />}
                        </div>
                        <div className="vhist-card">
                          <div className="vhist-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span className={`version-num-pill ${isLatest ? 'latest' : ''}`}>
                                v{v.version_number}
                              </span>
                              {isLatest ? (
                                <span className="active-now-tag">
                                  <CheckCircle2 size={12} /> Active Version
                                </span>
                              ) : (
                                <span className="archived-tag">Archived Snapshot</span>
                              )}
                            </div>
                            <span className="vhist-timestamp">
                              <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                              {v.created_at}
                            </span>
                          </div>

                          <div className="vhist-reason">
                            <b>Reason:</b> {v.change_reason || 'Habit evolved by lawyer'}
                          </div>

                          <div className="vhist-diff-box">
                            <div className="diff-row">
                              <span className="diff-label">Pattern:</span>
                              <code>{v.trigger_pattern ? `"${v.trigger_pattern}"` : '(General Drafting Rule)'}</code>
                            </div>
                            <div className="diff-arrow">
                              <ArrowRight size={14} />
                            </div>
                            <div className="diff-row">
                              <span className="diff-label">Enforced Replacement:</span>
                              <code className="highlight-replacement">{v.replacement ? `"${v.replacement}"` : '(Firm Drafting Standard)'}</code>
                            </div>
                          </div>

                          <div className="vhist-actions">
                            {!isLatest && (
                              <button 
                                className="btn-rollback"
                                onClick={() => handleRollback(v)}
                                title={`Restore v${v.version_number} as active rule`}
                              >
                                <RotateCcw size={13} />
                                <span>Rollback to v{v.version_number}</span>
                              </button>
                            )}
                            {isLatest && (
                              <span className="active-rule-indicator">
                                Applied in all active prompt syntheses
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-light)', padding: '12px 22px' }}>
              <button className="btn-outline" onClick={() => setActiveModal(null)}>
                Close
              </button>
              <button 
                className="btn-filled" 
                onClick={() => {
                  setActiveModal(null);
                  handleOpenEdit(selectedSkill);
                }}
              >
                <Pencil size={14} style={{ marginRight: 6 }} />
                <span>Create New Revision (v{(selectedSkill?.current_version || 1) + 1})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Habit & Save Revision Modal */}
      {activeModal === 'edit' && selectedSkill && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Pencil size={18} color="var(--brand-primary)" />
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                  Edit Habit & Create Revision v{(selectedSkill.current_version || 1) + 1}
                </h2>
              </div>
              <button className="btn-modal-close" onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="modal-body" style={{ padding: '18px 22px' }}>
                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                    Rule Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-main)',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                    Trigger Pattern / Archaic Phrase
                  </label>
                  <input
                    type="text"
                    value={editForm.trigger_pattern}
                    onChange={e => setEditForm({ ...editForm, trigger_pattern: e.target.value })}
                    placeholder="e.g. within reasonable time"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-main)',
                      fontSize: '0.9rem',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                    Your Enforced Replacement *
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.replacement}
                    onChange={e => setEditForm({ ...editForm, replacement: e.target.value })}
                    required
                    placeholder="e.g. within ten (10) business days via confirmed electronic mail"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-main)',
                      fontSize: '0.9rem',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                    Change Reason (Logged to Audit History)
                  </label>
                  <input
                    type="text"
                    value={editForm.change_reason}
                    onChange={e => setEditForm({ ...editForm, change_reason: e.target.value })}
                    placeholder="e.g. Standardized firm-wide notice standard for arbitration"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-main)',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>

                <div style={{
                  backgroundColor: '#FDF3E7',
                  border: '1px solid var(--border-dark)',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <Sparkles size={16} color="var(--brand-primary)" style={{ flexShrink: 0 }} />
                  <span>
                    Saving will create immutable <b>v{(selectedSkill.current_version || 1) + 1}</b> while archiving previous wording for one-click rollback.
                  </span>
                </div>
              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid var(--border-light)', padding: '12px 22px' }}>
                <button type="button" className="btn-outline" onClick={() => setActiveModal(null)} disabled={isSubmittingEdit}>
                  Cancel
                </button>
                <button type="submit" className="btn-filled" disabled={isSubmittingEdit}>
                  {isSubmittingEdit ? 'Saving Revision...' : `Save Revision v${(selectedSkill.current_version || 1) + 1}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
