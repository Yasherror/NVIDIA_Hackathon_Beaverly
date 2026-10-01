import React, { useState } from 'react';
import { 
  Target, 
  AlertTriangle, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Building2, 
  Database, 
  Send, 
  HelpCircle, 
  Cpu, 
  RefreshCw, 
  Info,
  Lock,
  Tag,
  Briefcase
} from 'lucide-react';
import { CASES } from '../data/mockData';

export default function MemoryScopeDetection({ 
  currentCaseId, 
  onSelectCase, 
  skills, 
  onAddSkill 
}) {
  // Demo states
  const [activeStep, setActiveStep] = useState(1); // 1: In Case A edit, 2: Scope Modal, 3: Saved, 4: Switched to Case B test
  const [correctionInput, setCorrectionInput] = useState('Change Party A to ABC Holdings');
  const [analyzingNER, setAnalyzingNER] = useState(false);
  const [detectedEntity, setDetectedEntity] = useState(null);
  const [scopeChoice, setScopeChoice] = useState(null); // 'case-specific' | 'global'
  
  // Chat in Case B
  const [caseBQuery, setCaseBQuery] = useState('Who is Party A?');
  const [caseBResponse, setCaseBResponse] = useState(null);
  const [queryLoading, setQueryLoading] = useState(false);

  const currentCase = CASES.find(c => c.id === currentCaseId) || CASES[0];

  // Run Nemotron Nano NER
  const handleRunNER = () => {
    setAnalyzingNER(true);
    setTimeout(() => {
      setAnalyzingNER(false);
      setDetectedEntity({
        text: 'ABC Holdings',
        type: 'ORG / PROPER_NOUN',
        confidence: 0.994,
        isCaseSpecific: true,
        reason: 'Named corporate legal entity identified in current dispute pleadings.'
      });
      setActiveStep(2);
    }, 600);
  };

  // Confirm Scope
  const handleConfirmScope = (scope) => {
    setScopeChoice(scope);
    setActiveStep(3);

    // Register into memory bank
    onAddSkill({
      id: 'skill-scope-' + Date.now(),
      scope: scope,
      matterId: scope === 'case-specific' ? 'MATTER-2025-089A' : null,
      caseName: scope === 'case-specific' ? 'Apex v. ABC Holdings' : 'All Cases',
      name: 'Party A Designation',
      triggerPattern: 'Party A',
      replacement: 'ABC Holdings Corp',
      category: 'Named Entity Binding',
      learnedFrom: 'Nemotron Nano NER scope detection',
      dateLearned: 'Just now',
      active: true,
      occurrences: 1,
      confidence: '99.4%',
      description: scope === 'case-specific' 
        ? 'Bound exclusively to Matter #2025-089A. Hidden from other cases.'
        : 'Saved as firm-wide memory.'
    });
  };

  // Switch to Case B
  const handleSwitchToCaseB = () => {
    onSelectCase('case-b');
    setActiveStep(4);
  };

  // Submit query in Case B
  const handleQueryCaseB = (e) => {
    if (e) e.preventDefault();
    setQueryLoading(true);
    setTimeout(() => {
      setQueryLoading(false);
      setCaseBResponse({
        query: caseBQuery,
        answer: "I don't have that information in this case.",
        explanation: "Belaw's Memory Scope Detection tagged 'ABC Holdings' specifically to Matter #2025-089A (Case A). In Matter #2025-104B (Case B), that memory is completely invisible and unretrievable.",
        caseId: 'case-b',
        timestamp: 'Just now'
      });
    }, 700);
  };

  // Reset demo
  const handleReset = () => {
    onSelectCase('case-a');
    setActiveStep(1);
    setCorrectionInput('Change Party A to ABC Holdings');
    setDetectedEntity(null);
    setScopeChoice(null);
    setCaseBResponse(null);
  };

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="badge-tag badge-primary flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-[var(--primary)]" />
                Feature 2
              </span>
              <span className="text-xs font-mono font-bold text-[var(--primary-dark)]">
                Nemotron Nano NER + Scope Tagging
              </span>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
              Memory Scope Detection
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
              <strong>What it does:</strong> When a lawyer corrects AI, Belaw determines whether the correction contains case-specific information (client name, company name, case number). If yes, it asks: <em>"Global memory or this case only?"</em>
            </p>
          </div>

          <button
            onClick={handleReset}
            className="self-start md:self-auto btn-secondary text-xs flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[var(--primary)]" />
            Reset Demo Flow
          </button>
        </div>

        {/* Known Technical Limitation Notice (Transparent & Realistic) */}
        <div className="mt-4 p-3.5 rounded-xl bg-amber-50/80 border border-amber-300/80 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <strong className="font-semibold text-amber-950">Known Technical Limitation Callout:</strong>{' '}
            Named Entity Recognition (NER) with Nemotron Nano accurately catches proper nouns (corporate names, party designations, contract numbers). It has a known blind spot for descriptive facts (e.g., <em>"the client is currently in bankruptcy proceedings"</em>). This demo displays high-confidence proper-noun entity recognition.
          </div>
        </div>
      </div>

      {/* Interactive Workflow Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Interactive Simulation (7 cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* Step 1 & 2: Lawyer Correction in Case A */}
          <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)] shadow-xs space-y-4">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[var(--primary-dark)] text-white text-xs font-bold flex items-center justify-center font-mono">
                  1
                </span>
                <h3 className="font-serif text-base font-bold text-[var(--text-primary)]">
                  Lawyer Correction in Case A
                </h3>
              </div>
              <span className="badge-tag badge-primary text-[10px]">
                Active: {currentCase.shortName}
              </span>
            </div>

            <p className="text-xs text-[var(--text-secondary)]">
              Simulate lawyer providing an edit containing a company name to test if Belaw identifies it as case-specific.
            </p>

            {/* Input box */}
            <div className="p-4 rounded-xl bg-[var(--cream-100)] border border-[var(--border-strong)] space-y-3">
              <label className="text-xs font-semibold text-[var(--text-primary)] block">
                Lawyer Instruction / Correction:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={correctionInput}
                  onChange={(e) => setCorrectionInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-[var(--white)] border border-[var(--border-strong)] text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
                <button
                  onClick={handleRunNER}
                  disabled={analyzingNER}
                  className="btn-primary text-xs flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  {analyzingNER ? 'Running NER...' : 'Run NER Analysis'}
                </button>
              </div>

              {/* NER Output Pill if analyzed */}
              {detectedEntity && (
                <div className="mt-3 p-3 rounded-lg bg-[var(--white)] border border-emerald-300 text-xs space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-900 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Nemotron Nano Entity Detected:
                    </span>
                    <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                      Confidence: {(detectedEntity.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-[var(--text-primary)]">
                    Entity: <mark className="bg-amber-200 text-amber-950 px-1.5 py-0.5 rounded font-bold">"{detectedEntity.text}"</mark>
                    {' • '}
                    Classification: <span className="font-bold text-[var(--primary-deep)]">{detectedEntity.type}</span>
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)]">
                    {detectedEntity.reason}
                  </div>
                </div>
              )}
            </div>

            {/* Scope Decision Modal / Card */}
            {activeStep >= 2 && !scopeChoice && (
              <div className="p-5 rounded-xl bg-[var(--white)] border-2 border-[var(--primary)] shadow-sm space-y-3 animate-fadeIn">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-[var(--cream-100)] border border-[var(--primary)] flex-shrink-0">
                    <img 
                      src="/assets/mascot.png" 
                      alt="Belaw Mascot" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/assets/beaver_thinking_1790529664366.jpg';
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[var(--text-primary)]">
                      Belaw asks: Save to Case A only, or Global memory?
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                      "ABC Holdings" was identified as a case-specific party name. Would you like this preference saved strictly for <strong>{currentCase.shortName}</strong>, or saved as a global firm rule?
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => handleConfirmScope('case-specific')}
                    className="btn-primary text-xs flex items-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Save to Case A Only (Recommended)
                  </button>
                  <button
                    onClick={() => handleConfirmScope('global')}
                    className="btn-secondary text-xs"
                  >
                    Save as Global Memory
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 Complete Notification */}
            {scopeChoice && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>
                    Memory saved as <strong>{scopeChoice === 'case-specific' ? 'Case A Only (Matter #2025-089A)' : 'Global'}</strong>.
                  </span>
                </div>
                {activeStep === 3 && (
                  <button
                    onClick={handleSwitchToCaseB}
                    className="btn-primary text-xs flex items-center gap-1.5 py-1 px-3"
                  >
                    <span>Proceed to Step 2: Switch to Case B</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

          </div>

          {/* Step 3: Switch to Case B & Test Memory Isolation */}
          <div className={`p-6 rounded-2xl bg-[var(--surface)] border transition-all ${
            activeStep >= 4 ? 'border-[var(--primary)] shadow-sm' : 'border-[var(--border-subtle)] opacity-70'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[var(--primary-deep)] text-white text-xs font-bold flex items-center justify-center font-mono">
                  2
                </span>
                <h3 className="font-serif text-base font-bold text-[var(--text-primary)]">
                  Switch to Case B & Test Memory Isolation
                </h3>
              </div>
              <span className="badge-tag badge-primary text-[10px]">
                {CASES[1].matterId} — {CASES[1].shortName}
              </span>
            </div>

            <p className="text-xs text-[var(--text-secondary)] mb-4">
              Now asking Case B about "Party A" to prove that Case A's memory is completely invisible.
            </p>

            <form onSubmit={handleQueryCaseB} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={caseBQuery}
                  onChange={(e) => setCaseBQuery(e.target.value)}
                  placeholder="Ask Belaw in Case B..."
                  className="flex-1 px-3 py-2 rounded-lg bg-[var(--cream-100)] border border-[var(--border-strong)] text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
                <button
                  type="submit"
                  disabled={queryLoading}
                  className="btn-primary text-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Ask Belaw in Case B
                </button>
              </div>
            </form>

            {/* Simulated Belaw Chat Response */}
            {caseBResponse && (
              <div className="mt-4 p-4 rounded-xl bg-[var(--white)] border border-[var(--border-strong)] shadow-xs space-y-3 animate-fadeIn">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--cream-100)] border border-[var(--primary)] flex-shrink-0">
                    <img 
                      src="/assets/mascot.png" 
                      alt="Belaw Mascot" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/assets/beaver_avatar_1790529726037.jpg';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[var(--text-primary)]">
                        Belaw Legal Assistant
                      </span>
                      <span className="text-[10px] font-mono text-[var(--text-muted)]">
                        Container: /sandboxes/matter-104b/
                      </span>
                    </div>

                    <div className="mt-1 p-3 rounded-lg bg-[var(--cream-50)] border border-[var(--border-subtle)] text-xs font-serif text-[var(--text-primary)] leading-relaxed">
                      "<strong>{caseBResponse.answer}</strong> The designation 'ABC Holdings' was established specifically within the scope of Matter #2025-089A (Apex v. ABC Holdings). Case B operates under strict boundary isolation and has no record of this entity."
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-[10px] text-emerald-800 font-mono font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Scope Tag Verified: skill.matter_id == 'MATTER-2025-089A' (Hidden in MATTER-2025-104B)
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right Column: Multi-Tenant Scope Hierarchy Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-6">

          <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Database className="w-4 h-4 text-[var(--primary)]" />
                  Memory Scope Storage Vault
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Live partition inspect: Case-bound vs Global firm skills.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              
              {/* Case A Partition */}
              <div className="p-3.5 rounded-xl bg-[var(--cream-100)] border border-[var(--border-strong)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-[var(--primary-dark)]" />
                    Case A Vault (Matter #2025-089A)
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-[var(--cream-200)] text-[var(--primary-deep)] px-2 py-0.5 rounded">
                    TAG: 089A
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--white)] border border-[var(--border-subtle)] text-xs space-y-1 font-mono">
                  <div className="text-[11px] text-[var(--text-primary)] font-bold">
                    Party A = ABC Holdings Corp
                  </div>
                  <div className="text-[10px] text-[var(--text-secondary)]">
                    Scope: matter_id: 'MATTER-2025-089A'
                  </div>
                  <div className="text-[10px] text-emerald-700">
                    Status: Accessible only inside Case A
                  </div>
                </div>
              </div>

              {/* Case B Partition */}
              <div className="p-3.5 rounded-xl bg-[var(--cream-100)] border border-[var(--border-strong)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-stone-600" />
                    Case B Vault (Matter #2025-104B)
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-stone-200 text-stone-700 px-2 py-0.5 rounded">
                    TAG: 104B
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--white)] border border-dashed border-[var(--border-subtle)] text-xs font-mono text-[var(--text-muted)] italic">
                  No Case A entities mirrored. Clean slate.
                </div>
              </div>

              {/* Global Firm Partition */}
              <div className="p-3.5 rounded-xl bg-[var(--cream-200)] border border-[var(--border-strong)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--primary-deep)] flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[var(--primary)]" />
                    Global Firm Partition (Shared)
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-[var(--surface)] text-[var(--primary-deep)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
                    GLOBAL
                  </span>
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] space-y-1">
                  <div>• "party of the first part" → "client"</div>
                  <div>• Dispute resolution → AAA Commercial Arbitration</div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
