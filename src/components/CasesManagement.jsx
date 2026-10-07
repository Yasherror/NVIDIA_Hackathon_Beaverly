import React, { useState } from 'react';
import { Lock, FileText, BrainCircuit, ExternalLink, AlertTriangle, Trash2, CheckCircle2, X } from 'lucide-react';

export default function CasesManagement() {
  const [showCloseModal, setShowCloseModal] = useState(false);

  const cases = [
    { name: 'Chen Employment Dispute', status: 'Active', files: 14, memories: 6, date: '12 Sep, 2025' },
    { name: 'Wang Property Matter', status: 'Active', files: 9, memories: 4, date: '10 Sep, 2025' },
    { name: 'Tan Contract Dispute', status: 'Active', files: 7, memories: 3, date: '8 Sep, 2025' },
    { name: 'Lim Family Law', status: 'Active', files: 12, memories: 5, date: '5 Sep, 2025' },
    { name: 'Lee Commercial Agreement', status: 'Active', files: 8, memories: 4, date: '2 Sep, 2025' },
    { name: 'ABC Holdings Contract', status: 'Closed', files: 11, memories: 5, date: '24 Sep 2026', closed: true },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto relative">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black text-[#4a3424]">Cases</h2>
        <div className="px-4 py-2 bg-[#f4ebe1] rounded-full border border-[#e8dcc4] font-bold text-[#8c5e32] flex items-center gap-2 shadow-sm">
          <img src="/assets/mascot.png" alt="Beaver" className="w-5 h-5 rounded-full" onError={(e) => { e.target.style.display = 'none'; }} /> 
          12 cases
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cases.map((c, i) => (
          <div key={i} className="bg-[#fdfaf3] border border-[#e8dcc4] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col h-48 relative">
            
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-[#4a3424] pr-10">{c.name}</h3>
              <Lock className="w-4 h-4 text-[#8a7258] absolute right-5 top-5" />
            </div>

            <div className="flex items-center gap-2 mb-3">
              {c.closed ? (
                <span className="px-2 py-0.5 bg-[#e8dcc4] text-[#8a7258] text-[10px] font-bold uppercase rounded">Closed</span>
              ) : (
                <span className="px-2 py-0.5 bg-[#e3eedb] text-[#356e21] text-[10px] font-bold uppercase rounded">Active</span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-[#8a7258] mb-auto">
              <div className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> {c.files} files</div>
              <div className="flex items-center gap-1.5"><BrainCircuit className="w-4 h-4" /> {c.memories} memories</div>
            </div>

            <div className="mt-4 border-t border-[#e8dcc4] pt-4">
              {c.closed ? (
                <div className="space-y-3">
                  <div className="text-[10px] text-[#a38a70] font-semibold">Closed · Memory deleted on {c.date}</div>
                  <div className="flex gap-3">
                    <a href="#" className="text-xs text-[#2563eb] font-semibold hover:underline flex items-center gap-1">View audit log <ExternalLink className="w-3 h-3" /></a>
                    <button className="flex-1 py-1.5 bg-[#a3794d] text-white text-xs font-bold rounded-lg opacity-50 cursor-not-allowed">Open</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-[10px] text-[#a38a70] font-semibold">Created {c.date}</div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-1.5 bg-[#8c5e32] text-white text-xs font-bold rounded-lg hover:bg-[#6b4c2a] transition-colors shadow-sm">Open</button>
                    <button onClick={() => setShowCloseModal(true)} className="flex-1 py-1.5 bg-white text-[#8c5e32] border border-[#e8dcc4] text-xs font-bold rounded-lg hover:bg-[#f4ebe1] transition-colors shadow-sm">Close Case</button>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        ))}
      </div>

      {/* Modal overlay */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4a3424]/40 backdrop-blur-sm">
          <div className="bg-[#fdfaf3] w-full max-w-sm rounded-2xl shadow-xl border border-[#e8dcc4] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#e8dcc4] bg-white">
              <h3 className="font-bold text-[#4a3424] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#d93025]" /> Closing this case will:
              </h3>
              <button onClick={() => setShowCloseModal(false)} className="text-[#8a7258] hover:bg-[#f4ebe1] p-1 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="p-5 space-y-3">
              <div className="bg-[#fff0f0] border border-[#ffcdcd] p-3 rounded-xl flex items-start gap-3">
                <Trash2 className="w-4 h-4 text-[#d93025] mt-0.5 shrink-0" />
                <div className="text-sm font-semibold text-[#a50e0e]">Delete: 3 case memories, 2 case-specific skills</div>
              </div>
              <div className="bg-[#f0f9eb] border border-[#c2e6b3] p-3 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#529e33] mt-0.5 shrink-0" />
                <div className="text-sm font-semibold text-[#356e21]">Keep: global skills, audit log</div>
              </div>
            </div>
            
            <div className="p-4 bg-[#f4ebe1] border-t border-[#e8dcc4] flex justify-center">
              <button onClick={() => setShowCloseModal(false)} className="w-full py-2.5 bg-[#a50e0e]/90 text-white rounded-xl font-bold hover:bg-[#a50e0e] shadow-sm transition-colors text-sm">
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
