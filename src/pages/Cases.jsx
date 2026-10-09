import React, { useState, useEffect } from 'react';
import { Lock, FileText, Brain, ExternalLink, AlertTriangle, X, Trash2, CheckCircle2 } from 'lucide-react';
import './Cases.css';

export default function Cases({ setActiveTab, onOpenCase }) {
  const [caseToClose, setCaseToClose] = useState(null);
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [newCaseName, setNewCaseName] = useState('');
  const [clientName, setClientName] = useState('');
  const [opponentName, setOpponentName] = useState('');
  
  const [activeCases, setActiveCases] = useState([]);

  const fetchCases = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/cases/');
      const data = await res.json();
      setActiveCases(data);
    } catch (error) {
      console.error('Failed to fetch cases:', error);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleConfirmClose = async () => {
    if (!caseToClose) return;
    try {
      const res = await fetch(`http://localhost:8000/api/cases/${caseToClose}/close`, { method: 'PATCH' });
      if (res.ok) {
        await fetchCases();
        setCaseToClose(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0].name);
    }
  };

  const handleCreateCase = async () => {
    if (!clientName.trim() && !newCaseName.trim()) {
      alert('Please enter a Client Name or Case Name');
      return;
    }
    const finalName = newCaseName.trim() || 'Untitled Case';
    
    try {
      const res = await fetch('http://localhost:8000/api/cases/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: clientName.trim() || 'Unknown Client',
          opponent: opponentName.trim(),
          short_name: finalName,
          jurisdiction: '',
          practice_area: '',
          lead_counsel: '',
          description: ''
        })
      });
      if (res.ok) {
        fetchCases();
        setShowNewCaseModal(false);
        setNewCaseName('');
        setClientName('');
        setOpponentName('');
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Error creating case:', error);
    }
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
          <img src="/src/assets/belawbeaver.jpg" alt="Mascot" className="cases-mascot-peek" />
          <div className="cases-count-pill">{activeCases.length} cases</div>
          <button className="btn-filled" style={{display: 'flex', alignItems: 'center', gap: 6, marginLeft: '8px'}} onClick={() => setShowNewCaseModal(true)}>
            <div style={{fontSize: '18px', fontWeight: 'bold'}}>+</div> New Case
          </button>
        </div>
      </div>

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
              <div className="case-stat-item">
                <FileText size={18} color="var(--brand-primary)" strokeWidth={2} /> {c.files_count || 0} files
              </div>
              <div className="case-stat-item">
                <Brain size={18} color="var(--brand-primary)" strokeWidth={2} /> {c.memories_count !== undefined ? c.memories_count : (c.id === 'case-abc-mock' ? 5 : 0)} memories
              </div>
            </div>

            <div className="case-divider"></div>

            <div className="case-card-footer">
              {c.status === 'closed' ? (
                <>
                  <div className="case-closed-info">
                    <span>Closed &bull; Memory deleted on {formatDate(c.closed_at || c.created_at)}</span>
                    <span 
                      className="case-audit-link" 
                      onClick={() => setActiveTab && setActiveTab('logs')}
                      style={{ cursor: 'pointer' }}
                    >
                      View audit log <ExternalLink size={14} />
                    </span>
                  </div>
                  <button className="btn-open" style={{ marginTop: 8 }} onClick={() => handleOpen(c)}>
                    Open
                  </button>
                </>
              ) : (
                <>
                  <div className="case-created-text">Created {formatDate(c.created_at)}</div>
                  <div className="case-buttons-row">
                    <button className="btn-open" onClick={() => handleOpen(c)}>Open</button>
                    <button className="btn-close-case" onClick={() => setCaseToClose(c.id)}>Close Case</button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {caseToClose && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth: '450px'}}>
            <div className="modal-header">
              <div style={{display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-primary)'}}>
                <AlertTriangle size={24} color="#F09A37" fill="#FDF3E6" /> 
                Close Case
              </div>
              <X size={20} style={{cursor: 'pointer'}} onClick={() => setCaseToClose(null)} />
            </div>
            <div className="modal-body">
              <div style={{fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '16px'}}>
                Closing this case will:
              </div>
              <div className="warning-block warning-block-delete">
                <Trash2 size={22} style={{flexShrink: 0}} />
                <div>Delete: 3 case memories,<br/>2 case-specific skills</div>
              </div>
              <div className="warning-block warning-block-keep">
                <CheckCircle2 size={22} style={{flexShrink: 0}} />
                <div>Keep: global skills, audit log</div>
              </div>
            </div>
            <div className="modal-footer" style={{marginTop: '20px'}}>
              <button className="btn-outline" onClick={() => setCaseToClose(null)}>Cancel</button>
              <button className="btn-filled" style={{backgroundColor: '#B52B27'}} onClick={handleConfirmClose}>Confirm Deletion</button>
            </div>
          </div>
        </div>
      )}

      {showNewCaseModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Case</h2>
              <X size={20} style={{cursor: 'pointer'}} onClick={() => setShowNewCaseModal(false)} />
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Case Name *</label>
                <input type="text" placeholder="e.g. Chen Employment Dispute" value={newCaseName} onChange={(e) => setNewCaseName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Client Name *</label>
                <input type="text" placeholder="e.g. Chen Li" value={clientName} onChange={(e) => setClientName(e.target.value)} />
                <div className="help-text">Used for privacy masking and memory boundaries.</div>
              </div>
              <div className="form-group">
                <label>Opposing Party (Optional)</label>
                <input type="text" placeholder="e.g. ABC Holdings" value={opponentName} onChange={(e) => setOpponentName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Initial Documents (Optional)</label>
                <div style={{
                  border: '1px dashed var(--border-light)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '20px',
                  textAlign: 'center',
                  backgroundColor: 'rgba(253, 243, 230, 0.5)',
                  position: 'relative'
                }}>
                  <input type="file" id="file-upload" style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer'}} onChange={handleFileChange} />
                  <div style={{color: 'var(--text-tertiary)', fontSize: '0.9rem', pointerEvents: 'none'}}>
                    {selectedFile ? (
                      <span style={{color: 'var(--brand-primary)', fontWeight: 'bold'}}>📁 {selectedFile}</span>
                    ) : (
                      <>Drag and drop PDFs/Docs here, or <span style={{color: 'var(--brand-primary)', textDecoration: 'underline'}}>browse files</span></>
                    )}
                  </div>
                </div>
                <div className="help-text">Files are kept strictly private to this case and are used to automatically fact-check AI drafts.</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowNewCaseModal(false)}>Cancel</button>
              <button className="btn-filled" onClick={handleCreateCase}>Create Case</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
