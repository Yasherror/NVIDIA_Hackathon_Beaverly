import React from 'react';
import { 
  BrainCircuit, 
  Target, 
  ShieldAlert, 
  FileCheck2, 
  LayoutDashboard, 
  Sparkles,
  ChevronRight,
  Database,
  Lock,
  FileSearch,
  Scale
} from 'lucide-react';

export const NAV_ITEMS = [
  {
    id: 'overview',
    label: 'Platform Overview',
    badge: 'Hub',
    icon: LayoutDashboard,
    description: 'Executive dashboard & full capability matrix'
  },
  {
    id: 'feature-1',
    label: '1. Self-Evolving Lawyer Memory',
    badge: 'Nemotron Nano',
    icon: BrainCircuit,
    description: 'Correction pattern detection → Proactive global skill learning'
  },
  {
    id: 'feature-2',
    label: '2. Memory Scope Detection',
    badge: 'NER Scope',
    icon: Target,
    description: 'Case-specific entity detection vs Global firm preferences'
  },
  {
    id: 'feature-3',
    label: '3. Strict Case Isolation',
    badge: 'OpenShell eBPF',
    icon: ShieldAlert,
    description: 'Kernel-enforced container boundaries. Cross-tenant DENIED.'
  },
  {
    id: 'feature-4',
    label: '4. Pre-Submission Verification',
    badge: 'Nebius Rerank',
    icon: FileCheck2,
    description: 'Line-by-line factual consistency check against case repository'
  }
];

export default function Sidebar({ 
  activeTab, 
  onSelectTab, 
  currentCase,
  skillsCount = 3,
  mismatchCount = 4
}) {
  return (
    <aside className="w-full md:w-72 lg:w-80 flex-shrink-0 bg-[var(--cream-100)] border-r border-[var(--border-subtle)] p-4 flex flex-col justify-between">
      <div>
        {/* Active Matter Summary Pill */}
        <div className="mb-5 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)] shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold tracking-wider text-[var(--primary-deep)] uppercase flex items-center gap-1">
              <Scale className="w-3 h-3 text-[var(--primary)]" />
              Active Container
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
              ISOLATED
            </span>
          </div>
          <div className="font-semibold text-xs text-[var(--text-primary)] truncate">
            {currentCase.shortName}
          </div>
          <div className="font-mono text-[11px] text-[var(--text-secondary)] mt-0.5 truncate">
            {currentCase.matterId}
          </div>
          <div className="text-[10px] text-[var(--text-muted)] mt-1 flex items-center justify-between border-t border-[var(--border-subtle)] pt-1.5">
            <span>Sandbox: {currentCase.securityBoundary}</span>
            <span>{currentCase.filesCount} files</span>
          </div>
        </div>

        {/* Feature Navigation List */}
        <div className="space-y-1.5">
          <div className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Core Features
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex items-start gap-3 relative group ${
                  isActive
                    ? 'bg-[var(--surface)] text-[var(--primary-deep)] shadow-sm border border-[var(--primary-light)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--cream-200)] hover:text-[var(--text-primary)] border border-transparent'
                }`}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1.5 bg-[var(--primary-dark)] rounded-r-md"></div>
                )}

                <div className={`p-2 rounded-lg flex-shrink-0 transition-colors ${
                  isActive 
                    ? 'bg-[var(--cream-200)] text-[var(--primary-dark)]' 
                    : 'bg-[var(--surface)] text-[var(--primary)] group-hover:bg-[var(--cream-100)]'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-xs truncate">
                      {item.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] line-clamp-1 mt-0.5">
                    {item.description}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                      isActive 
                        ? 'bg-[var(--primary)] text-white' 
                        : 'bg-[var(--cream-200)] text-[var(--text-secondary)]'
                    }`}>
                      {item.badge}
                    </span>
                    {item.id === 'feature-1' && (
                      <span className="text-[9px] text-[var(--primary-deep)] font-semibold">
                        {skillsCount} Skills
                      </span>
                    )}
                    {item.id === 'feature-4' && mismatchCount > 0 && (
                      <span className="text-[9px] text-red-600 bg-red-100 px-1 rounded font-bold">
                        {mismatchCount} Flags
                      </span>
                    )}
                  </div>
                </div>

                <ChevronRight className={`w-3.5 h-3.5 transition-transform mt-1 ${
                  isActive ? 'text-[var(--primary-dark)] translate-x-0.5' : 'text-stone-400 opacity-0 group-hover:opacity-100'
                }`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Mascot Companion Box */}
      <div className="mt-6 pt-4 border-t border-[var(--border-subtle)]">
        <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--border-strong)] shadow-xs relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden bg-[var(--cream-100)] border border-[var(--primary)] flex-shrink-0">
              <img 
                src="/assets/mascot.png" 
                alt="Belaw Mascot" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/assets/beaver_avatar_1790529726037.jpg';
                }}
              />
            </div>
            <div>
              <div className="font-serif font-bold text-xs text-[var(--text-primary)]">
                Belaw Mascot Guide
              </div>
              <div className="text-[11px] text-[var(--text-secondary)] leading-tight">
                {activeTab === 'feature-1' && "Monitoring corrections with Hermes Agent..."}
                {activeTab === 'feature-2' && "NER distinguishing proper nouns from general terms."}
                {activeTab === 'feature-3' && "OpenShell kernel policy guarding sandbox."}
                {activeTab === 'feature-4' && "Nebius Rerank cross-checking draft with case files."}
                {activeTab === 'overview' && "Ready to demonstrate the 4 core legal AI pillars."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
