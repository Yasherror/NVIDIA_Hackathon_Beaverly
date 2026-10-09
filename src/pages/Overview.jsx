import React from 'react';
import { MessageCircle, Folder, Sparkles, ShieldCheck, Lock, ChevronRight, Clock } from 'lucide-react';
import './Overview.css';

export default function Overview({ setActiveTab }) {
  const cases = [
    { id: 1, name: 'Chen Employment Dispute' },
    { id: 2, name: 'Tan Contract Dispute' },
    { id: 3, name: 'Lim Family Law' },
    { id: 4, name: 'Wong Property Matter' },
    { id: 5, name: 'Lee Commercial Agreement' },
  ];

  const skills = [
    { id: 1, name: 'Disclaimer wording — Version B', time: '2 days ago' },
    { id: 2, name: 'Preferred closing style', time: '3 days ago' },
    { id: 3, name: 'Termination date format', time: '5 days ago' },
    { id: 4, name: 'Client name handling', time: '6 days ago' },
    { id: 5, name: 'Formal tone preference', time: '1 week ago' },
  ];

  return (
    <div className="overview-page">
      <div className="dashboard-header">
        <div className="header-left">
          <img src="/src/assets/mascot.png" alt="Belaw" style={{height: 50}} />
          <h1 style={{fontSize: '2.2rem'}}>Belaw</h1>
          <div style={{width: 1, height: 40, backgroundColor: 'var(--border-dark)', margin: '0 16px'}}></div>
          <div>
            <h2 className="header-title"><span className="status-dot"></span> Your cases are protected</h2>
            <p className="header-subtitle">Chen case — Isolated ✓ • No data leaks today</p>
          </div>
        </div>
        <button className="belaw-btn-primary" onClick={() => setActiveTab('chat')}>
          <MessageCircle size={20} /> Open Chat
        </button>
      </div>

      <div className="stats-grid">
        <div className="belaw-card stat-card">
          <div className="stat-icon-wrapper">
            <Folder size={26} strokeWidth={2} />
          </div>
          <div className="stat-content">
            <h3>Active Cases</h3>
            <p>5</p>
          </div>
        </div>
        <div className="belaw-card stat-card">
          <div className="stat-icon-wrapper">
            <Sparkles size={26} strokeWidth={2} />
          </div>
          <div className="stat-content">
            <h3>Skills Learned</h3>
            <p>12</p>
          </div>
        </div>
        <div className="belaw-card stat-card">
          <div className="stat-icon-wrapper">
            <ShieldCheck size={26} strokeWidth={2} />
          </div>
          <div className="stat-content">
            <h3>Today</h3>
            <p>0 data leak attempts blocked</p>
            <p className="stat-desc">Your cases have never crossed paths.</p>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="belaw-card">
          <div className="list-card-header">
            <Lock size={24} className="icon-brown" />
            <h2>Case Isolation Status</h2>
          </div>
          <div className="list-container">
            {cases.map(c => (
              <div key={c.id} className="list-item">
                <div className="item-left">
                  <div className="list-icon-wrapper">
                    <Folder size={18} />
                  </div>
                  <span>{c.name}</span>
                </div>
                <div className="item-right">
                  <Lock size={16} className="icon-brown" />
                  <span className="badge-success">Isolated ✓</span>
                  <ChevronRight size={18} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="belaw-card">
          <div className="list-card-header">
            <Sparkles size={24} className="icon-brown" />
            <h2>Recently Learned</h2>
          </div>
          <div className="list-container">
            {skills.map(s => (
              <div key={s.id} className="list-item" style={{backgroundColor: 'var(--bg-surface-alt)', border: 'none', padding: '16px'}}>
                <div className="item-left">
                  <span style={{fontWeight: 500}}>{s.name}</span>
                </div>
                <div className="item-right">
                  <Clock size={16} />
                  <span>{s.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
