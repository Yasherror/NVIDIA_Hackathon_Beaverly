import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  MessageSquare, 
  Scale, 
  ArrowRight, 
  Check, 
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

export default function BarryMascotGuide({ activeTab, onSelectTab }) {
  const [isOpen, setIsOpen] = useState(false);

  const tipsByTab = {
    overview: {
      title: "Hello Counsel! I'm Barry the Beaver.",
      speech: "Welcome to Beaverly! I learn how you work—without learning what I shouldn't. You can test my self-evolving memory, scope boundary detection, OpenShell kernel sandbox, and pre-submission audit live!",
      actionText: "Open Live Conversations",
      actionTarget: "chat",
      mascotImg: "/assets/mascot.png"
    },
    chat: {
      title: "Barry's Live Assistant Scope",
      speech: "I maintain strict ethical walls between your matters. Use the live conversation workspace to draft, search, and verify within the active matter.",
      actionText: "Check Protection Record",
      actionTarget: "logs",
      mascotImg: "/assets/mascot.png"
    },
    skills: {
      title: "Persistent Lawyer & Case Memory",
      speech: "I divide memory cleanly into two vaults: Global Lawyer Memory (habits used across all cases) and Case-Specific Memory (confidential to one matter). When a case is closed, its case memory is permanently purged!",
      actionText: "Open Live Conversations",
      actionTarget: "chat",
      mascotImg: "/assets/mascot.png"
    },
    cases: {
      title: "Strict Case Sandboxing",
      speech: "Each matter gets an isolated workspace. OpenShell enforces this boundary at the Linux kernel/eBPF layer—so prompt injection attacks cannot force data across matter boundaries.",
      actionText: "View OpenShell Audit Logs",
      actionTarget: "logs",
      mascotImg: "/assets/mascot.png"
    },
    logs: {
      title: "OpenShell Protection Record",
      speech: "Every access attempt is logged here in real-time. Notice the green ALLOW badges for authorized reads, and red DENY badges whenever cross-case traversal was blocked by eBPF security policies.",
      actionText: "Review Settings & Policies",
      actionTarget: "settings",
      mascotImg: "/assets/mascot.png"
    },
    settings: {
      title: "Local-First Settings (No Admin Needed)",
      speech: "Beaverly is fully local to your machine. No multi-tenant cloud SaaS or central server. Your files and embeddings reside in SQLite and LanceDB directly on your device.",
      actionText: "Return to Dashboard",
      actionTarget: "overview",
      mascotImg: "/assets/mascot.png"
    }
  };

  const currentTip = tipsByTab[activeTab] || tipsByTab.overview;

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 100 }}>
      {/* Expanded Mascot Dialog Card */}
      {isOpen && (
        <div style={{
          marginBottom: '14px',
          width: '380px',
          borderRadius: '16px',
          backgroundColor: 'var(--bg-surface)',
          border: '2px solid var(--brand-primary)',
          padding: '18px',
          boxShadow: '0 12px 36px rgba(42, 28, 17, 0.2)',
          position: 'relative'
        }}>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-tertiary)',
              padding: '4px'
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid var(--brand-primary)',
              flexShrink: 0
            }}>
              <img 
                src={currentTip.mascotImg} 
                alt="Barry the Beaver" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.src = '/src/assets/belawbeaver.jpg'; }}
              />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--brand-primary)', fontWeight: 700 }}>
                Barry the Beaver • Beaverly Mascot
              </div>
              <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {currentTip.title}
              </h4>
            </div>
          </div>

          <p style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.55,
            backgroundColor: 'var(--bg-app)',
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid var(--border-light)',
            margin: '0 0 14px 0'
          }}>
            "{currentTip.speech}"
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={() => {
                if (onSelectTab) onSelectTab(currentTip.actionTarget);
                setIsOpen(false);
              }}
              className="belaw-btn-primary"
              style={{ fontSize: '0.82rem', padding: '7px 14px', gap: '6px' }}
            >
              <span>{currentTip.actionText}</span>
              <ArrowRight size={14} />
            </button>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
              Beaverly v7.0
            </span>
          </div>
        </div>
      )}

      {/* Floating Mascot Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 16px 6px 6px',
          borderRadius: '9999px',
          backgroundColor: 'var(--bg-surface)',
          border: '2px solid var(--brand-primary)',
          boxShadow: '0 8px 24px rgba(42, 28, 17, 0.16)',
          cursor: 'pointer',
          transition: 'transform 0.2s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
        title="Ask Barry the Beaver for demo tips"
      >
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '1.5px solid var(--brand-primary)'
        }}>
          <img 
            src="/assets/mascot.png" 
            alt="Barry the Beaver" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.src = '/src/assets/belawbeaver.jpg'; }}
          />
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Barry</span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#397347', display: 'inline-block' }}></span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
            Guide & Storyline
          </div>
        </div>
      </button>
    </div>
  );
}
