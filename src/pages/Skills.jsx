import React from 'react';
import { Globe, Lock, ExternalLink, Pencil, Trash2, ChevronDown } from 'lucide-react';
import './Skills.css';

export default function Skills() {
  const globalSkills = [
    { id: 1, title: 'Disclaimer wording — Version B', v: 'v3', corrections: 3, date: '20 Sep, 2025' },
    { id: 2, title: 'Settlement amount format', v: 'v3', corrections: 3, date: '18 Sep, 2025' },
    { id: 3, title: 'Case summary structure', v: 'v3', corrections: 3, date: '15 Sep, 2025' },
    { id: 4, title: 'Legal citation style', v: 'v3', corrections: 3, date: '12 Sep, 2025' },
    { id: 5, title: 'Client tone preference', v: 'v3', corrections: 3, date: '10 Sep, 2025' },
    { id: 6, title: 'Document formatting rules', v: 'v3', corrections: 3, date: '8 Sep, 2025' },
    { id: 7, title: 'Risk highlight style', v: 'v3', corrections: 3, date: '5 Sep, 2025' },
    { id: 8, title: 'Closing paragraph template', v: 'v3', corrections: 3, date: '2 Sep, 2025' },
  ];

  const chenSkills = [
    { id: 101, title: 'Employee notice period', v: 'v3', corrections: 2, date: '22 Sep, 2025' },
    { id: 102, title: 'Severance calculation', v: 'v3', corrections: 2, date: '18 Sep, 2025' },
    { id: 103, title: 'Termination reason', v: 'v3', corrections: 1, date: '15 Sep, 2025' },
  ];

  const abcSkills = [
    { id: 201, title: 'Payment terms', v: 'v3', corrections: 2, date: '20 Sep, 2025' },
    { id: 202, title: 'Confidentiality clause', v: 'v3', corrections: 1, date: '17 Sep, 2025' },
    { id: 203, title: 'Force majeure', v: 'v3', corrections: 1, date: '12 Sep, 2025' },
  ];

  return (
    <div className="skills-page-container">
      <div className="skills-top-bar">
        <h1 className="skills-page-title">Skills</h1>
        <div className="skills-top-right">
          <img src="/src/assets/belawbeaver.jpg" alt="Mascot" className="skills-mascot-peek" />
          <div className="skills-count-pill">12 skills learned</div>
        </div>
      </div>

      <div className="skills-section">
        <div className="skills-section-header">
          <Globe size={24} color="var(--brand-primary)" />
          <span>Global Skills <span className="skills-section-subtitle">— used across all cases</span></span>
        </div>
        
        <div className="skills-grid">
          {globalSkills.map(s => (
            <div key={s.id} className="skill-card">
              <div className="skill-card-header">
                <span className="skill-card-title">{s.title}</span>
                <span className="skill-version-pill">{s.v}</span>
              </div>
              <div className="skill-card-meta">Learned from {s.corrections} corrections</div>
              <div className="skill-card-history">
                History <ExternalLink size={14} />
              </div>
              <div className="skill-card-footer">
                <span className="skill-card-date">Created {s.date}</span>
                <div className="skill-card-actions">
                  <Pencil size={18} />
                  <div className="belaw-toggle"></div>
                  <Trash2 size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="skills-divider">
        <img src="/src/assets/belawbeaver.jpg" alt="fence mascot" style={{borderRadius: 15}} />
      </div>

      <div className="skills-section">
        <div className="skills-section-header">
          <Lock size={24} color="var(--brand-primary)" />
          <span>Case-Specific Memory <span className="skills-section-subtitle">— grouped by case</span></span>
        </div>

        <div className="case-group">
          <div className="case-group-header">
            <ChevronDown size={20} /> Chen Employment Dispute
          </div>
          <div className="skills-grid three-cols">
            {chenSkills.map(s => (
              <div key={s.id} className="skill-card">
                <div className="skill-card-header">
                  <Lock size={16} color="var(--brand-primary)" style={{marginTop: 2}} />
                  <span className="skill-card-title">{s.title}</span>
                  <span className="skill-version-pill">{s.v}</span>
                </div>
                <div className="skill-card-meta" style={{marginLeft: 24}}>Learned from {s.corrections} corrections</div>
                <div className="skill-card-history" style={{marginLeft: 24}}>
                  History <ExternalLink size={14} />
                </div>
                <div className="skill-card-footer">
                  <span className="skill-card-date">Created {s.date}</span>
                  <div className="skill-card-actions">
                    <Pencil size={18} />
                    <div className="belaw-toggle"></div>
                    <Trash2 size={18} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="case-group">
          <div className="case-group-header">
            <ChevronDown size={20} /> ABC Holdings Contract
          </div>
          <div className="skills-grid three-cols">
            {abcSkills.map(s => (
              <div key={s.id} className="skill-card">
                <div className="skill-card-header">
                  <Lock size={16} color="var(--brand-primary)" style={{marginTop: 2}} />
                  <span className="skill-card-title">{s.title}</span>
                  <span className="skill-version-pill">{s.v}</span>
                </div>
                <div className="skill-card-meta" style={{marginLeft: 24}}>Learned from {s.corrections} corrections</div>
                <div className="skill-card-history" style={{marginLeft: 24}}>
                  History <ExternalLink size={14} />
                </div>
                <div className="skill-card-footer">
                  <span className="skill-card-date">Created {s.date}</span>
                  <div className="skill-card-actions">
                    <Pencil size={18} />
                    <div className="belaw-toggle"></div>
                    <Trash2 size={18} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
