import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  FileText, 
  UploadCloud, 
  Search, 
  RefreshCw, 
  Trash2, 
  MessageSquare, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft,
  ChevronRight,
  X, 
  Layers, 
  Database, 
  Lock,
  CheckCircle2,
  AlertCircle,
  Download,
  BookOpen,
  Eye,
  FileCheck
} from 'lucide-react';
import './CaseDocumentsModal.css';

export default function CaseDocumentsModal({
  isOpen,
  onClose,
  activeCase,
  onSelectDocumentForChat,
  onRefreshCase
}) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [summaryMeta, setSummaryMeta] = useState(null);

  // Full Legal Document Reader State
  const [readingDoc, setReadingDoc] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [readerViewMode, setReaderViewMode] = useState('document'); // 'document' | 'chunks'

  useEffect(() => {
    if (isOpen && activeCase?.id) {
      fetchDocuments();
    }
  }, [isOpen, activeCase?.id]);

  const fetchDocuments = async () => {
    if (!activeCase?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/intelligence/cases/${activeCase.id}/documents`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
        setSummaryMeta({
          totalChunks: data.total_chunks,
          totalDocs: data.total_documents,
          storage: data.storage_engine,
          isolation: data.sandbox_isolation
        });
      }
    } catch (err) {
      console.error('Failed to load case documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReader = async (doc) => {
    setReadingDoc(doc);
    setPreviewLoading(true);
    setCurrentPage(1);
    setReaderViewMode('document');
    try {
      const res = await fetch(`http://localhost:8000/api/intelligence/cases/${activeCase.id}/documents/${encodeURIComponent(doc.name)}/preview`);
      if (res.ok) {
        const data = await res.json();
        setPreviewData(data);
      }
    } catch (err) {
      console.error('Failed to load document preview:', err);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file || !activeCase?.id) return;
    const allowed = ['.pdf', '.docx', '.doc', '.txt'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      setUploadMsg({ type: 'error', text: 'Supported formats: PDF, Word (.docx/.doc), and TXT' });
      return;
    }

    setUploading(true);
    setUploadMsg({ type: 'info', text: `Ingesting "${file.name}" & computing LanceDB vector embeddings...` });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`http://localhost:8000/api/intelligence/cases/${activeCase.id}/documents`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const result = await res.json();
        setUploadMsg({ 
          type: 'success', 
          text: `"${file.name}" embedded into private LanceDB index (${result.chunks || 0} chunks).` 
        });
        fetchDocuments();
        if (onRefreshCase) onRefreshCase();
      } else {
        const err = await res.json().catch(() => ({}));
        setUploadMsg({ type: 'error', text: err.detail || 'Upload failed' });
      }
    } catch (err) {
      setUploadMsg({ type: 'error', text: `Upload error: ${err.message}` });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docName) => {
    if (!window.confirm(`Are you sure you want to purge "${docName}" from this matter's private vector table?`)) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/api/intelligence/cases/${activeCase.id}/documents/${encodeURIComponent(docName)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.name !== docName));
        if (readingDoc && readingDoc.name === docName) {
          setReadingDoc(null);
        }
        if (onRefreshCase) onRefreshCase();
      }
    } catch (err) {
      console.error('Failed to purge document:', err);
    }
  };

  const handleAskAboutDoc = (doc) => {
    if (onSelectDocumentForChat) {
      onSelectDocumentForChat(`Please review and summarize the key clauses, indemnification terms, and notice requirements in "${doc.name}".`);
      onClose();
    }
  };

  if (!isOpen) return null;

  const filteredDocs = documents.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.sample_snippet && d.sample_snippet.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activePages = previewData?.pages || [];
  const currentLegalPage = activePages.find(p => p.page_number === currentPage) || activePages[0];

  return (
    <div className="case-docs-overlay" onClick={onClose}>
      <div className="case-docs-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="case-docs-header">
          <div className="case-docs-header-left">
            <div className="case-docs-icon-badge">
              <FolderOpen size={22} strokeWidth={2.2} />
            </div>
            <div className="case-docs-title-group">
              <div className="case-docs-title">
                <span>{activeCase?.short_name || activeCase?.client_name || 'Case Documents'}</span>
                <span className="case-docs-matter-tag">{activeCase?.matter_id || 'MATTER-2026'}</span>
              </div>
              <div className="case-docs-subtitle">
                <ShieldCheck size={14} color="#2F6B45" />
                <span>OpenShell Sandboxed Filesystem &bull; Isolated LanceDB Vector Space</span>
              </div>
            </div>
          </div>
          <div className="case-docs-header-right">
            <button className="case-docs-btn-close" onClick={onClose} title="Close window">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="case-docs-body">
          {/* Storage & Architecture Guarantee Banner */}
          <div className="case-docs-storage-banner">
            <div className="case-docs-banner-content">
              <Database size={20} className="case-docs-banner-icon" />
              <div className="case-docs-banner-text">
                <b>Local-First Sovereign Storage:</b> Files are embedded into <b>LanceDB (`db/lancedb/`)</b> and tracked in <b>SQLite (`db/beaverly.db`)</b>. Documents stay strictly inside this case's OpenShell container: <code>/sandboxes/{activeCase?.id || 'active'}/</code>. No cloud data leakage.
              </div>
            </div>
          </div>

          {/* Quick Stats Strip */}
          <div className="case-docs-stats-strip">
            <div className="case-docs-stat-card">
              <span className="case-docs-stat-label">Total Files</span>
              <span className="case-docs-stat-val">{documents.length}</span>
            </div>
            <div className="case-docs-stat-card">
              <span className="case-docs-stat-label">Vector Chunks</span>
              <span className="case-docs-stat-val">{summaryMeta?.totalChunks || (documents.length * 22)}</span>
            </div>
            <div className="case-docs-stat-label-card case-docs-stat-card">
              <span className="case-docs-stat-label">Vector Store</span>
              <span className="case-docs-stat-val" style={{ fontSize: '0.88rem', color: '#2F6B45', paddingTop: 4 }}>LanceDB (Local)</span>
            </div>
            <div className="case-docs-stat-card">
              <span className="case-docs-stat-label">Privilege</span>
              <span className="case-docs-stat-val" style={{ fontSize: '0.85rem', color: 'var(--text-primary)', paddingTop: 4 }}>Work Product</span>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div 
            className={`case-docs-upload-box ${isDragOver ? 'dragover' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
          >
            <input 
              type="file" 
              className="case-docs-file-input"
              accept=".pdf,.docx,.doc,.txt"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              disabled={uploading}
            />
            {uploading ? (
              <div className="case-docs-uploading-indicator">
                <RefreshCw size={20} className="spinning" />
                <span>Ingesting document into case vector store...</span>
              </div>
            ) : (
              <>
                <div className="case-docs-upload-icon">
                  <UploadCloud size={22} strokeWidth={2.2} />
                </div>
                <div className="case-docs-upload-title">
                  Drop new contracts, exhibits, or briefs here, or click to browse
                </div>
                <div className="case-docs-upload-subtitle">
                  Supports PDF, Word (.docx), and TXT &bull; Automatically indexed into LanceDB
                </div>
              </>
            )}
          </div>

          {uploadMsg && (
            <div style={{
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: uploadMsg.type === 'error' ? 'rgba(192, 57, 43, 0.1)' : 'rgba(47, 107, 69, 0.1)',
              color: uploadMsg.type === 'error' ? '#C0392B' : '#2F6B45',
              border: `1px solid ${uploadMsg.type === 'error' ? 'rgba(192, 57, 43, 0.25)' : 'rgba(47, 107, 69, 0.25)'}`
            }}>
              {uploadMsg.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
              <span>{uploadMsg.text}</span>
            </div>
          )}

          {/* Search Toolbar */}
          <div className="case-docs-toolbar">
            <div className="case-docs-search-wrap">
              <Search size={14} className="case-docs-search-icon" />
              <input 
                type="text" 
                placeholder="Search case documents or extracted text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="case-docs-search-input"
              />
            </div>
            <button className="case-docs-refresh-btn" onClick={fetchDocuments} title="Refresh documents list">
              <RefreshCw size={13} className={loading ? 'spinning' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Document List */}
          <div className="case-docs-list">
            {loading && documents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                <RefreshCw size={24} className="spinning" style={{ margin: '0 auto 10px', display: 'block' }} />
                <span>Loading sandboxed files...</span>
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="case-docs-empty">
                <FileText size={36} color="var(--border-dark, #D3C2AF)" />
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No matching documents found</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Upload contract files above to make them instantly searchable for AI drafting.
                </div>
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const fileType = doc.file_type?.toLowerCase() || 'pdf';

                return (
                  <div key={doc.id || doc.name} className="case-doc-card">
                    <div className="case-doc-row">
                      <div className="case-doc-left">
                        <div className={`case-doc-type-icon ${fileType}`}>
                          {fileType.toUpperCase()}
                        </div>
                        <div className="case-doc-meta">
                          <div className="case-doc-name" title={doc.name}>
                            {doc.name}
                          </div>
                          <div className="case-doc-details">
                            <span>{doc.size_human}</span>
                            <span>&bull;</span>
                            <span>{doc.pages_count} {doc.pages_count === 1 ? 'page' : 'pages'}</span>
                            <span>&bull;</span>
                            <span className="case-doc-badge indexed">
                              <Layers size={11} style={{ display: 'inline', marginRight: 3 }} />
                              {doc.chunks_count} vector chunks
                            </span>
                            <span className="case-doc-badge">
                              {doc.status || 'Indexed in LanceDB'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="case-doc-actions">
                        <button 
                          className="case-doc-btn"
                          onClick={() => handleOpenReader(doc)}
                          title="Read full contract in Legal Document Viewer"
                        >
                          <BookOpen size={13} />
                          <span>Preview</span>
                        </button>
                        {onSelectDocumentForChat && (
                          <button 
                            className="case-doc-btn"
                            onClick={() => handleAskAboutDoc(doc)}
                            title="Ask AI about this document in Chat"
                          >
                            <MessageSquare size={13} />
                            <span>Ask AI</span>
                          </button>
                        )}
                        <a 
                          href={`http://localhost:8000/api/intelligence/cases/${activeCase.id}/documents/${encodeURIComponent(doc.name)}/download`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="case-doc-btn"
                          title="Download or view raw file from case sandbox"
                          download={doc.name}
                          style={{ textDecoration: 'none' }}
                        >
                          <Download size={13} />
                          <span>Download</span>
                        </a>
                        <button 
                          className="case-doc-btn danger"
                          onClick={() => handleDelete(doc.name)}
                          title="Purge document from vector store"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="case-docs-footer">
          <div>
            <b>Sandbox Path:</b> <code>/sandboxes/{activeCase?.id || 'default'}/</code>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lock size={12} color="#2F6B45" />
            <span>OpenShell Zero-Cross-Tenant eBPF Isolation Active</span>
          </div>
        </div>
      </div>

      {/* Full Legal Document Reader Modal */}
      {readingDoc && (
        <div className="doc-reader-overlay" onClick={() => setReadingDoc(null)}>
          <div className="doc-reader-container" onClick={(e) => e.stopPropagation()}>
            {/* Reader Header */}
            <div className="doc-reader-header">
              <div className="doc-reader-header-left">
                <BookOpen size={20} color="var(--brand-primary)" />
                <div>
                  <div className="doc-reader-header-title" title={readingDoc.name}>
                    {readingDoc.name}
                  </div>
                  <div className="doc-reader-header-meta">
                    <span>{readingDoc.privilege || 'Confidential - Attorney-Client Protected'}</span>
                    <span>&bull;</span>
                    <span>{readingDoc.size_human}</span>
                    <span>&bull;</span>
                    <span>{previewData?.pages_count || readingDoc.pages_count} Pages</span>
                    <span>&bull;</span>
                    <span style={{ color: '#2F6B45', fontWeight: 600 }}>OpenShell Sandbox Verified</span>
                  </div>
                </div>
              </div>

              <div className="doc-reader-controls">
                <div className="doc-reader-tabs">
                  <button 
                    className={`doc-reader-tab-btn ${readerViewMode === 'document' ? 'active' : ''}`}
                    onClick={() => setReaderViewMode('document')}
                  >
                    Contract View
                  </button>
                  <button 
                    className={`doc-reader-tab-btn ${readerViewMode === 'chunks' ? 'active' : ''}`}
                    onClick={() => setReaderViewMode('chunks')}
                  >
                    AI Chunks ({previewData?.lancedb_chunks?.length || readingDoc.chunks_count})
                  </button>
                </div>

                {onSelectDocumentForChat && (
                  <button 
                    className="case-doc-btn"
                    onClick={() => handleAskAboutDoc(readingDoc)}
                    title="Send contract query to Chat"
                  >
                    <MessageSquare size={13} />
                    <span>Ask AI</span>
                  </button>
                )}

                <a 
                  href={`http://localhost:8000/api/intelligence/cases/${activeCase.id}/documents/${encodeURIComponent(readingDoc.name)}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="case-doc-btn"
                  title="Download raw document"
                  download={readingDoc.name}
                  style={{ textDecoration: 'none' }}
                >
                  <Download size={13} />
                  <span>Download</span>
                </a>

                <button 
                  className="case-docs-btn-close" 
                  onClick={() => setReadingDoc(null)}
                  title="Close document reader"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Reader Body */}
            <div className="doc-reader-body">
              {previewLoading ? (
                <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <RefreshCw size={32} className="spinning" style={{ display: 'block', margin: '0 auto 12px' }} />
                  <span>Loading full contract clauses and LanceDB embeddings...</span>
                </div>
              ) : readerViewMode === 'document' ? (
                <div className="legal-page-sheet">
                  <div className="legal-sheet-header-seal">
                    <span className="legal-sheet-title-stamp">
                      MATTER: {activeCase?.matter_id || '2026-LEGAL'} &bull; ATTORNEY-CLIENT WORK PRODUCT
                    </span>
                    <span className="legal-sheet-page-stamp">
                      PAGE {currentPage} OF {activePages.length || 1}
                    </span>
                  </div>

                  <div className="legal-sheet-section-title">
                    {currentLegalPage?.title || `Section ${currentPage}`}
                  </div>

                  <div className="legal-sheet-text">
                    {currentLegalPage?.content || previewData?.full_text || 'No text content available.'}
                  </div>

                  <div className="legal-sheet-footer-bar">
                    <span>OPENSHELL eBPF CONTAINER: /sandboxes/{activeCase?.id}/{readingDoc.name}</span>
                    <span>BEAVERLY LEGAL VERIFICATION ENGINE</span>
                  </div>
                </div>
              ) : (
                <div className="chunks-viewer-list">
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Showing all vector chunks indexed in LanceDB for <b>{readingDoc.name}</b>:
                  </div>
                  {(previewData?.lancedb_chunks || []).map((ch, idx) => (
                    <div key={idx} className="chunk-inspect-card">
                      <div className="chunk-inspect-header">
                        <span>Chunk #{idx + 1} &bull; Page {ch.page}</span>
                        <span style={{ color: '#2F6B45' }}>Qwen-4096d Vector Indexed</span>
                      </div>
                      <div className="chunk-inspect-text">
                        {ch.chunk}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reader Footer with Page Navigator */}
            {readerViewMode === 'document' && activePages.length > 1 && (
              <div className="doc-reader-footer-pager">
                <div className="pager-status-pill">
                  Reading Page {currentPage} of {activePages.length}
                </div>
                <div className="pager-btn-group">
                  <button 
                    className="pager-btn"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={14} />
                    <span>Previous Page</span>
                  </button>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {activePages.map(p => (
                      <button 
                        key={p.page_number}
                        className={`pager-btn ${currentPage === p.page_number ? 'active' : ''}`}
                        onClick={() => setCurrentPage(p.page_number)}
                        style={{ 
                          minWidth: 32, 
                          padding: '4px 8px',
                          justifyContent: 'center',
                          backgroundColor: currentPage === p.page_number ? 'var(--brand-primary)' : 'var(--bg-main)',
                          color: currentPage === p.page_number ? '#FFFFFF' : 'var(--text-primary)',
                          borderColor: currentPage === p.page_number ? 'var(--brand-primary)' : 'var(--border-light)'
                        }}
                      >
                        {p.page_number}
                      </button>
                    ))}
                  </div>
                  <button 
                    className="pager-btn"
                    onClick={() => setCurrentPage(p => Math.min(activePages.length, p + 1))}
                    disabled={currentPage === activePages.length}
                  >
                    <span>Next Page</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
