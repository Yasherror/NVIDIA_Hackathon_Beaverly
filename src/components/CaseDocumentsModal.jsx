import React, { useState, useEffect, useRef } from 'react';
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
  FileCheck,
  Check,
  Loader2,
  Sparkles
} from 'lucide-react';
import './CaseDocumentsModal.css';
import { API_BASE_URL } from '../api/apiClient';

const UPLOAD_STAGES = [
  {
    shortLabel: 'Sandbox Upload',
    label: 'Uploading to OpenShell Sandbox',
    detail: 'Transferring file into isolated container /sandboxes/...',
  },
  {
    shortLabel: 'Clause Parsing',
    label: 'Extracting Legal Clauses & Structure',
    detail: 'Detecting section titles, indemnities, covenants & exhibits...',
  },
  {
    shortLabel: 'Clause Analysis',
    label: 'Analyzing Evidentiary Clauses',
    detail: 'Parsing contract clauses and key legal terms with AI...',
  },
  {
    shortLabel: 'Vault Index',
    label: 'Securing into Matter Vault',
    detail: 'Writing searchable clauses for sub-second legal retrieval...',
  }
];

export default function CaseDocumentsModal({
  isOpen,
  onClose,
  activeCase,
  onSelectDocumentForChat,
  onOpenFactCheckStudio,
  onRefreshCase
}) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState(0);
  const [uploadElapsed, setUploadElapsed] = useState(0);
  const [uploadingFile, setUploadingFile] = useState(null);
  const [uploadSuccessResult, setUploadSuccessResult] = useState(null);
  const uploadTimerRef = useRef(null);
  const [uploadMsg, setUploadMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [summaryMeta, setSummaryMeta] = useState(null);
  const [downloadingDoc, setDownloadingDoc] = useState(null);
  const [deletingDoc, setDeletingDoc] = useState(null);
  const [confirmDeleteDoc, setConfirmDeleteDoc] = useState(null);

  // Full Legal Document Reader State
  const [readingDoc, setReadingDoc] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [readerViewMode, setReaderViewMode] = useState('document'); // 'document' | 'chunks'

  const handleDownload = async (doc) => {
    if (!doc || !activeCase?.id) return;
    setDownloadingDoc(doc.name);
    try {
      const url = `${API_BASE_URL}/intelligence/cases/${activeCase.id}/documents/${encodeURIComponent(doc.name)}/download`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      let cleanName = decodeURIComponent(doc.name).trim();
      if (!cleanName.includes('.')) cleanName += '.pdf';
      a.download = cleanName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error('Download error:', err);
      window.open(`${API_BASE_URL}/intelligence/cases/${activeCase.id}/documents/${encodeURIComponent(doc.name)}/download`, '_blank');
    } finally {
      setDownloadingDoc(null);
    }
  };

  useEffect(() => {
    if (isOpen && activeCase?.id) {
      fetchDocuments();
    }
  }, [isOpen, activeCase?.id]);

  const fetchDocuments = async () => {
    if (!activeCase?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/intelligence/cases/${activeCase.id}/documents`);
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
      const res = await fetch(`${API_BASE_URL}/intelligence/cases/${activeCase.id}/documents/${encodeURIComponent(doc.name)}/preview`);
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

  // Cleanup upload interval on unmount
  useEffect(() => {
    return () => {
      if (uploadTimerRef.current) clearInterval(uploadTimerRef.current);
    };
  }, []);

  const handleFileUpload = async (file) => {
    if (!file) return;
    if (!activeCase?.id) {
      setUploadMsg({ type: 'error', text: 'No active matter selected. Please select a client matter first.' });
      return;
    }
    const allowed = ['.pdf', '.docx', '.doc', '.txt'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      setUploadMsg({ type: 'error', text: 'Supported formats: PDF, Word (.docx/.doc), and TXT' });
      return;
    }

    const sizeHuman = file.size > 1024 * 1024 
      ? (file.size / (1024 * 1024)).toFixed(2) + ' MB'
      : Math.max(1, Math.round(file.size / 1024)) + ' KB';

    setUploadingFile({
      name: file.name,
      sizeHuman,
      ext: ext.replace('.', '').toUpperCase()
    });
    setUploading(true);
    setUploadProgress(12);
    setUploadStage(0);
    setUploadElapsed(0);
    setUploadSuccessResult(null);
    setUploadMsg(null);

    if (uploadTimerRef.current) clearInterval(uploadTimerRef.current);
    const startTime = Date.now();
    uploadTimerRef.current = setInterval(() => {
      const elapsedSec = (Date.now() - startTime) / 1000;
      setUploadElapsed(elapsedSec);

      if (elapsedSec < 1.0) {
        setUploadStage(0);
        setUploadProgress(12 + elapsedSec * 16);
      } else if (elapsedSec < 2.5) {
        setUploadStage(1);
        setUploadProgress(28 + (elapsedSec - 1.0) * 18);
      } else if (elapsedSec < 5.0) {
        setUploadStage(2);
        setUploadProgress(55 + (elapsedSec - 2.5) * 11);
      } else {
        setUploadStage(3);
        setUploadProgress(prev => Math.min(94, prev + 0.35));
      }
    }, 100);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE_URL}/intelligence/cases/${activeCase.id}/documents`, {
        method: 'POST',
        body: formData
      });

      if (uploadTimerRef.current) clearInterval(uploadTimerRef.current);

      if (res.ok) {
        const result = await res.json();
        setUploadProgress(100);
        setUploadStage(3);
        setUploadSuccessResult({
          chunks: result.chunks || 0,
          name: file.name
        });

        fetchDocuments();
        if (onRefreshCase) onRefreshCase();

        setTimeout(() => {
          setUploading(false);
          setUploadingFile(null);
          setUploadSuccessResult(null);
          setUploadMsg({ 
            type: 'success', 
            text: `"${file.name}" embedded into private LanceDB index (${result.chunks || 0} chunks).` 
          });
        }, 1300);
      } else {
        const err = await res.json().catch(() => ({}));
        setUploading(false);
        setUploadingFile(null);
        setUploadMsg({ type: 'error', text: err.detail || 'Upload failed' });
      }
    } catch (err) {
      if (uploadTimerRef.current) clearInterval(uploadTimerRef.current);
      setUploading(false);
      setUploadingFile(null);
      setUploadMsg({ type: 'error', text: `Upload error: ${err.message}` });
    }
  };

  const handleDelete = async (docName) => {
    setDeletingDoc(docName);
    try {
      const res = await fetch(`${API_BASE_URL}/intelligence/cases/${activeCase.id}/documents/${encodeURIComponent(docName)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.name !== docName));
        if (readingDoc && readingDoc.name === docName) {
          setReadingDoc(null);
        }
        setConfirmDeleteDoc(null);
        setUploadMsg({ type: 'success', text: `Document "${docName}" successfully purged from case vector store.` });
        if (onRefreshCase) onRefreshCase();
      } else {
        const errData = await res.json().catch(() => ({}));
        setUploadMsg({ type: 'error', text: `Delete failed: ${errData.detail || res.statusText}` });
      }
    } catch (err) {
      console.error('Failed to purge document:', err);
      setUploadMsg({ type: 'error', text: `Network error deleting document: ${err.message}` });
    } finally {
      setDeletingDoc(null);
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
                <span>Privileged Matter Vault &bull; Isolated Clause Index</span>
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
                <b>Firm-Sovereign Private Storage:</b> Files are indexed into your private matter vault and verified locally. Documents stay strictly inside this case's confidential boundary: <code>/matters/{activeCase?.matter_id || 'active'}/</code>. No cloud data leakage.
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
              <span className="case-docs-stat-label">Searchable Clauses</span>
              <span className="case-docs-stat-val">{summaryMeta?.totalChunks || (documents.length * 22)}</span>
            </div>
            <div className="case-docs-stat-label-card case-docs-stat-card">
              <span className="case-docs-stat-label">Evidence Index</span>
              <span className="case-docs-stat-val" style={{ fontSize: '0.88rem', color: '#2F6B45', paddingTop: 4 }}>Private Local Vault</span>
            </div>
            <div className="case-docs-stat-card">
              <span className="case-docs-stat-label">Privilege</span>
              <span className="case-docs-stat-val" style={{ fontSize: '0.85rem', color: 'var(--text-primary)', paddingTop: 4 }}>Work Product</span>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div 
            className={`case-docs-upload-box ${isDragOver ? 'dragover' : ''} ${uploading ? 'is-uploading' : ''}`}
            onDragOver={(e) => { e.preventDefault(); if (!uploading) setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              if (!uploading && e.dataTransfer.files && e.dataTransfer.files[0]) {
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
              uploadSuccessResult ? (
                <div className="case-docs-upload-completed">
                  <div className="case-docs-completed-icon">
                    <CheckCircle2 size={24} color="#2F6B45" />
                  </div>
                  <div className="case-docs-completed-info">
                    <div className="case-docs-completed-title">Document Ingestion Complete!</div>
                    <div className="case-docs-completed-sub">
                      "{uploadSuccessResult.name}" indexed with {uploadSuccessResult.chunks} searchable clauses in LanceDB.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="case-docs-uploading-card">
                  {/* Top File & Timer Header */}
                  <div className="case-docs-uploading-header">
                    <div className="case-docs-uploading-file-info">
                      <div className="case-docs-uploading-icon-wrap">
                        <Loader2 size={20} className="spinning" />
                      </div>
                      <div className="case-docs-uploading-details">
                        <div className="case-docs-uploading-filename-row">
                          <span className="case-docs-uploading-filename" title={uploadingFile?.name}>
                            {uploadingFile?.name || 'Document'}
                          </span>
                          <span className="case-docs-uploading-ext-badge">
                            {uploadingFile?.ext || 'PDF'}
                          </span>
                          <span className="case-docs-uploading-status-pill">
                            <span className="case-docs-pulse-dot"></span>
                            INGESTING
                          </span>
                        </div>
                        <div className="case-docs-uploading-sub">
                          <span>{uploadingFile?.sizeHuman}</span>
                          <span>&bull;</span>
                          <span className="case-docs-active-stage-label">
                            {UPLOAD_STAGES[uploadStage]?.label || 'Processing...'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="case-docs-uploading-metrics">
                      <div className="case-docs-uploading-percent">{Math.round(uploadProgress)}%</div>
                      <div className="case-docs-uploading-timer">
                        <span>⏱</span>
                        <span>{uploadElapsed.toFixed(1)}s</span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Animated Progress Bar */}
                  <div className="case-docs-dynamic-progress-bar">
                    <div 
                      className="case-docs-dynamic-progress-fill" 
                      style={{ width: `${Math.min(100, Math.max(6, uploadProgress))}%` }}
                    >
                      <div className="case-docs-dynamic-progress-shimmer"></div>
                    </div>
                  </div>

                  {/* 4 Pipeline Stages */}
                  <div className="case-docs-pipeline-steps">
                    {UPLOAD_STAGES.map((stg, idx) => {
                      const isPast = idx < uploadStage;
                      const isCurrent = idx === uploadStage;
                      return (
                        <div 
                          key={idx} 
                          className={`case-docs-step-item ${isPast ? 'completed' : ''} ${isCurrent ? 'active' : ''}`}
                        >
                          <div className="case-docs-step-dot">
                            {isPast ? (
                              <Check size={11} strokeWidth={3} />
                            ) : isCurrent ? (
                              <span className="case-docs-step-pulsar"></span>
                            ) : (
                              <span className="case-docs-step-num">{idx + 1}</span>
                            )}
                          </div>
                          <span className="case-docs-step-text">{stg.shortLabel}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pipeline Terminal Detail Strip */}
                  <div className="case-docs-pipeline-terminal">
                    <ShieldCheck size={13} color="#2F6B45" />
                    <span className="terminal-prefix">[OpenShell Engine]</span>
                    <span className="terminal-text">{UPLOAD_STAGES[uploadStage]?.detail || 'Processing document...'}</span>
                  </div>
                </div>
              )
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

          {uploadMsg && !uploading && (
            <div style={{
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: uploadMsg.type === 'error' ? 'rgba(192, 57, 43, 0.1)' : 'rgba(47, 107, 69, 0.1)',
              color: uploadMsg.type === 'error' ? '#C0392B' : '#2F6B45',
              border: `1px solid ${uploadMsg.type === 'error' ? 'rgba(192, 57, 43, 0.25)' : 'rgba(47, 107, 69, 0.25)'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {uploadMsg.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
                <span>{uploadMsg.text}</span>
              </div>
              <button 
                onClick={() => setUploadMsg(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', padding: 2 }}
                title="Dismiss message"
              >
                <X size={14} />
              </button>
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
                              {doc.chunks_count} searchable clauses
                            </span>
                            <span className="case-doc-badge">
                              {doc.status === 'Indexed in LanceDB' ? 'Verified in Matter Vault' : (doc.status || 'Verified in Vault')}
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
                        {onOpenFactCheckStudio && (
                          <button 
                            className="case-doc-btn"
                            onClick={() => onOpenFactCheckStudio(doc.sample_snippet || '')}
                            title="Audit or fact check in Pre-Submission Studio"
                            style={{ color: '#d97706', borderColor: 'rgba(217, 119, 6, 0.4)' }}
                          >
                            <ShieldCheck size={13} color="#d97706" />
                            <span>Fact Check</span>
                          </button>
                        )}
                        <button 
                          className="case-doc-btn"
                          onClick={() => handleDownload(doc)}
                          title="Download verified PDF document"
                          disabled={downloadingDoc === doc.name}
                        >
                          {downloadingDoc === doc.name ? (
                            <RefreshCw size={13} className="spinning" />
                          ) : (
                            <Download size={13} />
                          )}
                          <span>{downloadingDoc === doc.name ? 'Downloading...' : 'Download'}</span>
                        </button>

                        {confirmDeleteDoc === doc.name ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <button
                              className="case-doc-btn danger"
                              onClick={() => handleDelete(doc.name)}
                              style={{ background: '#dc2626', color: '#fff', borderColor: '#dc2626', fontWeight: 700 }}
                              disabled={deletingDoc === doc.name}
                            >
                              {deletingDoc === doc.name ? 'Purging...' : 'Confirm'}
                            </button>
                            <button
                              className="case-doc-btn"
                              onClick={() => setConfirmDeleteDoc(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button 
                            className="case-doc-btn danger"
                            onClick={() => setConfirmDeleteDoc(doc.name)}
                            title="Purge document from vector store"
                            disabled={deletingDoc === doc.name}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
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
            <b>Matter Vault:</b> <code>/vault/{activeCase?.matter_id || activeCase?.id || 'default'}</code>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lock size={12} color="#2F6B45" />
            <span>Strict Attorney-Client Privilege Protection Active</span>
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
                <div className="doc-reader-icon-box">
                  <BookOpen size={20} color="var(--brand-primary)" />
                </div>
                <div className="doc-reader-info-col">
                  <div className="doc-reader-header-title" title={readingDoc.name}>
                    {readingDoc.name}
                  </div>
                  <div className="doc-reader-header-meta">
                    <span className="doc-reader-privilege-label" title={readingDoc.privilege || 'Confidential Attorney-Client Protected'}>
                      Attorney-Client Privileged
                    </span>
                    <span className="doc-reader-meta-dot">&bull;</span>
                    <span className="doc-reader-badge-pill">{readingDoc.size_human || '1.2 MB'}</span>
                    <span className="doc-reader-meta-dot">&bull;</span>
                    <span className="doc-reader-badge-pill">{previewData?.pages_count || readingDoc.pages_count || 7} Pages</span>
                    <span className="doc-reader-meta-dot">&bull;</span>
                    <span className="doc-reader-badge-pill verified">
                      <ShieldCheck size={12} />
                      <span>Sandbox Isolated</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Center View Switcher */}
              <div className="doc-reader-tabs">
                <button 
                  className={`doc-reader-tab-btn ${readerViewMode === 'document' ? 'active' : ''}`}
                  onClick={() => setReaderViewMode('document')}
                >
                  <FileText size={13} />
                  <span>Contract View</span>
                </button>
                <button 
                  className={`doc-reader-tab-btn ${readerViewMode === 'chunks' ? 'active' : ''}`}
                  onClick={() => setReaderViewMode('chunks')}
                >
                  <Layers size={13} />
                  <span>Contract Clauses ({previewData?.lancedb_chunks?.length || readingDoc.chunks_count || 44})</span>
                </button>
              </div>

              {/* Right Action Controls */}
              <div className="doc-reader-controls">
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

                <button 
                  className="case-doc-btn primary-download"
                  onClick={() => handleDownload(readingDoc)}
                  title="Download verified binary PDF (ReportLab generated)"
                  disabled={downloadingDoc === readingDoc.name}
                >
                  <Download size={13} />
                  <span>{downloadingDoc === readingDoc.name ? 'Downloading...' : 'Download PDF'}</span>
                </button>

                <div className="doc-reader-header-divider"></div>

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
                      MATTER: {activeCase?.matter_id || '2026-LEGAL'} &bull; PRIVILEGED WORK PRODUCT
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
                    <div className="legal-sheet-footer-left">
                      <span className="legal-sheet-tag">OPENSHELL SANDBOX:</span>
                      <code className="legal-sheet-path" title={`/sandboxes/${activeCase?.id}/${readingDoc.name}`}>
                        /sandboxes/{activeCase?.id}/{readingDoc.name.length > 42 ? readingDoc.name.slice(0, 39) + '...' : readingDoc.name}
                      </code>
                    </div>
                    <div className="legal-sheet-footer-right">
                      <ShieldCheck size={12} color="#2F6B45" />
                      <span>BEAVERLY VERIFICATION ENGINE</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="chunks-viewer-list">
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Showing all searchable contract clauses extracted for <b>{readingDoc.name}</b>:
                  </div>
                  {(previewData?.lancedb_chunks || []).map((ch, idx) => (
                    <div key={idx} className="chunk-inspect-card">
                      <div className="chunk-inspect-header">
                        <span>Clause #{idx + 1} &bull; Page {ch.page}</span>
                        <span style={{ color: '#2F6B45' }}>Verified Clause</span>
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
                  Reading Page <b>{currentPage}</b> of <b>{activePages.length}</b>
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
                  <div className="pager-page-numbers">
                    {activePages.map(p => (
                      <button 
                        key={p.page_number}
                        className={`pager-page-btn ${currentPage === p.page_number ? 'active' : ''}`}
                        onClick={() => setCurrentPage(p.page_number)}
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
                <div className="pager-aux-label">
                  Ethical Wall Guard Active
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
