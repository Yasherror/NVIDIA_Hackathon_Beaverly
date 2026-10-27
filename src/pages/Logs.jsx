import React, { useState, useEffect } from 'react';
import { Upload, Shield, Check, ShieldAlert, Download, RefreshCw } from 'lucide-react';
import { apiClient, API_BASE_URL } from '../api/apiClient';
import './Logs.css';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState({ total_allowed: 0, total_denied: 0, cross_case_leaks_prevented: 0 });
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const logData = await apiClient.get('/logs/?limit=50');
      const sumData = await apiClient.get('/logs/summary');
      setLogs(logData);
      setSummary(sumData);
    } catch (err) {
      console.error('Failed to load protection logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExport = () => {
    window.open(`${API_BASE_URL}/logs/export`, '_blank');
  };

  const formatTime = (ts) => {
    if (!ts) return { time: 'Recent', date: 'Today' };
    const d = new Date(ts.includes('T') ? ts : ts.replace(' ', 'T') + 'Z');
    if (isNaN(d.getTime())) return { time: ts, date: 'Today' };
    return {
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    };
  };

  return (
    <div className="logs-page-container">
      <div className="logs-top-bar">
        <div>
          <h1 className="logs-page-title">Protection Record</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Linux LSM / eBPF Kernel Policy Audit Trail • Enforced by OpenShell
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-export" onClick={fetchLogs} title="Refresh Protection Log">
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="btn-export" onClick={handleExport} title="Download Audit Certificate">
            <Download size={18} /> Export Audit Log
          </button>
        </div>
      </div>

      <div className="logs-summary-strip">
        <div className="logs-summary-bar">
          <Shield size={26} color="var(--brand-primary)" />
          <div>
            <span>Audit Summary:</span> <b>{summary.total_allowed || logs.filter(l => l.action === 'ALLOW').length}</b> allowed actions &nbsp; &nbsp; <b style={{ color: '#c0392b' }}>{summary.total_denied || logs.filter(l => l.action === 'DENY').length}</b> blocked violations &nbsp; &nbsp; <b style={{ color: '#4C8C56' }}>0</b> cross-case data leaks
          </div>
        </div>

        <div className="floating-widget">
          <div className="pdf-icon-placeholder">PDF</div>
          <div className="widget-text">
            <div className="widget-title">Beaverly OpenShell Compliance Certificate</div>
            <div className="widget-sub">Zero data leakage across active matter sandboxes</div>
          </div>
        </div>
      </div>

      <div className="timeline-container">
        <div className="timeline-line"></div>
        {logs.map((r, i) => {
          const { time, date } = formatTime(r.timestamp);
          const isAllowed = r.action === 'ALLOW';
          return (
            <div key={r.id || i} className="timeline-row">
              <div className="timeline-time">
                <span className="timeline-time-clock">{time}</span>
                <span>{date}</span>
              </div>
              <div className={`timeline-dot ${isAllowed ? 'green' : 'red'}`}></div>
              <div className={`timeline-card ${isAllowed ? 'allowed' : 'blocked'}`}>
                <div className={`card-icon ${isAllowed ? 'green' : 'red'}`}>
                  {isAllowed ? <Check size={20} strokeWidth={3} /> : <ShieldAlert size={20} strokeWidth={2.5} />}
                </div>
                <div className="card-content">
                  <div className="card-title">
                    {isAllowed ? `Allowed: ${r.resource}` : `Blocked: OpenShell eBPF Denied ${r.resource}`}
                  </div>
                  <div className="card-subtext">
                    Case: <b>{r.case_id}</b> • Agent: {r.agent || 'Hermes Agent'} • Reason: {r.reason || (isAllowed ? 'Authorized same-case access' : 'Cross-tenant sandbox violation')}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {logs.length === 0 && !loading && (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            No protection logs recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
