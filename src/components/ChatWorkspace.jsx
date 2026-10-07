import React, { useState } from 'react';
import { Send, Paperclip, ChevronDown, Lock, ShieldAlert, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

export default function ChatWorkspace({ currentCase, skills, onAddSkill }) {
  return (
    <div className="h-full flex relative">
      
      {/* Center Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-[#fdfaf3]">
        {/* Chat Header */}
        <div className="h-14 border-b border-[#e8dcc4] flex items-center justify-between px-6 bg-[#f4ebe1]">
          <div className="flex-1"></div>
          <button className="flex items-center gap-2 px-4 py-1.5 bg-[#8c5e32] text-white rounded-full font-bold text-sm shadow-sm">
            <FolderIcon className="w-4 h-4" />
            Case A — Chen Employment Dispute
            <ChevronDown className="w-4 h-4 ml-1 opacity-70" />
          </button>
          <div className="flex-1 flex justify-end">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8a7258]">
              <Lock className="w-3.5 h-3.5" />
              Case data is sandboxed on your device
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* User Message */}
          <div className="flex justify-end">
            <div className="bg-[#a3794d] text-white p-4 rounded-2xl rounded-tr-sm max-w-xl text-sm leading-relaxed shadow-sm">
              Please draft a response letter to the other party. Keep the tone professional and concise. I also want to make sure we use "client" instead of "party" going forward.
            </div>
          </div>
          <div className="text-right text-[10px] text-[#8a7258] font-semibold mt-1">10:12 AM</div>

          {/* AI Response */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#8c5e32] flex items-center justify-center shrink-0 shadow-sm text-white">
              <SparklesIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="bg-white border border-[#e8dcc4] p-4 rounded-2xl rounded-tl-sm max-w-xl text-sm leading-relaxed text-[#4a3424] shadow-sm">
                Certainly. Here's a draft response letter for your review. I've used "client" instead of "party" throughout, and kept the tone professional and concise.
                <button className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-[#f4ebe1] border border-[#e8dcc4] rounded-lg text-xs font-bold text-[#8c5e32] hover:bg-[#ebe1d3] transition-colors">
                  <FileText className="w-4 h-4" /> View Draft
                </button>
              </div>
              <div className="text-left text-[10px] text-[#8a7258] font-semibold mt-1">10:14 AM</div>
            </div>
          </div>

          {/* Skill Confirmation Card */}
          <div className="flex justify-center my-6">
            <div className="bg-[#fdfaf3] border-2 border-[#e8dcc4] p-5 rounded-2xl max-w-lg w-full shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[url('/assets/mascot.png')] bg-cover bg-center opacity-10"></div>
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-[#8c5e32] shrink-0 bg-white shadow-sm">
                  <img src="/assets/mascot.png" alt="Belaw" className="w-full h-full object-cover" onError={(e) => e.target.src = '/assets/beaver_avatar_1790529726037.jpg'} />
                </div>
                <div>
                  <h4 className="font-bold text-[#4a3424] flex items-center gap-2">
                    Noticed a pattern — should I always do this from now on?
                  </h4>
                  <p className="text-sm text-[#8a7258] mt-1">You've changed the wording from "party" to "client" in 3 different documents.</p>
                  <div className="flex items-center gap-3 mt-4">
                    <button className="px-5 py-2 bg-[#8c5e32] text-white rounded-xl font-bold shadow-sm hover:bg-[#6b4c2a] transition-colors text-sm">
                      Yes
                    </button>
                    <button className="px-5 py-2 bg-white text-[#8a7258] border border-[#e8dcc4] rounded-xl font-bold hover:bg-[#f4ebe1] transition-colors text-sm">
                      Just this once
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skill Created Notification */}
          <div className="flex justify-center">
            <div className="bg-[#f0f9eb] border border-[#c2e6b3] py-2.5 px-4 rounded-xl flex items-center gap-2 text-sm max-w-lg w-full shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-[#529e33]" />
              <span className="font-bold text-[#356e21]">Skill created:</span>
              <span className="text-[#356e21]">Use 'client' instead of 'party' · Scope: All cases</span>
              <div className="ml-auto flex items-center gap-2 text-xs font-bold text-[#529e33]">
                <button className="hover:underline">View</button>
                <span className="text-[#c2e6b3]">|</span>
                <button className="hover:underline">Edit</button>
              </div>
            </div>
            <div className="w-full max-w-lg text-right text-[10px] text-[#8a7258] font-semibold mt-1">10:17 AM</div>
          </div>

          {/* Memory Boundary Card */}
          <div className="flex justify-center my-6">
            <div className="bg-[#fff9e6] border-l-4 border-[#e5a000] p-4 rounded-r-xl max-w-lg w-full shadow-sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#e5a000] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#664700]">This correction contains case-specific information (ABC Holdings).</h4>
                  <p className="text-sm text-[#996b00] mt-1 font-semibold">Where should I remember it?</p>
                  <div className="flex items-center gap-3 mt-3">
                    <button className="px-4 py-2 bg-[#a3794d] text-white rounded-lg font-bold shadow-sm hover:bg-[#8c5e32] transition-colors text-xs flex-1">
                      Global skill — all cases
                    </button>
                    <button className="px-4 py-2 bg-white text-[#8c5e32] border border-[#e8dcc4] rounded-lg font-bold hover:bg-[#f4ebe1] transition-colors text-xs flex-1">
                      Case memory — Chen case only
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pre-Submission Verification Error */}
          <div className="flex justify-center mb-4">
            <div className="bg-[#fff0f0] border border-[#ffcdcd] py-3 px-4 rounded-xl flex items-start gap-3 text-sm max-w-lg w-full shadow-sm">
              <div className="w-5 h-5 rounded-full bg-[#d93025] flex items-center justify-center text-white shrink-0 mt-0.5 font-bold text-xs">!</div>
              <div>
                <div className="text-[#a50e0e] font-semibold">Draft says 21 March, case file says 12 March</div>
                <div className="text-[#d93025] text-xs mt-1">Source: <a href="#" className="underline font-semibold hover:text-[#a50e0e]">Employment_Agreement.pdf, page 4 <ExternalLinkIcon className="w-3 h-3 inline" /></a></div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#fdfaf3] border-t border-[#e8dcc4]">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-2 px-2 text-xs font-semibold text-[#8a7258]">
              <Lock className="w-3 h-3" /> Redacted before sending: client name, account number. Searching... <LoaderIcon className="w-3 h-3 animate-spin inline ml-1" />
            </div>
            <div className="bg-white border-2 border-[#e8dcc4] rounded-2xl flex items-center p-2 shadow-sm focus-within:border-[#8c5e32] focus-within:ring-4 focus-within:ring-[#8c5e32]/10 transition-all">
              <button className="p-2 text-[#8a7258] hover:bg-[#f4ebe1] rounded-xl transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>
              <input 
                type="text" 
                placeholder="Ask Belaw anything..." 
                className="flex-1 bg-transparent border-none focus:outline-none px-3 text-sm text-[#4a3424] font-medium"
              />
              <button className="w-10 h-10 bg-[#8c5e32] text-white rounded-xl flex items-center justify-center shadow-sm hover:bg-[#6b4c2a] transition-colors ml-2">
                <Send className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Memory Panel */}
      <div className="w-80 border-l border-[#e8dcc4] bg-[#fdfaf3] flex flex-col shrink-0">
        <div className="p-4 border-b border-[#e8dcc4] bg-[#f4ebe1]">
          <h3 className="font-bold text-lg text-[#4a3424]">Memory</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Lawyer Memory */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#e8dcc4] flex items-center justify-center text-[#8c5e32]">
                <UserIcon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-[#4a3424] text-sm">Lawyer Memory</h4>
                <p className="text-[10px] text-[#8a7258] font-medium leading-tight mt-0.5">Your general working habits & preferences (across all cases).</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 bg-[#f4ebe1] border border-[#e8dcc4] rounded-full text-xs font-bold text-[#8c5e32]">Formal tone</span>
              <span className="px-3 py-1.5 bg-[#f4ebe1] border border-[#e8dcc4] rounded-full text-xs font-bold text-[#8c5e32]">Uses 'Client' not 'Party'</span>
            </div>
          </div>

          <div className="flex items-center justify-center py-4 relative">
            <div className="w-full border-t-2 border-dashed border-[#e8dcc4] absolute"></div>
            <div className="w-10 h-10 bg-[#fdfaf3] relative z-10 flex items-center justify-center">
              <img src="/assets/mascot.png" alt="fence" className="w-8 h-8" onError={(e) => { e.target.style.display = 'none'; }} />
              {!document.querySelector('img[src="/assets/mascot.png"]') && <Lock className="w-5 h-5 text-[#8c5e32]" />}
            </div>
          </div>

          {/* Case Memory */}
          <div className="bg-[#f4ebe1] rounded-2xl p-4 border border-[#e8dcc4]">
            <div className="flex items-start gap-3 mb-4">
              <div className="mt-1">
                <Lock className="w-5 h-5 text-[#8c5e32]" />
              </div>
              <div>
                <h4 className="font-bold text-[#4a3424] text-sm">Case Memory</h4>
                <p className="text-[10px] text-[#8a7258] font-medium leading-tight mt-1">Facts specific to this client's case.<br/>Strictly separated from other cases.</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="bg-white px-3 py-2 rounded-xl text-xs font-bold text-[#8a7258] border border-[#e8dcc4] shadow-sm">Chen Li (employee)</div>
              <div className="bg-white px-3 py-2 rounded-xl text-xs font-bold text-[#8a7258] border border-[#e8dcc4] shadow-sm">Termination: Apr 15, 2025</div>
              <div className="bg-white px-3 py-2 rounded-xl text-xs font-bold text-[#8a7258] border border-[#e8dcc4] shadow-sm">Disputed severance: 3 months</div>
              <div className="bg-white px-3 py-2 rounded-xl text-xs font-bold text-[#8a7258] border border-[#e8dcc4] shadow-sm">Ongoing settlement discussions</div>
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}

function SparklesIcon(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
}
function UserIcon(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}
function FolderIcon(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
}
function LoaderIcon(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>
}
function ExternalLinkIcon(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
}
