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
      speech: "Welcome to Beaverly! I learn how you work—without learning what I shouldn't. You can test my lawyer memory, confidential matter boundaries, ethical wall protection, and pre-submission audit live!",
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
      speech: "Each matter gets an isolated workspace. OpenShell enforces an unbreakable ethical wall—so client secrets can never leak into other cases.",
      actionText: "View OpenShell Audit Logs",
      actionTarget: "logs",
      mascotImg: "/assets/mascot.png"
    },
    logs: {
      title: "OpenShell Protection Record",
      speech: "Every access attempt is logged here in real-time. Notice the green ALLOW badges for verified case access, and red BLOCK badges whenever an unauthorized attempt to access another client's matter was stopped.",
      actionText: "Review Settings & Policies",
      actionTarget: "settings",
      mascotImg: "/assets/mascot.png"
    },
    settings: {
      title: "Local-First Settings (No Admin Needed)",
      speech: "Beaverly protects client privilege on your own terms. Your files and drafting rules reside in a private local vault, safe from third-party multi-tenant clouds.",
      actionText: "Return to Dashboard",
      actionTarget: "overview",
      mascotImg: "/assets/mascot.png"
    }
  };

  const currentTip = tipsByTab[activeTab] || tipsByTab.overview;

  return (
    <div style={{ position: 'fixed', bottom: '16px', right: '18px', zIndex: 90 }}>
      {/* Expanded Mascot Dialog Card */}
      {isOpen && (
        <div style={{
          marginBottom: '12px',
          width: '360px',
          maxWidth: 'calc(100vw - 36px)',
          borderRadius: '16px',
          backgroundColor: 'var(--bg-surface)',
          border: '2px solid var(--brand-primary)',
          padding: '16px',
          boxShadow: '0 12px 36px rgba(42, 28, 17, 0.2)',
          position: 'relative'
        }}>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-tertiary)',
              padding: '4px'
            }}
            title="Close Guide"
          >
            <X size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{
              width: '44px',
              height: '44px',
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
              <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--brand-primary)', fontWeight: 700 }}>
                Barry the Beaver • Mascot Guide
              </div>
              <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {currentTip.title}
              </h4>
            </div>
          </div>

          <p style={{
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            backgroundColor: 'var(--bg-app)',
            padding: '10px 12px',
            borderRadius: '10px',
            border: '1px solid var(--border-light)',
            margin: '0 0 12px 0'
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
              style={{ fontSize: '0.78rem', padding: '6px 12px', gap: '5px' }}
            >
              <span>{currentTip.actionText}</span>
              <ArrowRight size={13} />
            </button>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
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
          gap: '8px',
          padding: '4px 12px 4px 4px',
          borderRadius: '9999px',
          backgroundColor: 'var(--bg-surface)',
          border: '1.5px solid var(--brand-primary)',
          boxShadow: '0 6px 18px rgba(42, 28, 17, 0.14)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
        title="Ask Barry the Beaver for demo tips"
      >
        <div style={{
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '1.5px solid var(--brand-primary)',
          flexShrink: 0
        }}>
          <img 
            src="/assets/mascot.png" 
            alt="Barry the Beaver" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.src = '/src/assets/belawbeaver.jpg'; }}
          />
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span>Barry</span>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#397347', display: 'inline-block' }}></span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', lineHeight: 1 }}>
            Guide & Tips
          </div>
        </div>
      </button>
    </div>
  );
}
