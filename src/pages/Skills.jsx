import React, { useState, useEffect } from 'react';
import { Globe, Lock, ExternalLink, Pencil, Trash2, ChevronDown, Sparkles, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { useAppContext } from '../context/AppContext';
import './Skills.css';

export default function Skills() {
  const { refreshSkills } = useAppContext();
  const [skillsList, setSkillsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSkills = async () => {
    try {
      const data = await apiClient.get('/skills/');
      setSkillsList(data);
    } catch (err) {
      console.error('Failed to load skills:', err);
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
    if (!window.confirm('Are you sure you want to delete this skill?')) return;
    try {
      await apiClient.delete(`/skills/${skillId}`);
      await fetchSkills();
      await refreshSkills();
    } catch (err) {
      console.error('Failed to delete skill:', err);
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

  const caseNames = {
    'case-a': 'Apex v. ABC Holdings (Matter #2025-089A)',
    'case-b': 'Zenith v. Horizon Maritime (Matter #2025-104B)',
    'case-c': 'Chen Employment Dispute (Matter #2026-CHEN01)',
  };

  return (
    <div className="skills-page-container">
      <div className="skills-top-bar">
        <div>
          <h1 className="skills-page-title">Skills & Memory Library</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Hermes Agent • Persistent Lawyer Memory vs Strictly Isolated Case Memory
          </p>
        </div>
        <div className="skills-top-right">
          <img 
            src="/assets/mascot.png" 
            alt="Barry the Beaver" 
            className="skills-mascot-peek" 
            onError={(e) => { e.target.src = '/src/assets/belawbeaver.jpg'; }}
          />
          <div className="skills-count-pill">{skillsList.length} skills learned</div>
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
                <span className="skill-version-pill">{s.category || 'Global'}</span>
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
              <div className="skill-card-history">
                {s.learned_from || 'Hermes Agent pattern detection'}
              </div>
              <div className="skill-card-footer">
                <span className="skill-card-date">
                  Confidence: {Math.round((s.confidence || 0.95) * 100)}%
                </span>
                <div className="skill-card-actions">
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
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 0 }}
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

      <div className="skills-divider">
        <img 
          src="/assets/mascot.png" 
          alt="Barry the Beaver fence" 
          style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--bg-app)' }} 
          onError={(e) => { e.target.src = '/src/assets/belawbeaver.jpg'; }}
        />
      </div>

      {/* Case-Specific Memory Section */}
      <div className="skills-section">
        <div className="skills-section-header">
          <Lock size={24} color="var(--brand-primary)" />
          <span>Case-Specific Memory <span className="skills-section-subtitle">— isolated to designated matter (purged on case closure)</span></span>
        </div>

        {Object.keys(caseGroups).length === 0 ? (
          <div style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', padding: '16px' }}>
            No case-specific memories yet. Tagging a corporate entity in chat stores it here exclusively.
          </div>
        ) : (
          Object.entries(caseGroups).map(([caseId, groupSkills]) => (
            <div key={caseId} className="case-group" style={{ marginBottom: '24px' }}>
              <div className="case-group-header">
                <ChevronDown size={20} />
                <span>{caseNames[caseId] || `Matter Container: ${caseId}`}</span>
                <span style={{ fontSize: '0.72rem', marginLeft: 'auto', padding: '2px 8px', borderRadius: '10px', backgroundColor: '#f2e8dc', color: 'var(--brand-primary)', fontWeight: 700 }}>
                  OpenShell Sandboxed
                </span>
              </div>
              <div className="skills-grid three-cols">
                {groupSkills.map(s => (
                  <div key={s.id} className="skill-card" style={{ opacity: s.active === 0 ? 0.6 : 1 }}>
                    <div className="skill-card-header">
                      <Lock size={16} color="var(--brand-primary)" style={{ marginTop: 2 }} />
                      <span className="skill-card-title">{s.name}</span>
                      <span className="skill-version-pill" style={{ backgroundColor: '#fbeeed', color: '#a33b3b' }}>Matter Only</span>
                    </div>
                    <div className="skill-card-meta" style={{ marginLeft: 24 }}>
                      <span style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
                        "{s.trigger_pattern}" → "{s.replacement}"
                      </span>
                    </div>
                    <div className="skill-card-history" style={{ marginLeft: 24 }}>
                      {s.learned_from || 'NER Entity Isolation'}
                    </div>
                    <div className="skill-card-footer">
                      <span className="skill-card-date">
                        Confidence: {Math.round((s.confidence || 0.95) * 100)}%
                      </span>
                      <div className="skill-card-actions">
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
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 0 }}
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
    </div>
  );
}
