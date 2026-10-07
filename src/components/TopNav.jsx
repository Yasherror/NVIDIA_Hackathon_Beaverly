import React from 'react';
import { Settings, Sparkles } from 'lucide-react';

export default function TopNav({ activeTab, onSelectTab, onOpenSettings }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'chat', label: 'Chat Workspace' },
    { id: 'skills', label: 'Skill Library' },
    { id: 'cases', label: 'Cases' },
    { id: 'logs', label: 'Protection Record' }
  ];

  return (
    <header className="h-16 border-b border-[#e8dcc4] bg-[#fdfaf3] flex items-center justify-between px-6 shrink-0 z-10 shadow-sm relative">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
        <div className="w-10 h-10 rounded-full border-2 border-[#8c5e32] overflow-hidden bg-white shadow-sm">
          <img src="/assets/mascot.png" alt="Belaw Logo" className="w-full h-full object-cover" onError={(e) => { e.target.src = '/assets/beaver_avatar_1790529726037.jpg'; }} />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#4a3424] leading-none">Belaw</h1>
          <p className="text-[10px] font-semibold text-[#8a7258] uppercase tracking-widest mt-0.5">AI Assistant</p>
        </div>
      </div>

      <nav className="flex items-center gap-1.5 p-1 bg-[#f4ebe1] rounded-xl border border-[#e8dcc4]">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
              activeTab === tab.id 
                ? 'bg-white text-[#8c5e32] shadow-sm ring-1 ring-black/5' 
                : 'text-[#8a7258] hover:text-[#4a3424] hover:bg-[#ebe1d3]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <button onClick={onOpenSettings} className="p-2.5 text-[#8a7258] hover:text-[#8c5e32] hover:bg-[#f4ebe1] rounded-xl transition-colors border border-transparent hover:border-[#e8dcc4]">
        <Settings className="w-5 h-5" />
      </button>
    </header>
  );
}
