import React, { useState, useEffect } from 'react';
import { Lock, FileText, Brain, ExternalLink, AlertTriangle, X, Trash2, CheckCircle2, ShieldCheck, Edit3, Download, Sparkles, Loader2, RotateCcw } from 'lucide-react';
import CaseDocumentsModal from '../components/CaseDocumentsModal';
import { API_BASE_URL } from '../api/apiClient';
import './Cases.css';

export default function Cases({ setActiveTab, onOpenCase }) {
  const [caseToClose, setCaseToClose] = useState(null);
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileObject, setFileObject] = useState(null);

  const [newCaseName, setNewCaseName] = useState('');
  const [clientName, setClientName] = useState('');
  const [opponentName, setOpponentName] = useState('');
  const [newJurisdiction, setNewJurisdiction] = useState('');
  const [newPracticeArea, setNewPracticeArea] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isAnalyzingFile, setIsAnalyzingFile] = useState(false);
  const [autoExtracted, setAutoExtracted] = useState(false);
  const [isCreatingCase, setIsCreatingCase] = useState(false);
  const [creationStep, setCreationStep] = useState('');
  const [conflictResult, setConflictResult] = useState(null);
  
  const [caseToEdit, setCaseToEdit] = useState(null);
  const [editShortName, setEditShortName] = useState('');
  const [editClientName, setEditClientName] = useState('');
  const [editOpponent, setEditOpponent] = useState('');
  const [editJurisdiction, setEditJurisdiction] = useState('');
  const [editPracticeArea, setEditPracticeArea] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [docViewingCase, setDocViewingCase] = useState(null);

  const [activeCases, setActiveCases] = useState([]);

  const fetchCases = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/cases/`);
      const data = await res.json();
      setActiveCases(data);
    } catch (error) {
      console.error('Failed to fetch cases:', error);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const [purgeSummary, setPurgeSummary] = useState(null);

  const handleOpenCloseModal = async (caseItem, e) => {
    if (e) e.stopPropagation();
    setCaseToClose(caseItem.id);
    setPurgeSummary({
      case_memories_count: caseItem.memories_count || 0,
      case_documents_count: caseItem.files_count || 0
    });
    try {
      const res = await fetch(`${API_BASE_URL}/cases/${caseItem.id}/purge-summary`);
      if (res.ok) {
        const summary = await res.json();
        setPurgeSummary(summary);
      }
    } catch (err) {
      console.warn('Could not fetch purge summary:', err);
    }
  };

  const handleConfirmClose = async () => {
    if (!caseToClose) return;
    try {
      const res = await fetch(`${API_BASE_URL}/cases/${caseToClose}/close`, { method: 'PATCH' });
      if (res.ok) {
        await fetchCases();
        setCaseToClose(null);
        setPurgeSummary(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEditModal = (c, e) => {
    if (e) e.stopPropagation();
    setCaseToEdit(c);
    setEditShortName(c.short_name || '');
    setEditClientName(c.client_name || '');
    setEditOpponent(c.opponent || '');
    setEditJurisdiction(c.jurisdiction || '');
    setEditPracticeArea(c.practice_area || '');
  };

  const handleSaveEdit = async () => {
    if (!caseToEdit) return;
    if (!editShortName.trim() && !editClientName.trim()) {
      alert('Please provide a Case Name or Client Name');
      return;
    }
    setIsUpdating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/cases/${caseToEdit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          short_name: editShortName.trim() || editClientName.trim(),
          client_name: editClientName.trim() || 'Unknown Client',
          opponent: editOpponent.trim(),
          jurisdiction: editJurisdiction.trim(),
          practice_area: editPracticeArea.trim()
        })
      });
      if (res.ok) {
        await fetchCases();
        setCaseToEdit(null);
      } else {
        alert('Failed to update case details');
      }
    } catch (err) {
      console.error('Error updating case:', err);
      alert('Network error updating case');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file.name);
      setFileObject(file);
      setIsAnalyzingFile(true);
      setAutoExtracted(false);

      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_BASE_URL}/intelligence/extract-matter-metadata`, {
          method: 'POST',
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          if (data.case_name) setNewCaseName(data.case_name);
          if (data.client_name) setClientName(data.client_name);
          if (data.opponent) setOpponentName(data.opponent);
          if (data.jurisdiction) setNewJurisdiction(data.jurisdiction);
          if (data.practice_area) setNewPracticeArea(data.practice_area);
          if (data.description) setNewDescription(data.description);
          setAutoExtracted(true);

          // Auto-trigger conflict check if client or opponent is extracted
          const checkClient = data.client_name || clientName;
          const checkOpponent = data.opponent || opponentName;
          if (checkClient || checkOpponent) {
            const params = new URLSearchParams({ client: checkClient, opponent: checkOpponent });
            try {
              const cfRes = await fetch(`${API_BASE_URL}/intelligence/conflicts?${params}`);
              if (cfRes.ok) {
                setConflictResult(await cfRes.json());
              }
            } catch (cfErr) {
              console.warn('Conflict check warning:', cfErr);
            }
          }
        }
      } catch (err) {
        console.warn('Auto-extraction request failed:', err);
      } finally {
        setIsAnalyzingFile(false);
      }
    }
  };

  const handleCreateCase = async () => {
    if (!clientName.trim() && !newCaseName.trim()) {
      alert('Please enter a Client Name or Case Name');
      return;
    }
    const finalName = newCaseName.trim() || 'Untitled Case';
    setIsCreatingCase(true);
    setCreationStep('Allocating OpenShell Sandbox...');
    
    try {
      const res = await fetch(`${API_BASE_URL}/cases/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: clientName.trim() || 'Unknown Client',
          opponent: opponentName.trim(),
          short_name: finalName,
          jurisdiction: newJurisdiction.trim(),
          practice_area: newPracticeArea.trim(),
          lead_counsel: '',
          description: newDescription.trim()
        })
      });
      if (res.ok) {
        const createdCase = await res.json();
        // Ingest the initial document into LanceDB if user attached one
        if (fileObject && createdCase?.id) {
          setCreationStep('Vectorizing Contract (LanceDB)...');
          const formData = new FormData();
          formData.append('file', fileObject);
          try {
            await fetch(`${API_BASE_URL}/intelligence/cases/${createdCase.id}/documents`, {
              method: 'POST',
              body: formData
            });
          } catch (uploadErr) {
            console.error('Document ingestion failed:', uploadErr);
          }
        }
        await fetchCases();
        handleClearForm();
        setShowNewCaseModal(false);
      }
    } catch (error) {
      console.error('Error creating case:', error);
    } finally {
      setIsCreatingCase(false);
      setCreationStep('');
    }
  };

  const handleClearForm = () => {
    setNewCaseName('');
    setClientName('');
    setOpponentName('');
    setNewJurisdiction('');
    setNewPracticeArea('');
    setNewDescription('');
    setSelectedFile(null);
    setFileObject(null);
    setAutoExtracted(false);
    setConflictResult(null);
    const fileInput = document.getElementById('file-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleCancelNewCase = () => {
    setShowNewCaseModal(false);
    handleClearForm();
  };

  const runConflictCheck = async () => {
    const params = new URLSearchParams({ client: clientName, opponent: opponentName });
    const res = await fetch(`${API_BASE_URL}/intelligence/conflicts?${params}`);
    setConflictResult(await res.json());
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Today';
    let s = dateString;
    if (!s.includes('T') && s.includes(' ')) {
      s = s.replace(' ', 'T');
    }
    if (!s.endsWith('Z')) {
      s = s + 'Z';
    }
    const d = new Date(s);
    if (isNaN(d.getTime())) return 'Today';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleOpen = (caseItem) => {
    if (onOpenCase) {
      onOpenCase(caseItem);
    } else if (setActiveTab) {
      setActiveTab('chat');
    }
  };

  return (
    <div className="cases-page-container">
      <div className="cases-top-bar">
        <h1 className="cases-page-title">Cases</h1>
        <div className="cases-top-right" style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <img 
            src="/assets/mascot.png" 
            alt="Barry the Beaver" 
            className="cases-mascot-peek" 
            onError={(e) => { e.target.src = '/src/assets/belawbeaver.jpg'; }}
          />
          <div className="cases-count-pill">{activeCases.length} cases</div>
          <button className="btn-filled" style={{display: 'flex', alignItems: 'center', gap: 6, marginLeft: '8px'}} onClick={() => setShowNewCaseModal(true)}>
            <div style={{fontSize: '18px', fontWeight: 'bold'}}>+</div> New Case
          </button>
        </div>
      </div>

      {activeCases.length === 0 ? (
        <div style={{
          padding: '64px 24px',
          textAlign: 'center',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '16px',
          border: '1px dashed var(--border-dark)',
          maxWidth: '600px',
          margin: '40px auto'
        }}>
          <Lock size={48} color="var(--brand-primary)" style={{ opacity: 0.6, marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Clean Slate: No Active Matters</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '24px' }}>
            All client confidential records, matter notes, and documents have been shredded.
            Create a new client matter to establish a private, privileged matter vault.
          </p>
          <button className="btn-filled" onClick={() => setShowNewCaseModal(true)} style={{ margin: '0 auto', padding: '10px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            + Create New Client Matter
          </button>
        </div>
      ) : (
        <div className="cases-grid">
          {activeCases.map(c => (
          <div key={c.id} className="case-card">
            <div className="case-card-header">
              <div className="case-title-wrap">
                <span className="case-card-title">{c.short_name || c.client_name}</span>
                <span className={"status-pill " + (c.status === 'closed' ? 'closed' : 'active')}>
                  {c.status === 'closed' ? 'Closed' : 'Active'}
                </span>
              </div>
              <Lock size={18} color="var(--brand-primary)" />
            </div>

            <div className="case-stats">
              <div 
                className="case-stat-item case-stat-clickable"
                onClick={(e) => {
                  e.stopPropagation();
                  setDocViewingCase(c);
                }}
                title="Click to inspect sandboxed documents"
                style={{ cursor: 'pointer' }}
              >
                <FileText size={18} color="var(--brand-primary)" strokeWidth={2} /> {c.files_count || 0} files
              </div>
              <div className="case-stat-item">
                <Brain size={18} color="var(--brand-primary)" strokeWidth={2} /> {c.memories_count !== undefined ? c.memories_count : 0} memories
              </div>
            </div>

            <div className="case-divider"></div>

            <div className="case-card-footer">
              <div className="case-meta-zone">
                {c.status === 'closed' ? (
                  <div className="case-closed-info">
                    <span>Closed &bull; Memory purged on {formatDate(c.closed_at || c.created_at)}</span>
                    <span 
                      className="case-audit-link" 
                      onClick={() => setActiveTab && setActiveTab('logs')}
                      style={{ cursor: 'pointer' }}
                    >
                      View audit log <ExternalLink size={12} />
                    </span>
                  </div>
                ) : (
                  <div className="case-created-text">
                    Created {formatDate(c.created_at)}
                  </div>
                )}
              </div>

              <div className="case-buttons-row">
                <button className="btn-open" onClick={() => handleOpen(c)}>Open</button>
                {c.status === 'closed' ? (
                  <button 
                    className="btn-edit-case" 
                    onClick={() => setActiveTab && setActiveTab('logs')}
                    title="View OpenShell audit log"
                  >
                    <ExternalLink size={14} /> Audit Log
                  </button>
                ) : (
                  <>
                    <button className="btn-edit-case" onClick={(e) => handleOpenEditModal(c, e)}>
                      <Edit3 size={14} /> Edit
                    </button>
                    <button className="btn-close-case" onClick={(e) => handleOpenCloseModal(c, e)}>
                      Close
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {caseToClose && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth: '450px'}}>
            <div className="modal-header">
              <div style={{display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-primary)'}}>
                <AlertTriangle size={24} color="#F09A37" fill="#FDF3E6" /> 
                Close Matter & Shred Client Data
              </div>
              <X size={20} style={{cursor: 'pointer'}} onClick={() => setCaseToClose(null)} />
            </div>
            <div className="modal-body">
              <div style={{fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '16px'}}>
                Firm compliance policy mandates client data destruction upon matter closure:
              </div>
              <div className="warning-block warning-block-delete">
                <Trash2 size={22} style={{flexShrink: 0}} />
                <div>
                  Delete: <b>{purgeSummary ? purgeSummary.case_memories_count : 1}</b> case notes & matter rules,<br/>
                  <b>{purgeSummary ? purgeSummary.case_documents_count : (activeCases.find(c => c.id === caseToClose)?.files_count || 0)}</b> confidential client files & records
                </div>
              </div>
              <div className="warning-block warning-block-keep">
                <CheckCircle2 size={22} style={{flexShrink: 0}} />
                <div>Keep: Your professional drafting habits, Certificate of destruction audit log</div>
              </div>
            </div>
            <div className="modal-footer" style={{marginTop: '20px'}}>
              <button className="btn-outline" onClick={() => setCaseToClose(null)}>Cancel</button>
              <button className="btn-filled" style={{backgroundColor: '#B52B27'}} onClick={handleConfirmClose}>Confirm Shred & Close</button>
            </div>
          </div>
        </div>
      )}

      {showNewCaseModal && (
        <div className="modal-overlay" onClick={handleCancelNewCase}>
          <div className="modal-content" style={{ maxWidth: '560px', maxHeight: '92vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Create New Client Matter</h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  OpenShell Sandboxed &bull; Zero-Leak Matter Vault
                </div>
              </div>
              <X size={20} style={{cursor: 'pointer'}} onClick={handleCancelNewCase} />
            </div>

            <div className="modal-body" style={{ padding: '20px 24px' }}>
              {/* Smart Drag & Drop Intake Auto-Fill */}
              <div style={{
                border: autoExtracted ? '2px solid #2f7d46' : '2px dashed var(--brand-primary)',
                borderRadius: '12px',
                padding: '18px 16px',
                textAlign: 'center',
                backgroundColor: autoExtracted ? 'rgba(47, 125, 70, 0.05)' : 'rgba(179, 117, 82, 0.05)',
                position: 'relative',
                marginBottom: '18px',
                transition: 'all var(--transition-fast)'
              }}>
                <input 
                  type="file" 
                  id="file-upload" 
                  accept=".pdf,.docx,.doc,.txt"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: isAnalyzingFile ? 'wait' : 'pointer', zIndex: 1 }} 
                  onChange={handleFileChange}
                  disabled={isAnalyzingFile}
                />
                
                {isAnalyzingFile ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                    <Loader2 size={26} color="var(--brand-primary)" style={{ animation: 'spin 1s linear infinite' }} />
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--brand-primary)' }}>
                      Nemotron Super analyzing document...
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Extracting client entity, counterparty, jurisdiction & matter summary
                    </div>
                  </div>
                ) : autoExtracted ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2f7d46', fontWeight: 800, fontSize: '0.92rem' }}>
                      <CheckCircle2 size={18} /> Contract Analyzed & Pre-Filled
                    </div>
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)', fontWeight: 600, wordBreak: 'break-all', maxWidth: '90%' }}>
                      📄 {selectedFile}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                      Review auto-detected matter fields below, or drop another document to re-parse.
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleClearForm();
                      }}
                      style={{
                        marginTop: 4,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '5px 12px',
                        fontSize: '0.78rem',
                        borderRadius: '6px',
                        border: '1px solid #d28585',
                        backgroundColor: '#fff5f5',
                        color: '#b52b27',
                        cursor: 'pointer',
                        fontWeight: 600,
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffe5e5'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff5f5'}
                    >
                      <Trash2 size={12} /> Clear Attached Document & Reset Form
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={24} color="var(--brand-primary)" />
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      Drop Contract to Auto-Fill Matter Details
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      Drag CUAD commercial agreement, SEC exhibit, or court filing (.pdf, .docx, .txt)<br />
                      <span style={{ color: 'var(--brand-primary)', textDecoration: 'underline' }}>Browse files</span> or fill manually below.
                    </div>
                  </div>
                )}
              </div>

              {/* Section Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0 16px', color: 'var(--text-tertiary)', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border-light)' }}></div>
                <span>Matter Profile {autoExtracted && <span style={{ color: '#2f7d46', textTransform: 'none' }}>✨ AI Populated</span>}</span>
                <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border-light)' }}></div>
              </div>

              <div className="form-group" style={{ marginBottom: 14 }}>
                <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Case Title / Matter Name *</span>
                  {autoExtracted && <span style={{ color: '#2f7d46', fontSize: '0.75rem', fontWeight: 700 }}>Auto-detected</span>}
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Synergy Resources v. Holloway" 
                  value={newCaseName} 
                  onChange={(e) => setNewCaseName(e.target.value)} 
                />
              </div>

              <div className="form-group" style={{ marginBottom: 14 }}>
                <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Client Name / Primary Entity *</span>
                  <span className="help-text" style={{ marginTop: 0 }}>Privacy & privilege boundary</span>
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Synergy Resources Corporation" 
                  value={clientName} 
                  onChange={(e) => setClientName(e.target.value)} 
                />
              </div>

              <div className="form-group" style={{ marginBottom: 14 }}>
                <label>Opposing Party / Counterparty (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Ed Holloway" 
                  value={opponentName} 
                  onChange={(e) => setOpponentName(e.target.value)} 
                />
                <button 
                  type="button" 
                  className="btn-outline" 
                  style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', padding: '6px 12px' }} 
                  onClick={runConflictCheck}
                >
                  <ShieldCheck size={14} /> Run Conflict Pre-Flight Check
                </button>
                {conflictResult && (
                  <div className="help-text" style={{ color: conflictResult.status === 'clear' ? '#2f7d46' : '#b52b27', fontWeight: 700, marginTop: 6 }}>
                    {conflictResult.status === 'clear' ? '✓ Conflict check clear: No matching entities across existing matters.' : `⚠ Conflict review required: ${conflictResult.matches.length} matching matter(s) detected.`}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Jurisdiction</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Delaware Chancery Court" 
                    value={newJurisdiction} 
                    onChange={(e) => setNewJurisdiction(e.target.value)} 
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Practice Area</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Executive Employment" 
                    value={newPracticeArea} 
                    onChange={(e) => setNewPracticeArea(e.target.value)} 
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 4 }}>
                <label>Matter Scope & Summary</label>
                <input 
                  type="text" 
                  placeholder="Brief summary of key contractual covenants or dispute..." 
                  value={newDescription} 
                  onChange={(e) => setNewDescription(e.target.value)} 
                />
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                {(autoExtracted || selectedFile || clientName || newCaseName) && (
                  <button
                    type="button"
                    className="btn-text"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: '0.82rem',
                      color: 'var(--text-tertiary)',
                      padding: '6px 8px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onClick={handleClearForm}
                    disabled={isCreatingCase || isAnalyzingFile}
                  >
                    <RotateCcw size={13} /> Reset Form
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn-outline" onClick={handleCancelNewCase} disabled={isCreatingCase || isAnalyzingFile}>
                    Cancel
                  </button>
                  <button 
                    className="btn-filled" 
                    onClick={handleCreateCase} 
                    disabled={isCreatingCase || isAnalyzingFile}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: '190px', justifyContent: 'center' }}
                  >
                    {isCreatingCase ? (
                      <>
                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> {creationStep || 'Establishing Sandbox...'}
                      </>
                    ) : (
                      <>
                        <Lock size={15} /> Create Matter & Index Vault
                      </>
                    )}
                  </button>
                </div>
                {isCreatingCase && (
                  <div style={{ fontSize: '0.74rem', color: 'var(--brand-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>⚡ {creationStep.includes('Vectorizing') ? 'Computing private 4096-dim Qwen embeddings via Nebius Token Factory...' : 'Allocating isolated physical kernel sandbox...'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {caseToEdit && (
        <div className="modal-overlay" onClick={() => setCaseToEdit(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                <Edit3 size={20} color="var(--brand-primary)" />
                <h2>Edit Case Details</h2>
              </div>
              <X size={20} style={{cursor: 'pointer'}} onClick={() => setCaseToEdit(null)} />
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Case Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Synergy Resources v. Holloway" 
                  value={editShortName} 
                  onChange={(e) => setEditShortName(e.target.value)} 
                />
                <div className="help-text">Display title used across chat, reports, and audit logs.</div>
              </div>
              <div className="form-group">
                <label>Client Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Ed Holloway" 
                  value={editClientName} 
                  onChange={(e) => setEditClientName(e.target.value)} 
                />
                <div className="help-text">Used for privacy masking, boundary controls, and privilege.</div>
              </div>
              <div className="form-group">
                <label>Opposing Party (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Synergy Resources Corp." 
                  value={editOpponent} 
                  onChange={(e) => setEditOpponent(e.target.value)} 
                />
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
                <div className="form-group">
                  <label>Jurisdiction (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Colorado / Federal" 
                    value={editJurisdiction} 
                    onChange={(e) => setEditJurisdiction(e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label>Practice Area (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Employment Law" 
                    value={editPracticeArea} 
                    onChange={(e) => setEditPracticeArea(e.target.value)} 
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setCaseToEdit(null)}>Cancel</button>
              <button 
                className="btn-filled" 
                onClick={handleSaveEdit} 
                disabled={isUpdating}
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Case Documents Sandbox Modal */}
      <CaseDocumentsModal
        isOpen={!!docViewingCase}
        onClose={() => setDocViewingCase(null)}
        activeCase={docViewingCase}
        onSelectDocumentForChat={(prompt) => {
          if (onOpenCase && docViewingCase) {
            onOpenCase(docViewingCase);
          }
        }}
        onRefreshCase={fetchCases}
      />
    </div>
  );
}
