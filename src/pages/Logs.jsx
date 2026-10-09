import React from 'react';
import { Upload, Shield, Check, ShieldAlert } from 'lucide-react';
import './Logs.css';

export default function Logs() {
  const records = [
    { id: 1, time: '10:42 AM', date: '24 Sep 2025', status: 'allowed', title: 'Allowed: read Chen case / contract.pdf', sub: 'Accessed by Belaw (AI assistant) · Chen Employment Dispute' },
    { id: 2, time: '09:17 AM', date: '24 Sep 2025', status: 'allowed', title: 'Allowed: read Chen case / case_brief.pdf', sub: 'Accessed by Belaw (AI assistant) · Chen Employment Dispute' },
    { id: 3, time: '04:32 PM', date: '23 Sep 2025', status: 'blocked', title: 'Blocked: attempted cross-case access to Wang case files - denied by OpenShell policy', sub: 'Accessed by Belaw (AI assistant) · Attempted: Wang Property Matter / strategy_notes.pdf' },
    { id: 4, time: '03:15 PM', date: '23 Sep 2025', status: 'allowed', title: 'Allowed: read Chen case / evidence_list.xlsx', sub: 'Accessed by Belaw (AI assistant) · Chen Employment Dispute' },
    { id: 5, time: '11:08 AM', date: '23 Sep 2025', status: 'allowed', title: 'Allowed: read Chen case / agreement_draft.docx', sub: 'Accessed by Belaw (AI assistant) · Chen Employment Dispute' },
    { id: 6, time: '10:24 AM', date: '23 Sep 2025', status: 'allowed', title: 'Allowed: read Chen case / client_notes.txt', sub: 'Accessed by Belaw (AI assistant) · Chen Employment Dispute' },
    { id: 7, time: '09:03 AM', date: '23 Sep 2025', status: 'allowed', title: 'Allowed: read Chen case / timeline.pdf', sub: 'Accessed by Belaw (AI assistant) · Chen Employment Dispute' },
  ];

  return (
    <div className="logs-page-container">
      <div className="logs-top-bar">
        <h1 className="logs-page-title">Protection Record</h1>
        <button className="btn-export"><Upload size={18} /> Export</button>
      </div>

      <div className="logs-summary-strip">
        <div className="logs-summary-bar">
          <Shield size={26} color="var(--brand-primary)" />
          <div>
            <span>Today:</span> <b>47</b> allowed actions &nbsp; &nbsp; <b style={{color: '#4C8C56'}}>0</b> blocked attempts &nbsp; &nbsp; <b style={{color: '#4C8C56'}}>0</b> cross-case access leaks
          </div>
        </div>

        <div className="floating-widget">
          <div className="pdf-icon-placeholder">PDF</div>
          <div className="widget-text">
            <div className="widget-title">Data Protection Record - Chen Case</div>
            <div className="widget-sub">0 cross-case access attempts during this matter</div>
          </div>
        </div>
      </div>

      <div className="timeline-container">
        <div className="timeline-line"></div>
        {records.map(r => (
          <div key={r.id} className="timeline-row">
            <div className="timeline-time">
              <span className="timeline-time-clock">{r.time}</span>
              <span>{r.date}</span>
            </div>
            <div className={`timeline-dot ${r.status === 'allowed' ? 'green' : 'red'}`}></div>
            <div className={`timeline-card ${r.status}`}>
              <div className={`card-icon ${r.status === 'allowed' ? 'green' : 'red'}`}>
                {r.status === 'allowed' ? <Check size={20} strokeWidth={3} /> : <ShieldAlert size={20} strokeWidth={2.5} />}
              </div>
              <div className="card-content">
                <div className="card-title">{r.title}</div>
                <div className="card-subtext">{r.sub}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
