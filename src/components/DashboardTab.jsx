import React from 'react';
import { ShieldCheck, Folder, Sparkles, ShieldAlert } from 'lucide-react';

export default function DashboardTab({ onSelectTab }) {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="bg-[#f4ebe1] rounded-2xl p-6 flex items-center justify-between border border-[#e8dcc4] shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#e3eedb] flex items-center justify-center border border-[#b2d69f]">
            <ShieldCheck className="w-6 h-6 text-[#529e33]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#4a3424]">Your cases are protected</h2>
            <p className="text-sm text-[#8a7258] font-medium mt-1">Chen case — Isolated ✓ · No data leaks today</p>
          </div>
        </div>
        <button 
          onClick={() => onSelectTab('chat')}
          className="px-6 py-3 bg-[#8c5e32] hover:bg-[#6b4c2a] text-white rounded-xl font-bold shadow-sm transition-all"
        >
          Open Chat
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-[#e8dcc4] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#fdfaf3] flex items-center justify-center border border-[#e8dcc4]">
            <Folder className="w-6 h-6 text-[#8c5e32]" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#8a7258] uppercase tracking-wide">Active Cases</div>
            <div className="text-3xl font-black text-[#4a3424] mt-1">5</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#e8dcc4] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#fdfaf3] flex items-center justify-center border border-[#e8dcc4]">
            <Sparkles className="w-6 h-6 text-[#8c5e32]" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#8a7258] uppercase tracking-wide">Skills Learned</div>
            <div className="text-3xl font-black text-[#4a3424] mt-1">12</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#e8dcc4] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#fff0f0] flex items-center justify-center border border-[#ffcdcd]">
            <ShieldAlert className="w-6 h-6 text-[#d93025]" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#8a7258] uppercase tracking-wide">Today</div>
            <div className="text-xl font-black text-[#4a3424] mt-1">0 leak attempts</div>
            <div className="text-xs text-[#8a7258] mt-1">Your cases have never crossed paths.</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Case Isolation Status */}
        <div className="bg-white rounded-2xl border border-[#e8dcc4] shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#e8dcc4] bg-[#fdfaf3] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#8c5e32]" />
            <h3 className="font-bold text-[#4a3424] text-lg">Case Isolation Status</h3>
          </div>
          <div className="p-2 flex-1">
            {['Chen Employment Dispute', 'Tan Contract Dispute', 'Lim Family Law', 'Wong Property Matter', 'Lee Commercial Agreement'].map((c, i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-[#fdfaf3] rounded-xl transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#f4ebe1] flex items-center justify-center border border-[#e8dcc4] text-[#8c5e32]">
                    <Folder className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-[#4a3424] text-sm">{c}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-[#e3eedb] text-[#356e21] text-xs font-bold rounded-full border border-[#b2d69f]">
                    Isolated ✓
                  </span>
                  <ChevronRightIcon className="w-4 h-4 text-[#d6c7b3] group-hover:text-[#8c5e32]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Learned */}
        <div className="bg-white rounded-2xl border border-[#e8dcc4] shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#e8dcc4] bg-[#fdfaf3] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#8c5e32]" />
            <h3 className="font-bold text-[#4a3424] text-lg">Recently Learned</h3>
          </div>
          <div className="p-4 flex-1 space-y-3">
            {[
              { title: 'Disclaimer wording — Version B', time: '2 days ago' },
              { title: 'Preferred closing style', time: '3 days ago' },
              { title: 'Termination date format', time: '5 days ago' },
              { title: 'Client name handling', time: '6 days ago' },
              { title: 'Formal tone preference', time: '1 week ago' },
            ].map((skill, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#fdfaf3] rounded-xl border border-[#e8dcc4]">
                <span className="font-semibold text-[#4a3424] text-sm">{skill.title}</span>
                <span className="text-xs font-medium text-[#8a7258] flex items-center gap-1">
                  <ClockIcon className="w-3 h-3" />
                  {skill.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
    </div>
  );
}

function ChevronRightIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
  )
}

function ClockIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  )
}
