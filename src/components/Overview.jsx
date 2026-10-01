import React from 'react';
import { 
  BrainCircuit, 
  Target, 
  ShieldAlert, 
  FileCheck2, 
  ArrowRight, 
  Cpu, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  Scale, 
  Layers, 
  Briefcase,
  Play
} from 'lucide-react';
import { CASES } from '../data/mockData';

export default function Overview({ onSelectTab, currentCase }) {
  const pillars = [
    {
      id: 'feature-1',
      number: '01',
      title: 'Self-Evolving Lawyer Memory',
      tagline: 'Hermes Agent + Nemotron Nano',
      summary: 'Lawyer corrects AI output → Belaw detects repeating patterns → proactively asks "Should I always do this from now on?" → confirmed as a global skill automatically applied next time.',
      demoHint: 'Simulate 3 corrections to "party of the first part" → watch proactive skill card evolve.',
      icon: BrainCircuit,
      color: 'var(--primary-dark)'
    },
    {
      id: 'feature-2',
      number: '02',
      title: 'Memory Scope Detection',
      tagline: 'Nemotron Nano NER + Matter Tagging',
      summary: 'Belaw automatically determines whether a lawyer correction contains case-specific information (client, party, case number) and asks: "Global memory or this case only?"',
      demoHint: 'Change Party A to "ABC Holdings" in Case A → switch to Case B → Belaw has zero knowledge.',
      icon: Target,
      color: 'var(--primary)'
    },
    {
      id: 'feature-3',
      number: '03',
      title: 'Strict Case Isolation',
      tagline: 'OpenShell eBPF Kernel Policy',
      summary: 'Cross-tenant sandbox isolation enforced at the OS kernel layer. Case B agent physically cannot read Case A files, stopping jailbreaks, prompt injections, and rogue tool calls.',
      demoHint: 'Simulate prompt injection attack trying to dump Case A → OpenShell: ❌ DENIED.',
      icon: ShieldAlert,
      color: 'var(--primary-deep)'
    },
    {
      id: 'feature-4',
      number: '04',
      title: 'Pre-Submission Verification',
      tagline: 'Nebius Rerank API + Nemotron Super',
      summary: 'Before sending a draft, Belaw checks line by line whether names, dates, amounts, and facts match original case files. Inconsistencies are highlighted in red with exact citations.',
      demoHint: 'Draft says "21 March 2025" → original says "12 March 2025" → Accept / Edit / Ignore.',
      icon: FileCheck2,
      color: 'var(--accent-red)'
    }
  ];

  const colorTokens = [
    { token: 'cream-50', hex: '#FAF4E5', usage: 'Main app background' },
    { token: 'cream-100', hex: '#F7F1E5', usage: 'Secondary background' },
    { token: 'cream-200', hex: '#F2E5D6', usage: 'Soft panels / selected' },
    { token: 'surface', hex: '#FDFAF5', usage: 'Cards / modal' },
    { token: 'white', hex: '#FEFEFD', usage: 'Chat bubbles / surface' },
    { token: 'primary', hex: '#C48762', usage: 'Main brand color' },
    { token: 'primary-light', hex: '#DFA984', usage: 'Hover/light accent' },
    { token: 'primary-dark', hex: '#B37650', usage: 'Active button / selected' },
    { token: 'primary-deep', hex: '#855B41', usage: 'Stronger brown accent' },
  ];

  return (
    <div className="space-y-8 pb-10">

      {/* Hero Presentation Card */}
      <div className="p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border-subtle)] shadow-sm relative overflow-hidden">
        
        {/* Subtle decorative background glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[var(--primary-light)]/15 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--cream-200)] border border-[var(--border-strong)]">
              <Scale className="w-3.5 h-3.5 text-[var(--primary-deep)]" />
              <span className="text-xs font-bold text-[var(--primary-deep)] tracking-wide uppercase font-mono">
                Belaw Intelligent Legal Workspace
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] tracking-tight leading-tight">
              Legal AI with Self-Evolving Memory & Strict Kernel Isolation
            </h1>

            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl font-sans">
              Meet Belaw, your tireless legal assistant. Powered by Hermes Agent, Nemotron Nano, OpenShell eBPF, and Nebius Token Factory Rerank, Belaw adapts to your firm's drafting style, prevents cross-matter data contamination, and verifies every single fact before filing.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onSelectTab('feature-1')}
                className="btn-primary text-xs flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                Launch Feature 1: Self-Evolving Memory
              </button>
              <button
                onClick={() => onSelectTab('feature-4')}
                className="btn-secondary text-xs flex items-center gap-2"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-[var(--primary)]" />
                Inspect Pre-Submission Verification
              </button>
            </div>
          </div>

          {/* Mascot Presentation Badge */}
          <div className="flex-shrink-0 text-center">
            <div className="relative inline-block group">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden bg-[var(--cream-100)] border-3 border-[var(--primary)] shadow-md transition-transform duration-300 group-hover:scale-105">
                <img 
                  src="/assets/mascot.png" 
                  alt="Belaw Mascot" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/assets/beaver_gavel_1790529642074.jpg';
                  }}
                />
              </div>
              <div className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full bg-[var(--primary-deep)] text-white text-[11px] font-bold font-mono shadow-xs border border-white">
                Belaw ⚖️
              </div>
            </div>
            <div className="text-xs font-serif font-bold text-[var(--text-primary)] mt-3">
              Chief Legal Mascot
            </div>
            <div className="text-[11px] text-[var(--text-muted)]">
              Beaver with Gavel & Tie
            </div>
          </div>

        </div>

      </div>

      {/* The 4 Core Features Showcase Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              The 4 Architectural Pillars
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Explore each feature in detail with fully interactive simulations.
            </p>
          </div>
          <span className="text-xs font-mono text-[var(--text-muted)]">
            Click any card to launch demo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                onClick={() => onSelectTab(pillar.id)}
                className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)] hover:border-[var(--primary)] hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-[var(--primary-deep)]">
                      FEATURE {pillar.number}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[var(--cream-200)] text-[var(--text-secondary)]">
                      {pillar.tagline}
                    </span>
                  </div>

                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-[var(--cream-100)] text-[var(--primary)] group-hover:bg-[var(--cream-200)] transition-colors flex-shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--primary-deep)] transition-colors">
                        {pillar.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                    {pillar.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[var(--text-muted)] italic truncate max-w-[80%]">
                    💡 {pillar.demoHint}
                  </span>
                  <div className="flex items-center gap-1 text-[var(--primary-dark)] font-semibold group-hover:translate-x-1 transition-transform">
                    <span>Explore</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Colour Tokens Spec Validation Widget */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--primary)]" />
              Design Theme Tokens System
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Implemented exactly to user specifications for warm, authoritative legal aesthetics.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {colorTokens.map((c) => (
            <div 
              key={c.token}
              className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--white)] space-y-2 shadow-xs"
            >
              <div 
                className="w-full h-8 rounded-lg border border-black/10 shadow-inner"
                style={{ backgroundColor: c.hex }}
              ></div>
              <div>
                <div className="font-mono text-xs font-bold text-[var(--text-primary)]">
                  {c.token}
                </div>
                <div className="font-mono text-[10px] text-[var(--text-muted)]">
                  {c.hex}
                </div>
                <div className="text-[10px] text-[var(--text-secondary)] mt-0.5 truncate">
                  {c.usage}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
