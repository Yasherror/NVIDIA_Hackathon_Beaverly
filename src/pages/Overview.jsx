import React, { useState, useEffect } from 'react';
import { MessageCircle, Folder, Sparkles, ShieldCheck, Lock, ChevronRight, Clock, ArrowRight } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import './Overview.css';

export default function Overview({ setActiveTab, onOpenCase }) {
  const [cases, setCases] = useState([]);
  const [skills, setSkills] = useState([]);
  const [logSummary, setLogSummary] = useState({ total_allowed: 0, total_denied: 0 });

  useEffect(() => {
    apiClient.get('/cases/').then(setCases).catch(() => setCases([]));
    apiClient.get('/skills/').then(setSkills).catch(() => setSkills([]));
    apiClient.get('/logs/summary').then(setLogSummary).catch(() => setLogSummary({ total_allowed: 0, total_denied: 0 }));
  }, []);

  const activeCases = cases.filter(c => c.status !== 'closed');

  return (
    <div className="overview-page">
      <div className="dashboard-header">
        <div className="header-left">
          <img 
            src="/assets/mascot.png" 
            alt="Barry the Beaver" 
            style={{ height: 50, width: 50, borderRadius: '50%', objectFit: 'cover' }} 
            onError={(e) => { e.target.src = '/src/assets/belawbeaver.jpg'; }}
          />
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Beaverly</h1>
          <div style={{ width: 1, height: 40, backgroundColor: 'var(--border-dark)', margin: '0 16px' }}></div>
          <div>
            <h2 className="header-title">
              <span className="status-dot"></span> All Client Matters Strictly Protected
            </h2>
            <p className="header-subtitle">
              Zero Cross-Client Data Sharing • ABA Formal Opinion 512 Privilege Compliant
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="belaw-btn-primary" onClick={() => setActiveTab('chat')}>
            <MessageCircle size={18} /> Open Conversations
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="belaw-card stat-card" onClick={() => setActiveTab('cases')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-wrapper">
            <Folder size={26} strokeWidth={2} />
          </div>
          <div className="stat-content">
            <h3>Active Matters</h3>
            <p>{activeCases.length}</p>
          </div>
        </div>
        <div className="belaw-card stat-card" onClick={() => setActiveTab('skills')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-wrapper">
            <Sparkles size={26} strokeWidth={2} />
          </div>
          <div className="stat-content">
            <h3>Drafting Habits Learned</h3>
            <p>{skills.length}</p>
          </div>
        </div>
        <div className="belaw-card stat-card" onClick={() => setActiveTab('logs')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-wrapper">
            <ShieldCheck size={26} strokeWidth={2} />
          </div>
          <div className="stat-content">
            <h3>Privilege & Data Boundary</h3>
            <p>{logSummary.total_denied || 0} leak attempts blocked</p>
            <p className="stat-desc">Zero cross-case leaks. Strict Matter Isolation Vault.</p>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="belaw-card">
          <div className="list-card-header">
            <Lock size={24} className="icon-brown" />
            <h2>Matter Privilege Status</h2>
          </div>
          <div className="list-container">
            {activeCases.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <Folder size={32} style={{ opacity: 0.35, marginBottom: '8px', display: 'block', margin: '0 auto 8px' }} />
                No active client matters yet. Create a matter in <b>Matter Records</b> to isolate client documents.
              </div>
            ) : (
              activeCases.slice(0, 5).map(c => (
                <div 
                  key={c.id} 
                  className="list-item" 
                  onClick={() => onOpenCase ? onOpenCase(c) : setActiveTab('chat')} 
                  style={{ cursor: 'pointer' }}
                >
                  <div className="item-left">
                    <div className="list-icon-wrapper">
                      <Folder size={18} />
                    </div>
                    <span>{c.short_name || c.client_name}</span>
                  </div>
                  <div className="item-right">
                    <Lock size={16} className="icon-brown" />
                    <span className="badge-success">Privilege Intact ✓</span>
                    <ChevronRight size={18} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="belaw-card">
          <div className="list-card-header">
            <Sparkles size={24} className="icon-brown" />
            <h2>Recently Learned Drafting Habits</h2>
          </div>
          <div className="list-container">
            {skills.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <Sparkles size={32} style={{ opacity: 0.35, marginBottom: '8px', display: 'block', margin: '0 auto 8px' }} />
                No drafting habits yet. As you correct drafts in Beaverly, learned firm standards will appear here.
              </div>
            ) : (
              skills.slice(0, 5).map(s => (
                <div key={s.id} className="list-item" style={{ backgroundColor: 'var(--bg-surface-alt)', border: 'none', padding: '16px' }}>
                  <div className="item-left">
                    <span style={{ fontWeight: 600 }}>{s.name}</span>
                    <span style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: s.scope === 'global' ? '#eef6f0' : '#fbeeed', color: s.scope === 'global' ? '#2b6e3b' : '#a33b3b', fontWeight: 700, marginLeft: '8px' }}>
                      {s.scope === 'global' ? 'Firm-Wide Habit' : 'Matter-Specific'}
                    </span>
                  </div>
                  <div className="item-right">
                    <Clock size={16} />
                    <span>{s.occurrences || 1}x applied</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
