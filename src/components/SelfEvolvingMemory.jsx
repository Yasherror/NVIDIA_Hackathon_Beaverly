import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  Check, 
  ArrowRight, 
  CheckCircle2, 
  RotateCcw, 
  FileText, 
  Sliders, 
  Layers, 
  Cpu, 
  History,
  Zap,
  Info,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function SelfEvolvingMemory({ skills, onAddSkill }) {
  // Demo states
  const [correctionCount, setCorrectionCount] = useState(0);
  const [showProactivePrompt, setShowProactivePrompt] = useState(false);
  const [skillLearned, setSkillLearned] = useState(false);
  const [testGenerated, setTestGenerated] = useState(false);
  const [showTechDetails, setShowTechDetails] = useState(true);

  // Sample drafting texts for the 3 corrections
  const draftingSteps = [
    {
      title: 'Clause 1: Indemnification Provision',
      original: 'The party of the first part shall indemnify and defend the executive against third-party claims.',
      corrected: 'The client shall indemnify and defend the executive against third-party claims.'
    },
    {
      title: 'Clause 2: Notice of Assignment',
      original: 'Written notice must be promptly remitted to the party of the first part within 5 business days.',
      corrected: 'Written notice must be promptly remitted to the client within 5 business days.'
    },
    {
      title: 'Clause 3: Termination & Covenants',
      original: 'All proprietary work product remains the sole property of the party of the first part upon termination.',
      corrected: 'All proprietary work product remains the sole property of the client upon termination.'
    }
  ];

  // Perform one correction step
  const handlePerformCorrection = () => {
    if (correctionCount < 3) {
      const nextCount = correctionCount + 1;
      setCorrectionCount(nextCount);

      if (nextCount === 3) {
        // Trigger proactive modal
        setTimeout(() => {
          setShowProactivePrompt(true);
        }, 500);
      }
    }
  };

  // Confirm proactive skill learning
  const handleConfirmSkill = () => {
    setShowProactivePrompt(false);
    setSkillLearned(true);

    // Call prop if needed
    onAddSkill({
      id: 'skill-auto-' + Date.now(),
      scope: 'global',
      name: 'Clause Simplification (Plain English)',
      triggerPattern: 'party of the first part',
      replacement: 'client',
      category: 'Plain Language Drafting',
      learnedFrom: 'Correction pattern (3x detected by Nemotron Nano)',
      dateLearned: 'Just now',
      active: true,
      occurrences: 3,
      confidence: '98.4%',
      description: 'Replaces archaic "party of the first part" with standard modern legal term "client" across all future contract drafting.'
    });
  };

  // Reset this demo
  const handleReset = () => {
    setCorrectionCount(0);
    setShowProactivePrompt(false);
    setSkillLearned(false);
    setTestGenerated(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Feature Context Banner */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="badge-tag badge-primary flex items-center gap-1">
                <BrainCircuit className="w-3.5 h-3.5 text-[var(--primary)]" />
                Feature 1
              </span>
              <span className="text-xs font-mono font-bold text-[var(--primary-dark)]">
                Hermes Agent + Nemotron Nano
              </span>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
              Self-Evolving Lawyer Memory
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
              <strong>What it does:</strong> When a lawyer corrects AI output, Belaw detects repeating patterns, proactively asks <em>"Should I always do this from now on?"</em>, and registers it as a global skill automatically applied next time.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="self-start md:self-auto btn-secondary text-xs flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[var(--primary)]" />
            Reset Demo Flow
          </button>
        </div>

        {/* Tech Stack Indicator Pill Bar */}
        <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-[var(--cream-100)] border border-[var(--border-subtle)] flex items-start gap-2">
            <Cpu className="w-4 h-4 text-[var(--primary-dark)] flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-[var(--text-primary)]">Hermes Agent</div>
              <div className="text-[11px] text-[var(--text-secondary)]">Monitors lawyer corrections & diff stream</div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-[var(--cream-100)] border border-[var(--border-subtle)] flex items-start gap-2">
            <BrainCircuit className="w-4 h-4 text-[var(--primary-dark)] flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-[var(--text-primary)]">Nemotron Nano</div>
              <div className="text-[11px] text-[var(--text-secondary)]">Pattern recognition & semantic frequency evaluation</div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-[var(--cream-100)] border border-[var(--border-subtle)] flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-[var(--primary-dark)] flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-[var(--text-primary)]">Local Skill Storage</div>
              <div className="text-[11px] text-[var(--text-secondary)]">Zero cloud leakage; persisted to lawyer's vault</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Demo Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Interactive Simulation Workbench (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-serif text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[var(--primary)]" />
                  Interactive Demo: The 3-Correction Workflow
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Watch Belaw observe lawyer changes in real-time and evolve a global rule.
                </p>
              </div>

              {/* Counter Pill */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--cream-200)] border border-[var(--border-strong)] text-xs font-mono font-bold text-[var(--primary-deep)]">
                <span>Corrections:</span>
                <span className="text-[var(--primary-dark)] text-sm">{correctionCount} / 3</span>
              </div>
            </div>

            {/* Pattern Recognition Confidence Gauge */}
            <div className="mb-6 p-4 rounded-xl bg-[var(--cream-100)] border border-[var(--border-subtle)]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[var(--primary)]" />
                  Nemotron Nano Pattern Recognition Confidence
                </span>
                <span className="font-mono font-bold text-[var(--primary-deep)]">
                  {correctionCount === 0 && '0% (Idle)'}
                  {correctionCount === 1 && '34.2% (1st Match)'}
                  {correctionCount === 2 && '68.7% (2nd Match - Threshold approaching)'}
                  {correctionCount >= 3 && '98.4% (Threshold Reached - Proactive Action Triggered)'}
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[var(--cream-200)] overflow-hidden border border-[var(--border-subtle)]">
                <div 
                  className="h-full bg-gradient-to-r from-[var(--primary-light)] via-[var(--primary)] to-[var(--primary-dark)] transition-all duration-500 ease-out"
                  style={{ 
                    width: correctionCount === 0 ? '0%' : correctionCount === 1 ? '34%' : correctionCount === 2 ? '68%' : '98.4%' 
                  }}
                ></div>
              </div>
            </div>

            {/* Step-by-Step Clauses */}
            <div className="space-y-3">
              {draftingSteps.map((step, idx) => {
                const isCompleted = correctionCount > idx;
                const isCurrent = correctionCount === idx;

                return (
                  <div 
                    key={idx}
                    className={`p-3.5 rounded-xl border transition-all duration-200 ${
                      isCompleted 
                        ? 'bg-[var(--cream-50)] border-emerald-300' 
                        : isCurrent 
                        ? 'bg-[var(--white)] border-[var(--primary)] shadow-xs ring-1 ring-[var(--primary-light)]' 
                        : 'bg-[var(--cream-100)] border-dashed border-[var(--border-subtle)] opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <span className="w-4 h-4 rounded-full bg-[var(--cream-200)] text-[var(--primary-deep)] text-[10px] flex items-center justify-center font-mono font-bold">
                            {idx + 1}
                          </span>
                        )}
                        {step.title}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--text-muted)]">
                        {isCompleted ? 'Correction Logged' : isCurrent ? 'Awaiting Lawyer Edit' : 'Upcoming'}
                      </span>
                    </div>

                    <div className="text-xs space-y-1.5 font-serif text-[var(--text-primary)]">
                      {!isCompleted ? (
                        <div className="p-2 rounded bg-[var(--cream-50)] border border-[var(--border-subtle)] leading-relaxed">
                          AI Draft:{' '}
                          <span className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-mono font-bold">
                            "party of the first part"
                          </span>{' '}
                          {step.original.replace('The party of the first part ', '...')}
                        </div>
                      ) : (
                        <div className="p-2 rounded bg-emerald-50/70 border border-emerald-200 leading-relaxed text-emerald-950">
                          Lawyer Corrected to:{' '}
                          <span className="bg-emerald-200 text-emerald-900 px-1 py-0.5 rounded font-mono font-bold">
                            "client"
                          </span>{' '}
                          {step.corrected.replace('The client ', '...')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {correctionCount < 3 ? (
                <button
                  onClick={handlePerformCorrection}
                  className="btn-primary text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Perform Lawyer Correction #{correctionCount + 1} (Change "party of the first part" → "client")
                </button>
              ) : !skillLearned ? (
                <button
                  onClick={() => setShowProactivePrompt(true)}
                  className="btn-primary text-xs animate-bounce"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  View Belaw Proactive Prompt
                </button>
              ) : (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>3 Corrections processed! Global skill successfully registered.</span>
                </div>
              )}
            </div>

          </div>

          {/* Test Generation Card (Demonstrating automatic application next time) */}
          <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[var(--primary)]" />
                  Next Contract Draft: Test Automatic Skill Application
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Verify that all future contract clauses automatically use "client" instead of archaic phrasing.
                </p>
              </div>

              <button
                onClick={() => setTestGenerated(true)}
                disabled={!skillLearned}
                className={`btn-primary text-xs ${!skillLearned ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate New Agreement Clause
              </button>
            </div>

            {!testGenerated ? (
              <div className="p-4 rounded-xl bg-[var(--cream-100)] border border-dashed border-[var(--border-strong)] text-center text-xs text-[var(--text-muted)]">
                {skillLearned 
                  ? 'Click "Generate New Agreement Clause" above to see the evolved skill automatically applied.' 
                  : 'Complete the 3 corrections and confirm the skill above to unlock automatic application.'}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[var(--white)] border border-[var(--border-strong)] shadow-xs animate-fadeIn">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Generated Instrument: Section 9.4 (Confidentiality)
                  </span>
                  <span className="badge-tag badge-green flex items-center gap-1 text-[10px]">
                    <Check className="w-3 h-3" />
                    Auto-Applied Global Skill
                  </span>
                </div>
                
                <p className="font-serif text-sm text-[var(--text-primary)] leading-relaxed">
                  "Neither party shall disclose Proprietary Information without prior written authorization, except that the{' '}
                  <mark className="bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-mono font-bold border border-emerald-300">
                    client
                  </mark>{' '}
                  may disclose such terms to authorized financial advisors and auditors under reciprocal non-disclosure covenants."
                </p>

                <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1 text-emerald-800 font-medium">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    Belaw replaced "party of the first part" before presenting draft.
                  </span>
                  <span className="font-mono text-[10px] text-[var(--text-muted)]">
                    Latency: 14ms (Local Skill Engine)
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Belaw Lawyer Memory Bank & Hermes Diff Stream (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Lawyer Memory Bank Card */}
          <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-[var(--primary)]" />
                  Global Lawyer Skill Bank
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Persisted preferences learned across drafting workflows.
                </p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--cream-200)] text-[var(--primary-deep)] font-mono font-bold">
                {skills.filter(s => s.scope === 'global').length} Global
              </span>
            </div>

            <div className="space-y-3">
              {skills
                .filter(s => s.scope === 'global')
                .map((skill) => (
                  <div 
                    key={skill.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      skill.id.startsWith('skill-auto')
                        ? 'bg-[var(--white)] border-[var(--primary)] shadow-sm ring-1 ring-[var(--primary-light)]'
                        : 'bg-[var(--cream-100)] border-[var(--border-subtle)]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        {skill.name}
                      </span>
                      <span className="badge-tag badge-primary text-[9px]">
                        GLOBAL
                      </span>
                    </div>

                    <div className="p-2 rounded bg-[var(--cream-50)] border border-[var(--border-subtle)] font-mono text-[11px] my-2">
                      <div className="text-red-700 flex items-center gap-1">
                        <span className="font-bold">-</span> "{skill.triggerPattern}"
                      </div>
                      <div className="text-emerald-700 flex items-center gap-1 font-bold">
                        <span className="font-bold">+</span> "{skill.replacement}"
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-1 border-t border-[var(--border-subtle)]">
                      <span>Source: {skill.learnedFrom}</span>
                      <span className="font-mono text-[var(--primary-deep)] font-semibold">
                        {skill.confidence}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Hermes Agent Telemetry Monitor */}
          <div className="p-5 rounded-2xl bg-[var(--cream-100)] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-[var(--primary-dark)]" />
                Hermes Correction Stream Log
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </div>
            <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border-subtle)] font-mono text-[11px] text-[var(--text-secondary)] space-y-1 max-h-48 overflow-y-auto">
              <div className="text-[10px] text-[var(--text-muted)]">// Real-time correction interception</div>
              {correctionCount >= 1 && (
                <div className="text-stone-700">
                  <span className="text-[var(--primary-dark)]">[Hermes 14:31:02]</span> Diff captured: "party of the first part" → "client" (Cluster #01)
                </div>
              )}
              {correctionCount >= 2 && (
                <div className="text-stone-700">
                  <span className="text-[var(--primary-dark)]">[Hermes 14:31:40]</span> Repeated pattern detected. Recurrence count: 2. Cosine distance: 0.02
                </div>
              )}
              {correctionCount >= 3 && (
                <div className="text-emerald-800 font-semibold">
                  <span className="text-[var(--primary-dark)]">[Nemotron Nano]</span> Pattern frequency 3/3 matched. Triggering proactive global skill elevation prompt.
                </div>
              )}
              {correctionCount === 0 && (
                <div className="text-stone-400 italic">Awaiting lawyer document revisions...</div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Belaw Proactive Prompt Modal */}
      {showProactivePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-[var(--surface)] border-2 border-[var(--primary)] p-6 shadow-modal space-y-4">
            
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[var(--cream-100)] border-2 border-[var(--primary)] flex-shrink-0 shadow-sm">
                <img 
                  src="/assets/mascot.png" 
                  alt="Belaw Mascot" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/assets/beaver_waving_1790529614042.jpg';
                  }}
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="badge-tag badge-primary text-[10px]">
                    Proactive Skill Suggestion
                  </span>
                  <span className="text-[10px] font-mono text-[var(--primary-deep)]">
                    Nemotron Nano • 98.4% Confidence
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold text-[var(--text-primary)] mt-1">
                  Remember this drafting preference?
                </h3>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--cream-100)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] space-y-2">
              <p>
                <strong>Belaw noticed:</strong> You corrected <code className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-mono font-bold">"party of the first part"</code> to <code className="bg-emerald-100 text-emerald-900 px-1 py-0.5 rounded font-mono font-bold">"client"</code> three times across recent drafting sessions.
              </p>
              <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border-strong)] font-mono text-[11px] text-[var(--text-primary)]">
                <div className="font-bold text-[var(--primary-deep)] mb-1">// Proposed Global Skill</div>
                <div>Trigger: "party of the first part"</div>
                <div>Action: Auto-substitute with "client"</div>
                <div>Scope: Global (Applies to all future contracts)</div>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] italic">
                Should I always apply this plain-language substitution from now on?
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowProactivePrompt(false)}
                className="btn-secondary text-xs"
              >
                Ask Me Later
              </button>
              <button
                onClick={handleConfirmSkill}
                className="btn-primary text-xs"
              >
                <Check className="w-4 h-4" />
                Confirm as Global Skill
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
