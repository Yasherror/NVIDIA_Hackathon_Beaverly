import React, { useState } from 'react';
import { LayoutDashboard, MessageSquare, Sparkles, Folder, ShieldCheck, Settings } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ activeTab, setActiveTab }) {
  const [isHovered, setIsHovered] = useState(false);
  const navItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'chat', icon: MessageSquare, label: 'Conversations' },
    { id: 'skills', icon: Sparkles, label: 'Skills Library' },
    { id: 'cases', icon: Folder, label: 'Cases' },
    { id: 'logs', icon: ShieldCheck, label: 'Protection Record' },
  ];

  return (
    <div 
      className={`sidebar-container ${isHovered ? 'expanded' : 'collapsed'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="sidebar-logo">
        <img src="/src/assets/mascot.png" alt="Belaw" className="logo-img" />
        <span className="logo-text">Belaw</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button key={item.id} className={`nav-item ${isActive ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="sidebar-bottom">
        <button className="nav-item settings-btn" onClick={() => setActiveTab('settings')}>
          <Settings size={24} className="nav-icon" />
          <span className="nav-label">Settings</span>
        </button>
      </div>
    </div>
  );
}

