import React from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Briefcase, 
  Sparkles, 
  RefreshCw, 
  Layers,
  ChevronDown
} from 'lucide-react';
import { CASES } from '../data/mockData';

export default function Navbar({ 
  currentCaseId, 
  onSelectCase, 
  onResetDemo, 
  activeTab,
  skillsCount 
}) {
  const currentCase = CASES.find(c => c.id === currentCaseId) || CASES[0];

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border-subtle)] bg-[var(--surface)]/95 backdrop-blur shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand & Mascot */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[var(--primary)] bg-[var(--cream-100)] shadow-sm transition-transform duration-200 group-hover:scale-105">
              <img 
                src="/assets/mascot.png" 
                alt="Belaw Mascot" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/assets/beaver_avatar_1790529726037.jpg';
                }}
              />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse" title="Belaw Engine Online"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                Belaw
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-[var(--cream-200)] text-[var(--primary-deep)] border border-[var(--border-strong)]">
                Legal AI v2.4
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] hidden sm:block">
              Self-Evolving Memory • Strict OpenShell Isolation • Pre-Submission Audit
            </p>
          </div>
        </div>

        {/* Center: Active Matter Switcher */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--cream-100)] border border-[var(--border-subtle)]">
            <Briefcase className="w-4 h-4 text-[var(--primary-dark)]" />
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Active Matter:</span>
            <div className="relative">
              <select
                value={currentCaseId}
                onChange={(e) => onSelectCase(e.target.value)}
                className="bg-[var(--surface)] text-[var(--text-primary)] text-xs font-bold rounded-md px-2.5 py-1 pr-6 border border-[var(--border-strong)] appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              >
                {CASES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.matterId} — {c.shortName}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--text-secondary)] absolute right-1.5 top-2 pointer-events-none" />
            </div>
          </div>

          {/* Quick tech telemetry badges */}
          <div className="hidden lg:flex items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--cream-200)] text-[var(--primary-deep)] font-medium border border-[var(--border-subtle)]">
              <Cpu className="w-3 h-3 text-[var(--primary)]" />
              Nemotron Nano
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-medium border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              OpenShell eBPF
            </span>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onResetDemo}
            title="Reset All Demo States"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--cream-100)] hover:bg-[var(--cream-200)] border border-[var(--border-subtle)] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>
        </div>

      </div>
    </header>
  );
}
