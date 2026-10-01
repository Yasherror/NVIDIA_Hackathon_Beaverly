import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  MessageSquare, 
  Scale, 
  ArrowRight, 
  Check, 
  HelpCircle,
  Volume2
} from 'lucide-react';

export default function BelawMascotGuide({ activeTab, onSelectTab }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mascotMood, setMascotMood] = useState('gavel'); // 'gavel' | 'thinking' | 'alert' | 'waving'

  const tipsByTab = {
    overview: {
      title: "Hello Counsel! I'm Belaw.",
      speech: "I'm your AI legal assistant with self-evolving memory and OpenShell kernel protection. Explore any of the 4 pillars to test my abilities live in action!",
      actionText: "Try Feature 1: Memory Evolution",
      actionTarget: "feature-1",
      mascotImg: "/assets/mascot.png"
    },
    'feature-1': {
      title: "Hermes Agent + Nemotron Nano at work",
      speech: "Notice how I monitor every correction you make. When I notice you replacing 'party of the first part' with 'client' three times, I proactively ask to memorize it globally so you never have to repeat yourself!",
      actionText: "View Memory Scope Detection",
      actionTarget: "feature-2",
      mascotImg: "/assets/mascot.png"
    },
    'feature-2': {
      title: "NER Entity Isolation",
      speech: "When you change 'Party A' to 'ABC Holdings', I detect that 'ABC Holdings' is a proper noun entity. I tag it to Case A only so when you switch to Case B, that information is strictly invisible!",
      actionText: "Test OpenShell Kernel Security",
      actionTarget: "feature-3",
      mascotImg: "/assets/beaver_thinking_1790529664366.jpg"
    },
    'feature-3': {
      title: "OpenShell Kernel Boundary",
      speech: "Application logic like if(case == A) can be defeated by prompt injections. OpenShell enforces security at the Linux kernel/eBPF level. When Case B tries to touch Case A's files: ❌ DENIED!",
      actionText: "Try Pre-Submission Verification",
      actionTarget: "feature-4",
      mascotImg: "/assets/beaver_gavel_1790529642074.jpg"
    },
    'feature-4': {
      title: "Nebius Rerank Verification",
      speech: "Before your draft goes out, I check dates, amounts, and party names against your master case files. If the draft says '21 March' but the contract says '12 March', I flag it in red with the exact page citation!",
      actionText: "Return to Platform Overview",
      actionTarget: "overview",
      mascotImg: "/assets/mascot.png"
    }
  };

  const currentTip = tipsByTab[activeTab] || tipsByTab.overview;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      
      {/* Expanded Mascot Dialog Card */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 rounded-2xl bg-[var(--surface)] border-2 border-[var(--primary)] p-5 shadow-modal animate-fadeIn relative">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-3 right-3 text-stone-400 hover:text-stone-700 p-1 rounded-full hover:bg-[var(--cream-100)]"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3.5 mb-3">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[var(--cream-100)] border-2 border-[var(--primary)] flex-shrink-0 shadow-xs">
              <img 
                src={currentTip.mascotImg} 
                alt="Belaw Mascot" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/assets/mascot.png';
                }}
              />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--primary-deep)]">
                Belaw Interactive Guide
              </span>
              <h4 className="font-serif font-bold text-sm text-[var(--text-primary)]">
                {currentTip.title}
              </h4>
            </div>
          </div>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed p-3 rounded-xl bg-[var(--cream-100)] border border-[var(--border-subtle)] font-sans">
            "{currentTip.speech}"
          </p>

          <div className="mt-3 flex items-center justify-between pt-1">
            <button
              onClick={() => {
                onSelectTab(currentTip.actionTarget);
                setIsOpen(false);
              }}
              className="btn-primary text-xs flex items-center gap-1.5 py-1.5 px-3"
            >
              <span>{currentTip.actionText}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">
              v2.4 Live
            </span>
          </div>
        </div>
      )}

      {/* Floating Mascot Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2 p-1.5 pr-4 rounded-full bg-[var(--surface)] hover:bg-[var(--cream-200)] border-2 border-[var(--primary)] shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
        title="Chat with Belaw Mascot Guide"
      >
        <div className="w-12 h-12 rounded-full overflow-hidden bg-[var(--cream-100)] border border-[var(--primary)] shadow-inner">
          <img 
            src="/assets/mascot.png" 
            alt="Belaw Mascot" 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/assets/beaver_avatar_1790529726037.jpg';
            }}
          />
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-xs font-serif font-bold text-[var(--text-primary)] flex items-center gap-1">
            <span>Belaw Guide</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div className="text-[10px] text-[var(--text-secondary)]">
            Click for guidance
          </div>
        </div>
      </button>

    </div>
  );
}
