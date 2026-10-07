import React from 'react';
import { Shield, Download, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function ProtectionRecord() {
  const events = [
    { time: '10:42 AM', date: '24 Sep 2025', allowed: true, text: 'read Chen case / contract.pdf', subtext: 'Accessed by Belaw (AI assistant) · Chen Employment Dispute' },
    { time: '09:17 AM', date: '24 Sep 2025', allowed: true, text: 'read Chen case / case_brief.pdf', subtext: 'Accessed by Belaw (AI assistant) · Chen Employment Dispute' },
    { time: '04:32 PM', date: '23 Sep 2025', allowed: false, text: 'attempted cross-case access to Wang case files — denied by OpenShell policy', subtext: 'Accessed by Belaw (AI assistant) · Attempted: Wang Property Matter / strategy_notes.pdf' },
    { time: '03:15 PM', date: '23 Sep 2025', allowed: true, text: 'read Chen case / evidence_list.xlsx', subtext: 'Accessed by Belaw (AI assistant) · Chen Employment Dispute' },
    { time: '11:08 AM', date: '23 Sep 2025', allowed: true, text: 'read Chen case / agreement_draft.docx', subtext: 'Accessed by Belaw (AI assistant) · Chen Employment Dispute' },
    { time: '10:24 AM', date: '23 Sep 2025', allowed: true, text: 'read Chen case / client_notes.txt', subtext: 'Accessed by Belaw (AI assistant) · Chen Employment Dispute' },
    { time: '09:03 AM', date: '23 Sep 2025', allowed: true, text: 'read Chen case / timeline.pdf', subtext: 'Accessed by Belaw (AI assistant) · Chen Employment Dispute' },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex items-end justify-between mb-6 relative">
        <h2 className="text-3xl font-black text-[#4a3424]">Protection Record</h2>
        
        <div className="relative group">
          <button className="px-5 py-2.5 bg-white border border-[#e8dcc4] rounded-xl font-bold text-[#4a3424] flex items-center gap-2 shadow-sm hover:bg-[#fdfaf3] transition-colors text-sm">
            <Download className="w-4 h-4 text-[#8a7258]" /> Export
          </button>
          
          <div className="absolute right-0 top-12 w-64 bg-white border border-[#e8dcc4] rounded-xl p-4 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-10">
            <div className="flex gap-3">
              <div className="w-10 h-12 bg-[#ffebee] border border-[#ffcdd2] rounded flex items-center justify-center font-bold text-[#c62828] text-xs">PDF</div>
              <div>
                <div className="font-bold text-[#4a3424] text-xs">Data Protection Record — Chen Case</div>
                <div className="text-[10px] text-[#8a7258] mt-1 leading-tight">0 cross-case access attempts during this case.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="bg-white border border-[#e8dcc4] rounded-2xl p-5 shadow-sm flex items-center gap-3 mb-8">
        <Shield className="w-5 h-5 text-[#8c5e32]" />
        <span className="font-bold text-[#4a3424] text-sm">Today: 47 allowed actions · 0 blocked attempts · 0 cross-case access</span>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute top-0 bottom-0 left-[75px] w-0.5 bg-[#e8dcc4]"></div>
        
        <div className="space-y-4">
          {events.map((e, i) => (
            <div key={i} className="flex items-start gap-4 relative">
              
              <div className="w-[60px] text-right shrink-0 pt-2">
                <div className="text-xs font-semibold text-[#8a7258]">{e.time}</div>
                <div className="text-[10px] text-[#b3a18f] font-medium">{e.date}</div>
              </div>

              <div className="relative pt-2.5 z-10">
                <div className={`w-3.5 h-3.5 rounded-full border-2 border-white ${e.allowed ? 'bg-[#529e33]' : 'bg-[#d93025]'}`}></div>
              </div>

              <div className={`flex-1 rounded-xl p-4 border shadow-sm ${e.allowed ? 'bg-[#f0f9eb] border-[#c2e6b3]' : 'bg-[#fff0f0] border-[#ffcdcd]'}`}>
                <div className="flex items-start gap-3">
                  {e.allowed ? (
                    <CheckCircle2 className="w-5 h-5 text-[#529e33] shrink-0 mt-0.5" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-[#d93025] shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className={`font-bold text-sm ${e.allowed ? 'text-[#356e21]' : 'text-[#a50e0e]'}`}>
                      {e.allowed ? 'Allowed:' : 'Blocked:'} {e.text}
                    </div>
                    <div className={`text-[11px] font-medium mt-1 ${e.allowed ? 'text-[#529e33]' : 'text-[#d93025]'}`}>
                      {e.subtext}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
