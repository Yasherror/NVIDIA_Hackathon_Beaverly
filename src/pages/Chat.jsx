import React, { useState, useRef, useEffect } from 'react';
import { apiClient } from '../api/apiClient';
import { 
  MessageSquare, Folder, ChevronDown, ChevronRight, Lock, Sparkles, 
  Paperclip, Send, AlertTriangle, AlertCircle, User, 
  Loader2, Zap, ShieldCheck, Plus, Trash2, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import './Chat.css';

export default function Chat({ selectedCase, setSelectedCase }) {
  const [casesList, setCasesList] = useState([]);
  const [activeCase, setActiveCase] = useState(selectedCase || null);
  const [showCaseDropdown, setShowCaseDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const dropdownRef = useRef(null);

  // Close case dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowCaseDropdown(false);
      }
    };
    if (showCaseDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCaseDropdown]);

  // Threads per case ID: { [caseId]: [ { id, title, time, messages: [] } ] }
  const [threadsByCase, setThreadsByCase] = useState({});
  const [activeThreadId, setActiveThreadId] = useState(null);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Helper to obtain or generate default threads for a case
  const getCaseThreads = (caseId) => {
    if (!caseId) return [];
    if (threadsByCase[caseId] && threadsByCase[caseId].length > 0) {
      return threadsByCase[caseId];
    }
    return [
      { id: `${caseId}-t1`, title: 'Consultation & Drafting', time: 'Active Session', messages: [] },
      { id: `${caseId}-t2`, title: 'Evidence & Claims Review', time: 'Matter Notes', messages: [] }
    ];
  };

  const currentCaseThreads = activeCase ? (threadsByCase[activeCase.id] || getCaseThreads(activeCase.id)) : [];
  const currentThread = currentCaseThreads.find(t => t.id === activeThreadId) || currentCaseThreads[0] || null;
  const activeMessages = currentThread?.messages || [];

  // Fetch real cases from backend
  const fetchCases = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/cases/');
      const data = await res.json();
      setCasesList(data);
      if (!activeCase && data.length > 0) {
        const initial = data[0];
        setActiveCase(initial);
        if (setSelectedCase) setSelectedCase(initial);
        const initialThreads = getCaseThreads(initial.id);
        if (initialThreads.length > 0) {
          setActiveThreadId(initialThreads[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch cases:', error);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  // Sync when selectedCase prop changes (e.g. navigated from Cases page)
  useEffect(() => {
    if (selectedCase) {
      setActiveCase(selectedCase);
      const threads = threadsByCase[selectedCase.id] || getCaseThreads(selectedCase.id);
      if (threads.length > 0) {
        setActiveThreadId(threads[0].id);
      }
    }
  }, [selectedCase]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages, isLoading]);

  const handleSelectCase = (c) => {
    setActiveCase(c);
    if (setSelectedCase) setSelectedCase(c);
    setShowCaseDropdown(false);
    const threads = threadsByCase[c.id] || getCaseThreads(c.id);
    if (threads.length > 0) {
      setActiveThreadId(threads[0].id);
    }
  };

  // Create a new conversation thread
  const handleCreateNewThread = (caseId, e) => {
    if (e) e.stopPropagation();
    const targetCase = casesList.find(c => c.id === caseId) || activeCase;
    if (!targetCase) return;

    if (activeCase?.id !== targetCase.id) {
      setActiveCase(targetCase);
      if (setSelectedCase) setSelectedCase(targetCase);
    }

    const newThreadId = `thread-${Date.now()}`;
    const newThread = {
      id: newThreadId,
      title: 'New Conversation',
      time: 'Just now',
      messages: []
    };

    const existingThreads = threadsByCase[targetCase.id] || getCaseThreads(targetCase.id);
    setThreadsByCase(prev => ({
      ...prev,
      [targetCase.id]: [...existingThreads, newThread]
    }));
    setActiveThreadId(newThreadId);
  };

  // Delete a conversation thread
  const handleDeleteThread = (threadId, e) => {
    if (e) e.stopPropagation();
    if (!activeCase) return;

    const existing = threadsByCase[activeCase.id] || getCaseThreads(activeCase.id);
    if (existing.length <= 1) return; // Keep at least one thread

    const remaining = existing.filter(t => t.id !== threadId);
    setThreadsByCase(prev => ({
      ...prev,
      [activeCase.id]: remaining
    }));

    if (activeThreadId === threadId) {
      setActiveThreadId(remaining[0].id);
    }
  };

  const handleSend = async (customText = null) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || !activeCase) return;

    const thisThreadId = currentThread?.id || `${activeCase.id}-t1`;
    const userMessage = { role: 'user', content: textToSend.trim() };
    const currentMsgs = currentThread?.messages || [];
    const updatedMessages = [...currentMsgs, userMessage];

    // Auto-update thread title if it's the first message or titled "New Conversation"
    const isFirstMessage = currentThread?.title === 'New Conversation' || currentMsgs.length === 0;
    const newTitle = isFirstMessage 
      ? (textToSend.length > 25 ? textToSend.slice(0, 25) + '...' : textToSend)
      : (currentThread?.title || 'Conversation');

    const currentList = threadsByCase[activeCase.id] || getCaseThreads(activeCase.id);
    const updatedThreadsWithUser = currentList.map(t => {
      if (t.id === thisThreadId) {
        return {
          ...t,
          title: newTitle,
          time: 'Active now',
          messages: updatedMessages
        };
      }
      return t;
    });

    setThreadsByCase(prev => ({
      ...prev,
      [activeCase.id]: updatedThreadsWithUser
    }));
    setActiveThreadId(thisThreadId);
    setInput('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/chat/message', {
        case_id: activeCase.id,
        messages: updatedMessages
      });
      const assistantMessage = { role: 'assistant', content: response.content };
      setThreadsByCase(prev => {
        const list = prev[activeCase.id] || updatedThreadsWithUser;
        return {
          ...prev,
          [activeCase.id]: list.map(t => {
            if (t.id === thisThreadId) {
              return {
                ...t,
                messages: [...t.messages, assistantMessage]
              };
            }
            return t;
          })
        };
      });
    } catch (error) {
      console.error(error);
      const errorMessage = { 
        role: 'assistant', 
        content: `I am connected to ${activeCase.short_name || activeCase.client_name}. All case files and memories are secured under OpenShell. How can I assist you with this matter?` 
      };
      setThreadsByCase(prev => {
        const list = prev[activeCase.id] || updatedThreadsWithUser;
        return {
          ...prev,
          [activeCase.id]: list.map(t => {
            if (t.id === thisThreadId) {
              return {
                ...t,
                messages: [...t.messages, errorMessage]
              };
            }
            return t;
          })
        };
      });
    } finally {
      setIsLoading(false);
    }
  };

  const appendAssistantMessage = (msgObj) => {
    const thisThreadId = currentThread?.id || `${activeCase?.id}-t1`;
    setThreadsByCase(prev => {
      const list = prev[activeCase.id] || getCaseThreads(activeCase.id);
      return {
        ...prev,
        [activeCase.id]: list.map(t => {
          if (t.id === thisThreadId) {
            return {
              ...t,
              messages: [...t.messages, msgObj]
            };
          }
          return t;
        })
      };
    });
  };

  const handleHermesLearn = async () => {
    if (!activeCase) return;
    setIsLoading(true);

    try {
      const response = await apiClient.post('/chat/correction', {
        case_id: activeCase.id,
        original_text: "The party shall pay within 30 days.",
        corrected_text: "The client shall pay within 30 days.",
        correction_description: "Please change all occurrences of 'party' to 'client' in future drafts."
      });

      if (response.should_create_skill) {
        appendAssistantMessage({ 
          role: 'assistant', 
          isSkill: true,
          skillData: response.proposed_skill,
          skillQuestion: response.scope_question
        });
      } else {
        appendAssistantMessage({ 
          role: 'assistant', 
          content: `Hermes determined this is not a reusable skill: ${response.reason}` 
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!activeCase) return;
    setIsLoading(true);

    try {
      const response = await apiClient.post('/verification/verify', {
        case_id: activeCase.id,
        draft_text: "The agreement was terminated on 21 March 2025."
      });

      if (response.has_mismatch) {
        appendAssistantMessage({ 
          role: 'assistant', 
          isVerificationError: true,
          mismatches: response.mismatches
        });
      } else {
        appendAssistantMessage({ 
          role: 'assistant', 
          content: '✓ Verification passed. No citation hallucinations or date discrepancies detected.' 
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-page-container">
      {/* Left Column: Conversations by Case */}
      <div className={`conversations-sidebar ${!isSidebarOpen ? 'collapsed' : ''}`}>
        <div className="conv-header">
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <MessageSquare size={22} strokeWidth={2.5} />
            <span>Conversations</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <span style={{fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 500}}>
              {casesList.length} cases
            </span>
            <button 
              className="btn-collapse-sidebar"
              onClick={() => setIsSidebarOpen(false)}
              title="Collapse Conversations sidebar"
            >
              <PanelLeftClose size={18} />
            </button>
          </div>
        </div>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto'}}>
          {casesList.map(c => {
            const isCurrent = activeCase?.id === c.id;
            const threads = isCurrent ? currentCaseThreads : (threadsByCase[c.id] || getCaseThreads(c.id));

            return (
              <div key={c.id} className="conv-folder">
                <div 
                  className={`conv-folder-header ${isCurrent ? 'active-case-header' : ''}`}
                  onClick={() => handleSelectCase(c)}
                  style={{
                    backgroundColor: isCurrent ? 'var(--bg-surface-hover)' : 'transparent',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div className="conv-folder-title">
                    <Folder size={18} color="var(--brand-primary)" />
                    <span style={{fontWeight: isCurrent ? 700 : 600}}>
                      {c.short_name || c.client_name}
                    </span>
                    {c.status === 'closed' && (
                      <span className="status-pill closed" style={{fontSize: '0.68rem', padding: '2px 6px'}}>
                        Closed
                      </span>
                    )}
                  </div>
                  
                  <div className="conv-folder-right-actions" onClick={e => e.stopPropagation()}>
                    <button 
                      className="btn-folder-add-thread" 
                      onClick={(e) => handleCreateNewThread(c.id, e)}
                      title={`New conversation for ${c.short_name || c.client_name}`}
                    >
                      <Plus size={15} />
                    </button>
                    {isCurrent ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>
                </div>

                {isCurrent && (
                  <div className="conv-list">
                    {threads.map(thread => (
                      <div 
                        key={thread.id} 
                        className={`conv-item ${currentThread?.id === thread.id ? 'active' : ''}`}
                        onClick={() => setActiveThreadId(thread.id)}
                      >
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
                          <div className="conv-item-title">
                            <MessageSquare size={15} />
                            <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 170}}>
                              {thread.title}
                            </span>
                          </div>
                          {threads.length > 1 && (
                            <button
                              className="btn-delete-thread"
                              onClick={(e) => handleDeleteThread(thread.id, e)}
                              title="Delete conversation"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                        <div className="conv-item-time">{thread.time}</div>
                      </div>
                    ))}

                    {/* "+ New Conversation" Button at bottom of active case threads */}
                    <button 
                      className="btn-new-conversation"
                      onClick={(e) => handleCreateNewThread(c.id, e)}
                      title="Start a new conversation thread"
                    >
                      <Plus size={15} />
                      <span>New Conversation</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Center Column: Chat Main */}
      <div className="chat-main">
        <div className="chat-main-header">
          <div className="chat-header-left">
            <button 
              className="btn-sidebar-toggle"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              title={isSidebarOpen ? "Collapse Conversations sidebar" : "Expand Conversations sidebar"}
            >
              {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>

            <div ref={dropdownRef} className="chat-case-pill-container">
              <div 
                className="chat-case-pill" 
                onClick={() => setShowCaseDropdown(!showCaseDropdown)}
              >
                <Folder size={17} />
                <span>{activeCase ? (activeCase.short_name || activeCase.client_name) : 'Select Case'}</span>
                <ChevronDown size={15} />
              </div>

              {/* Quick Switch Dropdown */}
              {showCaseDropdown && (
                <div className="chat-case-dropdown-menu">
                  {casesList.map(c => (
                    <div 
                      key={c.id}
                      onClick={() => handleSelectCase(c)}
                      className={`chat-case-dropdown-item ${activeCase?.id === c.id ? 'active' : ''}`}
                    >
                      <span>{c.short_name || c.client_name}</span>
                      {c.status === 'closed' && (
                        <span className="status-pill closed" style={{fontSize: '0.65rem', padding: '2px 6px'}}>
                          Closed
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="chat-security-notice">
            <Lock size={15} color="var(--brand-primary)" />
            <span>Case data is sandboxed on your device</span>
          </div>
        </div>

        {/* Message Area */}
        <div className="chat-messages">
          {/* Welcome Card if no messages yet */}
          {activeMessages.length === 0 && (
            <div className="ai-interactive-card" style={{marginLeft: 0, maxWidth: '100%'}}>
              <div className="interactive-header">
                <img src="/src/assets/belawbeaver.jpg" alt="Mascot" className="mascot-avatar" />
                <div style={{flex: 1}}>
                  <div className="interactive-title">
                    Beaverly Legal Assistant &mdash; {activeCase?.short_name || activeCase?.client_name}
                  </div>
                  <div className="interactive-text" style={{marginBottom: '14px', lineHeight: 1.6}}>
                    All case documents, memories, and skills are strictly sandboxed for matter <b>{activeCase?.matter_id || 'MATTER-2026'}</b>. Client: <b>{activeCase?.client_name}</b>{activeCase?.opponent ? ` · Opponent: ${activeCase.opponent}` : ''}.
                  </div>
                  <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                    <button 
                      className="btn-outline" 
                      onClick={() => handleSend(`Draft a formal response letter addressing ${activeCase?.opponent || 'opposing party'}.`)}
                    >
                      Draft response letter
                    </button>
                    <button 
                      className="btn-outline" 
                      onClick={() => handleSend("Summarize key timeline dates and legal issues in this matter.")}
                    >
                      Summarize case facts
                    </button>
                    <button 
                      className="btn-outline" 
                      onClick={() => handleSend("Verify contract liability clauses and potential defenses.")}
                    >
                      Analyze legal liabilities
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Messages */}
          {activeMessages.map((msg, idx) => (
            msg.isVerificationError ? (
              msg.mismatches.map((m, i) => (
                <div key={`ver-${idx}-${i}`} className="alert-banner error" style={{marginTop: 15, marginBottom: 15}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700}}>
                    <AlertCircle size={18} /> {m.explanation}
                  </div>
                  <div style={{fontSize: '0.85rem', color: '#4A3320', opacity: 0.8, marginTop: 4}}>
                    Source: <span style={{color: 'var(--brand-primary)', textDecoration: 'underline'}}>{m.source_doc} ↗</span>
                  </div>
                </div>
              ))
            ) : msg.isSkill ? (
              <div key={idx} className="alert-banner warning" style={{marginTop: 15, marginBottom: 15}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700}}>
                  <AlertTriangle size={20} /> Skill Proposed: {msg.skillData.name}
                </div>
                <div style={{marginTop: 8}}>{msg.skillQuestion}</div>
                <div className="btn-group" style={{marginTop: 12}}>
                  <button className="btn-filled">Yes, apply ({msg.skillData.scope})</button>
                  <button className="btn-outline">Cancel</button>
                </div>
              </div>
            ) : (
              <div key={idx} className={`msg-row ${msg.role === 'user' ? 'user' : 'ai'}`}>
                {msg.role === 'assistant' && (
                  <div className="msg-icon-wrap">
                    <Sparkles size={20} />
                  </div>
                )}
                <div className="msg-bubble">
                  {msg.content}
                </div>
              </div>
            )
          ))}

          {isLoading && (
            <div className="alert-banner loading" style={{marginTop: 10}}>
              <Loader2 size={16} className="spinner" style={{animation: 'spin 1s linear infinite'}} /> Beaverly is thinking...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="chat-input-container">
          <div className="chat-input-wrapper">
            <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginRight: '8px'}}>
              <Paperclip size={20} color="var(--text-tertiary)" style={{cursor: 'pointer'}} title="Attach Document" />
              <Zap size={20} color="var(--brand-primary)" style={{cursor: 'pointer'}} onClick={handleHermesLearn} title="Trigger Hermes Agent: Skill Learning" />
              <ShieldCheck size={20} color="#4C8C56" style={{cursor: 'pointer'}} onClick={handleVerify} title="Trigger Fact Checker: Verify Draft" />
            </div>
            <input 
              type="text" 
              placeholder={`Ask Beaverly anything about ${activeCase ? (activeCase.short_name || activeCase.client_name) : 'this case'}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            />
            <button 
              className="send-btn" 
              onClick={() => handleSend()} 
              disabled={isLoading || !input.trim()}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Memory */}
      <div className="memory-sidebar">
        <h2 className="memory-header">Memory</h2>
        
        <div className="memory-card">
          <div className="mem-card-title">
            <div className="mem-icon-wrap"><User size={20} strokeWidth={2.5} /></div> Lawyer Memory
          </div>
          <div className="mem-desc">Your general working habits & preferences (across all cases).</div>
          <div className="mem-pill-container" style={{flexDirection: 'row'}}>
            <span className="mem-pill">Formal tone</span>
            <span className="mem-pill">Uses 'Client' not 'Party'</span>
          </div>
        </div>

        <div className="fence-divider">
          <img src="/src/assets/belawbeaver.jpg" alt="fence" style={{width: 54, height: 54, borderRadius: '50%', border: '4px solid var(--bg-app)'}} />
        </div>

        <div className="memory-card">
          <div className="mem-card-title">
            <div className="mem-icon-wrap"><Lock size={20} strokeWidth={2.5} /></div> Case Memory
          </div>
          <div className="mem-desc">
            Facts specific to <b>{activeCase?.short_name || activeCase?.client_name || 'Active Case'}</b>. Strictly isolated from other matters.
          </div>
          <div className="mem-pill-container">
            <span className="mem-pill">Client: {activeCase?.client_name || 'Unknown'}</span>
            <span className="mem-pill">Matter: {activeCase?.matter_id || 'MATTER-2026'}</span>
            {activeCase?.opponent && (
              <span className="mem-pill">Opponent: {activeCase.opponent}</span>
            )}
            <span className="mem-pill">Files: {activeCase?.files_count || 0} case documents</span>
            <span className="mem-pill">Status: {activeCase?.status === 'closed' ? 'Closed' : 'Active'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
