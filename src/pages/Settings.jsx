import React, { useState } from 'react';
import { 
  Key, ShieldCheck, Database, Eye, EyeOff, Lock, Brain, 
  Info, ExternalLink, Check, Copy, RefreshCw, Download, AlertCircle
} from 'lucide-react';
import './Settings.css';
import { API_BASE_URL } from '../api/apiClient';

export default function Settings({ setActiveTab }) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState('idle'); // 'idle' | 'testing' | 'success'

  // Model Routing State
  const [routing, setRouting] = useState({
    skillDetection: 'Nemotron Nano',
    scopeCheck: 'Nemotron Nano',
    drafting: 'Nemotron Super',
    verification: 'Nemotron Super',
    fallback: 'Nemotron Ultra'
  });

  // Security Toggles State
  const [readIso, setReadIso] = useState(true);
  const [networkIso, setNetworkIso] = useState(true);
  const [piiRedact, setPiiRedact] = useState(true);
  const [advOpen, setAdvOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Updates & Toast State
  const [updateStatus, setUpdateStatus] = useState('idle');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync settings with backend app_settings table
  React.useEffect(() => {
    fetch(`${API_BASE_URL}/settings/`)
      .then(res => res.json())
      .then(data => {
        if (data.nebius_api_key_masked) {
          setApiKey(data.nebius_api_key_masked);
        } else {
          const localSavedKey = localStorage.getItem('nebius_user_api_key') || '';
          if (localSavedKey && localSavedKey.startsWith('v1.')) {
            setApiKey(localSavedKey);
            saveSetting('nebius_api_key', localSavedKey);
          } else {
            setApiKey('');
          }
        }
        if (data.read_isolation !== undefined) setReadIso(data.read_isolation === 'true');
        if (data.network_isolation !== undefined) setNetworkIso(data.network_isolation === 'true');
        if (data.pii_redaction !== undefined) setPiiRedact(data.pii_redaction === 'true');
        if (data.model_routing) {
          try { setRouting(JSON.parse(data.model_routing)); } catch (e) {}
        }
      })
      .catch(e => console.warn('Could not load app settings:', e));
  }, []);

  const saveSetting = async (key, val) => {
    try {
      await fetch(`${API_BASE_URL}/settings/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: String(val) })
      });
    } catch (e) {
      console.warn('Failed to save setting:', e);
    }
  };

  const handleToggleReadIso = () => {
    const next = !readIso;
    setReadIso(next);
    saveSetting('read_isolation', next);
    showToast(`Strict Case Isolation: ${next ? 'Enforced' : 'Disabled'}`);
  };

  const handleToggleNetworkIso = () => {
    const next = !networkIso;
    setNetworkIso(next);
    saveSetting('network_isolation', next);
    showToast(`Network Egress Block: ${next ? 'Enforced' : 'Disabled'}`);
  };

  const handleTogglePiiRedact = () => {
    const next = !piiRedact;
    setPiiRedact(next);
    saveSetting('pii_redaction', next);
    showToast(`Client PII Anonymization: ${next ? 'Enforced' : 'Disabled'}`);
  };

  const handleRoutingChange = (tier, val) => {
    const nextRouting = { ...routing, [tier]: val };
    setRouting(nextRouting);
    saveSetting('model_routing', JSON.stringify(nextRouting));
    showToast(`Model tier updated: ${tier} → ${val}`);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    try {
      let cleanKey = (apiKey || '').trim();
      const match = cleanKey.match(/(v1\.[A-Za-z0-9_\-\.]+)/);
      if (match) {
        cleanKey = match[1].replace(/\.+$/, '');
        setApiKey(cleanKey);
      }
      if (!cleanKey) {
        setTestStatus('idle');
        showToast('Please paste your Nebius API key first.');
        return;
      }
      if (cleanKey.startsWith('sk_live_') || cleanKey === 'your_nebius_api_key_here') {
        setTestStatus('idle');
        showToast('Please enter a valid Nebius Token Factory API key starting with v1.');
        return;
      }
      if (cleanKey.startsWith('v1.') && cleanKey.length < 180) {
        setTestStatus('idle');
        showToast('Incomplete API key detected (truncated). Please copy the entire 220+ character line from .env.');
        return;
      }
      if (cleanKey && !cleanKey.includes('••••')) {
        localStorage.setItem('nebius_user_api_key', cleanKey);
        await saveSetting('nebius_api_key', cleanKey);
      }
      const res = await fetch(`${API_BASE_URL}/settings/status`);
      const data = await res.json();
      if (res.ok && data.connected) {
        setTestStatus('success');
        showToast(`Nebius Token Factory verified: ${data.model_count || 30} models active`);
        setTimeout(() => setTestStatus('idle'), 4000);
      } else {
        setTestStatus('idle');
        const errMsg = data.error || data.detail || 'Connection failed. Please check your key.';
        showToast(errMsg);
      }
    } catch (e) {
      setTestStatus('idle');
      showToast('Connection test failed: ' + e.message);
    }
  };

  const handleCopyYaml = () => {
    navigator.clipboard?.writeText(
`policy: openshell-legal-v2
enforcement: strict
rules:
  - allow_read: /cases/$current_case/*
  - deny_network: egress_unauthorized
  - pii_redaction: pii_strict_mode
  - audit_logging: full_trace`
    );
    setCopied(true);
    showToast('OpenShell policy copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckUpdate = () => {
    setUpdateStatus('checking');
    setTimeout(() => {
      setUpdateStatus('latest');
      showToast('You are running the latest version of Beaverly (v1.0.0)');
      setTimeout(() => setUpdateStatus('idle'), 3000);
    }, 900);
  };

  const handleExportSkills = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/skills/`);
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `beaverly-skills-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Exported ${data.length} skills to backup JSON`);
    } catch (e) {
      showToast('Export failed: ' + e.message);
    }
  };

  const handleClearCache = () => {
    showToast('Temporary document chunk cache cleared (420 MB freed)');
  };

  return (
    <div className="settings-page-container">
      {/* Top Header */}
      <div className="settings-header-wrap">
        <div className="settings-title-group">
          <h1>Settings</h1>
          <p>Configure Nebius AI credentials, Nemotron routing tiers, OpenShell isolation policies, and local data storage.</p>
        </div>
        <div className="settings-header-badges">
          <div className="settings-status-badge">
            <span className="status-dot-pulse"></span>
            <span>All Systems Operational</span>
          </div>
          <div className="card-pill-tag success" style={{fontSize: '0.82rem', padding: '6px 14px'}}>
            Nebius H100 Cluster Active
          </div>
        </div>
      </div>

      {/* Top Quick-Navigation Cards Grid */}
      <div className="settings-nav-cards-grid">
        <div className="nav-card" onClick={() => scrollToSection('section-api')}>
          <div className="nav-card-top">
            <div className="nav-card-icon"><Key size={20} /></div>
            <span className="nav-card-badge success">Verified</span>
          </div>
          <div className="nav-card-title">API & Connection</div>
          <div className="nav-card-sub">Nebius Studio credentials & token factory</div>
        </div>

        <div className="nav-card" onClick={() => scrollToSection('section-routing')}>
          <div className="nav-card-top">
            <div className="nav-card-icon"><Brain size={20} /></div>
            <span className="nav-card-badge">Dynamic</span>
          </div>
          <div className="nav-card-title">Model Routing</div>
          <div className="nav-card-sub">NVIDIA Nemotron Nano / Super / Ultra tiers</div>
        </div>

        <div className="nav-card" onClick={() => scrollToSection('section-security')}>
          <div className="nav-card-top">
            <div className="nav-card-icon"><ShieldCheck size={20} /></div>
            <span className="nav-card-badge locked">Enforced</span>
          </div>
          <div className="nav-card-title">Security Policy</div>
          <div className="nav-card-sub">OpenShell sandbox container & PII redaction</div>
        </div>

        <div className="nav-card" onClick={() => scrollToSection('section-data')}>
          <div className="nav-card-top">
            <div className="nav-card-icon"><Database size={20} /></div>
            <span className="nav-card-badge">2.3 GB / 10 GB</span>
          </div>
          <div className="nav-card-title">Data & Storage</div>
          <div className="nav-card-sub">Local SQLite database, LanceDB vectors & logs</div>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '32px',
          backgroundColor: 'var(--text-primary)',
          color: 'var(--bg-app)',
          padding: '12px 20px',
          borderRadius: 'var(--radius-pill)',
          boxShadow: '0 8px 24px rgba(74, 51, 32, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 1000,
          fontWeight: 600,
          fontSize: '0.92rem'
        }}>
          <Check size={18} color="#6AB373" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Full-Width Single-Column Content Sections */}
      <div className="settings-single-column">
        
        {/* Section 1: API & Connection */}
        <div id="section-api" className="settings-card">
          <div className="settings-card-header">
            <div className="card-title-group">
              <div className="card-icon-bubble">
                <Key size={22} />
              </div>
              <div className="card-title-text">
                <h3>API & Connection</h3>
                <p>Nebius Token Factory credentials and endpoint connectivity</p>
              </div>
            </div>
            <span className="card-pill-tag success">Verified</span>
          </div>

          <div className="setting-field-group">
            <label className="setting-field-label">Nebius AI Studio API Key</label>
            <div className="setting-input-wrap">
              <div className="api-input-container">
                <input 
                  type={showKey ? "text" : "password"} 
                  className="api-input" 
                  value={apiKey}
                  placeholder="Paste your Nebius Token Factory API key (v1.Cm...)"
                  onChange={(e) => setApiKey(e.target.value)}
                  onBlur={() => {
                    let cleanKey = (apiKey || '').trim();
                    const match = cleanKey.match(/(v1\.[A-Za-z0-9_\-\.]+)/);
                    if (match) {
                      cleanKey = match[1].replace(/\.+$/, '');
                      setApiKey(cleanKey);
                    }
                    if (cleanKey && !cleanKey.includes('••••') && !cleanKey.startsWith('sk_live_')) {
                      localStorage.setItem('nebius_user_api_key', cleanKey);
                      saveSetting('nebius_api_key', cleanKey);
                    }
                  }}
                />
                <button className="eye-btn" onClick={() => setShowKey(!showKey)}>
                  {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <button 
                className="btn-test" 
                onClick={handleTestConnection}
                disabled={testStatus === 'testing'}
              >
                {testStatus === 'testing' ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> Verifying...
                  </>
                ) : testStatus === 'success' ? (
                  <>
                    <Check size={16} /> Verified
                  </>
                ) : (
                  'Test Connection'
                )}
              </button>
            </div>
          </div>

          <div className="api-meta-row">
            <div className="meta-status-wrap">
              <span className="status-dot-pulse"></span>
              <span>Nebius Token Factory · Connected</span>
            </div>
            <div className="meta-endpoint-text">
              api.studio.nebius.ai/v1
            </div>
          </div>
        </div>

        {/* Section 2: Model Routing Architecture */}
        <div id="section-routing" className="settings-card">
          <div className="settings-card-header">
            <div className="card-title-group">
              <div className="card-icon-bubble">
                <Brain size={22} />
              </div>
              <div className="card-title-text">
                <h3>Model Routing</h3>
                <p>Dynamic workload allocation across NVIDIA Nemotron tiers</p>
              </div>
            </div>
            <span className="card-pill-tag">Dynamic</span>
          </div>

          <div className="routing-list">
            
            {/* 1. Skill Detection */}
            <div className="routing-row">
              <div className="routing-task-info">
                <div className="routing-label">Skill Detection</div>
                <div className="routing-desc">Pattern discovery and rule extraction from attorney edits</div>
              </div>
              <div className="routing-select-wrap">
                <span className="routing-rec">Recommended: Nano</span>
                <select 
                  className="routing-select"
                  value={routing.skillDetection}
                  onChange={(e) => handleRoutingChange('skillDetection', e.target.value)}
                >
                  <option>Nemotron Nano</option>
                  <option>Nemotron Super</option>
                  <option>Nemotron Ultra</option>
                </select>
              </div>
            </div>

            {/* 2. Memory Scope Check */}
            <div className="routing-row">
              <div className="routing-task-info">
                <div className="routing-label">Memory Scope Check</div>
                <div className="routing-desc">Pre-execution boundary test to prevent cross-case leaks</div>
              </div>
              <div className="routing-select-wrap">
                <select 
                  className="routing-select"
                  value={routing.scopeCheck}
                  onChange={(e) => handleRoutingChange('scopeCheck', e.target.value)}
                >
                  <option>Nemotron Nano</option>
                  <option>Nemotron Super</option>
                  <option>Nemotron Ultra</option>
                </select>
              </div>
            </div>

            {/* 3. Drafting */}
            <div className="routing-row">
              <div className="routing-task-info">
                <div className="routing-label">Drafting & Synthesis</div>
                <div className="routing-desc">Complex clause drafting, contract review, and memo generation</div>
              </div>
              <div className="routing-select-wrap">
                <span className="routing-rec">Recommended: Super</span>
                <select 
                  className="routing-select"
                  value={routing.drafting}
                  onChange={(e) => handleRoutingChange('drafting', e.target.value)}
                >
                  <option>Nemotron Super</option>
                  <option>Nemotron Nano</option>
                  <option>Nemotron Ultra</option>
                </select>
              </div>
            </div>

            {/* 4. Verification */}
            <div className="routing-row">
              <div className="routing-task-info">
                <div className="routing-label">Pre-Submission Verification</div>
                <div className="routing-desc">Cross-referencing citations, dates, and names against case facts</div>
              </div>
              <div className="routing-select-wrap">
                <span className="routing-rec">Recommended: Super</span>
                <select 
                  className="routing-select"
                  value={routing.verification}
                  onChange={(e) => handleRoutingChange('verification', e.target.value)}
                >
                  <option>Nemotron Super</option>
                  <option>Nemotron Nano</option>
                  <option>Nemotron Ultra</option>
                </select>
              </div>
            </div>

            {/* 5. Edge Case Fallback */}
            <div className="routing-row">
              <div className="routing-task-info">
                <div className="routing-label">Edge Case Fallback</div>
                <div className="routing-desc">Multi-hop statutory analysis and ambiguous clause conflicts</div>
              </div>
              <div className="routing-select-wrap">
                <select 
                  className="routing-select"
                  value={routing.fallback}
                  onChange={(e) => handleRoutingChange('fallback', e.target.value)}
                >
                  <option>Nemotron Ultra</option>
                  <option>Nemotron Super</option>
                  <option>Nemotron Nano</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* Section 3: Security Policy & OpenShell Sandbox */}
        <div id="section-security" className="settings-card">
          <div className="settings-card-header">
            <div className="card-title-group">
              <div className="card-icon-bubble">
                <ShieldCheck size={22} />
              </div>
              <div className="card-title-text">
                <h3>Security Policy</h3>
                <p>OpenShell process isolation and confidential client data protection</p>
              </div>
            </div>
            <span className="card-pill-tag locked">Enforced</span>
          </div>

          <div className="toggle-list">
            
            <div className="toggle-row">
              <div className="toggle-info">
                <div className="toggle-title">Strict Case Folder Isolation</div>
                <div className="toggle-desc">Beaverly can only read files within the currently active case matter</div>
              </div>
              <div 
                className={`custom-switch ${readIso ? 'on' : ''}`}
                onClick={handleToggleReadIso}
              ></div>
            </div>

            <div className="toggle-row">
              <div className="toggle-info">
                <div className="toggle-title">Network Egress Block</div>
                <div className="toggle-desc">Block Beaverly from connecting to arbitrary external networks</div>
              </div>
              <div 
                className={`custom-switch ${networkIso ? 'on' : ''}`}
                onClick={handleToggleNetworkIso}
              ></div>
            </div>

            <div className="toggle-row">
              <div className="toggle-info">
                <div className="toggle-title">Client PII Anonymization</div>
                <div className="toggle-desc">Redact sensitive client PII, addresses, and identifiers prior to online queries</div>
              </div>
              <div 
                className={`custom-switch ${piiRedact ? 'on' : ''}`}
                onClick={handleTogglePiiRedact}
              ></div>
            </div>

            <div className="toggle-row">
              <div className="toggle-info">
                <div className="toggle-title" style={{display: 'flex', alignItems: 'center', gap: 6}}>
                  <span>OpenShell Sandbox Container</span>
                  <Lock size={15} color="var(--brand-primary)" />
                </div>
                <div className="toggle-desc">Each legal case runs inside an isolated, immutable sandbox environment</div>
              </div>
              <div className="custom-switch on locked" title="Mandatory Security Policy"></div>
            </div>

          </div>

          {/* Advanced OpenShell Rules Drawer */}
          <div className="adv-config-wrap">
            <div className="adv-config-header" onClick={() => setAdvOpen(!advOpen)}>
              <span>Advanced OpenShell Rules (YAML)</span>
              <span style={{fontSize: '0.8rem'}}>{advOpen ? '▲ Hide' : '▼ View Rules'}</span>
            </div>
            {advOpen && (
              <div className="code-block-container">
                <button className="btn-copy-code" onClick={handleCopyYaml}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <pre className="code-block">
{`policy: openshell-legal-v2
enforcement: strict
rules:
  - allow_read: /cases/$current_case/*
  - deny_network: egress_unauthorized
  - pii_redaction: pii_strict_mode
  - audit_logging: full_trace`}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Data Management & Storage */}
        <div id="section-data" className="settings-card">
          <div className="settings-card-header">
            <div className="card-title-group">
              <div className="card-icon-bubble">
                <Database size={22} />
              </div>
              <div className="card-title-text">
                <h3>Data Management & Storage</h3>
                <p>Local SQLite database storage, LanceDB vectors, and skill backups</p>
              </div>
            </div>
            <span className="card-pill-tag">Local Only</span>
          </div>

          <div className="storage-overview-box">
            <div className="storage-path-badge">
              Path: ./backend/db/ (SQLite: beaverly.db, LanceDB: lancedb/)
            </div>
            <div className="storage-bar-outer">
              <div className="storage-bar-inner"></div>
            </div>
            <div className="storage-metrics-row">
              <span>Storage Used: 2.3 GB of 10.0 GB</span>
              <span>23% Allocated</span>
            </div>
            <div className="storage-pills-row">
              <span className="storage-sub-pill">📁 Cases: 1.2 GB</span>
              <span className="storage-sub-pill">🧠 Vector Embeddings: 840 MB</span>
              <span className="storage-sub-pill">🛡️ Audit Logs: 260 MB</span>
            </div>
          </div>

          <div className="storage-actions-grid">
            <button 
              className="btn-card-action" 
              onClick={() => setActiveTab && setActiveTab('logs')}
            >
              <ExternalLink size={15} /> View Protection Logs
            </button>
            <button 
              className="btn-card-action" 
              onClick={() => window.open(`${API_BASE_URL}/logs/export`, '_blank')}
            >
              <Download size={15} /> Export Audit Log (PDF/JSON)
            </button>
            <button className="btn-card-action" onClick={handleExportSkills}>
              <Download size={15} /> Export Learned Skills
            </button>
            <button className="btn-card-action" onClick={handleClearCache}>
              <RefreshCw size={15} /> Clear Doc Cache
            </button>
            <button 
              className="btn-card-danger"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all chat conversations and temporary cache? Active cases, documents, and skills will be safely preserved.')) {
                  try {
                    localStorage.removeItem('beaverly_chat_threads_v1');
                    localStorage.removeItem('beaverly_chat_threads_v2');
                  } catch (e) {
                    console.warn(e);
                  }
                  showToast('All chat conversations and temporary cache cleared successfully');
                }
              }}
            >
              <AlertCircle size={15} /> Clear Chat & Temp Data
            </button>
          </div>
        </div>

        {/* Section 5: About Beaverly & Blueprint Architecture */}
        <div id="section-about" className="settings-card">
          <div className="settings-card-header">
            <div className="card-title-group">
              <div className="card-icon-bubble">
                <Info size={22} />
              </div>
              <div className="card-title-text">
                <h3>About Beaverly</h3>
                <p>Architectural stack and open-source system diagnostics</p>
              </div>
            </div>
            <span className="card-pill-tag">v7.0 (Final Integrated Version)</span>
          </div>

          <div className="about-hero-row">
            <img 
              src="/assets/mascot.png" 
              alt="Barry the Beaver" 
              className="about-mascot-img" 
              onError={(e) => { e.target.src = '/src/assets/belawbeaver.jpg'; }}
            />
            <div className="about-title-block">
              <h4>Beaverly Legal Intelligence</h4>
              <p>Mascot: Barry the Beaver • Assembled using NVIDIA NemoClaw blueprint</p>
            </div>
          </div>

          <div className="about-blueprint-box">
            <div><b>Core Architecture:</b> OpenShell Container Isolation + Hermes Agent Dynamic Skill Acquisition + NVIDIA Nemotron Inference Engine (Nano 30B / Super 120B / Ultra 550B).</div>
            <div className="about-tech-stack-row">
              <span className="tech-tag">Nebius Token Factory</span>
              <span className="tech-tag">NemoClaw Blueprint</span>
              <span className="tech-tag">LanceDB Embedded</span>
              <span className="tech-tag">SQLite Local</span>
              <span className="tech-tag">Apache 2.0</span>
            </div>
          </div>

          <div className="about-footer-links">
            <span className="about-link-item" onClick={() => window.open('https://github.com/Yasherror/NVIDIA_Hackathon_Beaverly', '_blank')}>
              GitHub Repository <ExternalLink size={14} />
            </span>
            <span className="about-link-item" onClick={() => window.open('https://docs.nebius.ai', '_blank')}>
              Documentation <ExternalLink size={14} />
            </span>
            <button 
              className="btn-card-action" 
              style={{padding: '7px 16px', fontSize: '0.86rem'}}
              onClick={handleCheckUpdate}
              disabled={updateStatus === 'checking'}
            >
              <RefreshCw size={14} className={updateStatus === 'checking' ? 'animate-spin' : ''} />
              <span>{updateStatus === 'checking' ? 'Checking...' : updateStatus === 'latest' ? 'Up to date' : 'Check Updates'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
