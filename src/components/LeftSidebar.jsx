import React from 'react';
import { Folder, MessageSquare, ChevronRight, ChevronDown } from 'lucide-react';
import { CASES } from '../data/mockData';

export default function LeftSidebar({ currentCaseId, onSelectCase }) {
  return (
    <aside className="w-72 border-r border-[#e8dcc4] bg-[#fdfaf3] h-full flex flex-col shrink-0">
      <div className="p-4 font-bold text-[#7d6547] flex items-center gap-2 border-b border-[#e8dcc4]">
        <MessageSquare className="w-5 h-5" />
        Conversations
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {CASES.map(c => {
          const isActive = c.id === currentCaseId;
          return (
            <div key={c.id}>
              <button 
                className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-semibold transition-colors ${isActive ? 'bg-[#f4ebe1] text-[#6b4c2a] shadow-sm' : 'text-[#8a7258] hover:bg-[#f6ebd8]'}`}
                onClick={() => onSelectCase(c.id)}
              >
                <div className="flex items-center gap-2">
                  <Folder className={`w-4 h-4 ${isActive ? 'text-[#8c5e32]' : 'text-[#a38a70]'}`} />
                  <span className="truncate">{c.shortName}</span>
                </div>
                {isActive ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {isActive && (
                <div className="pl-9 pr-2 py-2 space-y-1">
                  <div className="p-2.5 bg-[#a3794d] text-white rounded-md text-xs font-semibold cursor-pointer shadow-sm flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Drafting the response letter
                  </div>
                  <div className="p-2.5 text-[#8a7258] hover:bg-[#f4ebe1] rounded-md text-xs font-medium cursor-pointer flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 opacity-50" />
                    Confirm termination date
                  </div>
                  <div className="p-2.5 text-[#8a7258] hover:bg-[#f4ebe1] rounded-md text-xs font-medium cursor-pointer flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 opacity-50" />
                    Review settlement terms
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
