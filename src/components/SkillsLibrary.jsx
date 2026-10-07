import React from 'react';
import { Globe, Lock, Edit3, Trash2, ExternalLink } from 'lucide-react';

export default function SkillsLibrary() {
  const globalSkills = [
    { title: 'Disclaimer wording — Version B', versions: 'v3', count: 3, date: '20 Sep, 2025' },
    { title: 'Settlement amount format', versions: 'v3', count: 3, date: '18 Sep, 2025' },
    { title: 'Case summary structure', versions: 'v3', count: 3, date: '15 Sep, 2025' },
    { title: 'Legal citation style', versions: 'v3', count: 3, date: '12 Sep, 2025' },
    { title: 'Client tone preference', versions: 'v3', count: 3, date: '10 Sep, 2025' },
    { title: 'Document formatting rules', versions: 'v3', count: 3, date: '8 Sep, 2025' },
    { title: 'Risk highlight style', versions: 'v3', count: 3, date: '5 Sep, 2025' },
    { title: 'Closing paragraph template', versions: 'v3', count: 3, date: '2 Sep, 2025' },
  ];

  const caseSkills = [
    { title: 'Employee notice period', versions: 'v3', count: 2, date: '22 Sep, 2025' },
    { title: 'Severance calculation', versions: 'v3', count: 2, date: '18 Sep, 2025' },
    { title: 'Termination reason', versions: 'v3', count: 1, date: '15 Sep, 2025' },
  ];
  
  const caseSkills2 = [
    { title: 'Payment terms', versions: 'v3', count: 2, date: '20 Sep, 2025' },
    { title: 'Confidentiality clause', versions: 'v3', count: 1, date: '17 Sep, 2025' },
    { title: 'Force majeure', versions: 'v3', count: 1, date: '12 Sep, 2025' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black text-[#4a3424]">Skills</h2>
        <div className="px-4 py-2 bg-[#f4ebe1] rounded-full border border-[#e8dcc4] font-bold text-[#8c5e32] flex items-center gap-2 shadow-sm">
          <SparklesIcon className="w-4 h-4" /> 12 skills learned
        </div>
      </div>

      {/* Global Skills Section */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4 text-[#8c5e32]">
          <Globe className="w-5 h-5" />
          <h3 className="text-lg font-bold">Global Skills</h3>
          <span className="text-sm font-semibold text-[#8a7258]">— used across all cases</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {globalSkills.map((s, i) => (
            <SkillCard key={i} skill={s} />
          ))}
        </div>
      </div>

      <div className="flex justify-center my-8">
        <div className="w-full border-t-2 border-dashed border-[#e8dcc4] absolute max-w-5xl"></div>
        <div className="bg-[#faf6ed] z-10 px-4 flex items-center justify-center">
          <img src="/assets/mascot.png" alt="fence" className="h-8 w-8 object-cover rounded-full border border-[#e8dcc4] bg-white" onError={(e) => { e.target.style.display = 'none'; }} />
        </div>
      </div>

      {/* Case-Specific Section */}
      <div>
        <div className="flex items-center gap-2 mb-4 text-[#8c5e32]">
          <Lock className="w-5 h-5" />
          <h3 className="text-lg font-bold">Case-Specific Memory</h3>
          <span className="text-sm font-semibold text-[#8a7258]">— grouped by case</span>
        </div>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-bold text-[#4a3424] mb-3 flex items-center gap-2">
              <ChevronDownIcon className="w-4 h-4 text-[#8a7258]" /> Chen Employment Dispute
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {caseSkills.map((s, i) => (
                <SkillCard key={i} skill={s} isLocked />
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-[#4a3424] mb-3 flex items-center gap-2">
              <ChevronDownIcon className="w-4 h-4 text-[#8a7258]" /> ABC Holdings Contract
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {caseSkills2.map((s, i) => (
                <SkillCard key={i} skill={s} isLocked />
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function SkillCard({ skill, isLocked }) {
  return (
    <div className="bg-[#fdfaf3] border border-[#e8dcc4] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="flex items-start gap-2 mb-2">
        {isLocked && <Lock className="w-4 h-4 text-[#8a7258] mt-0.5 shrink-0" />}
        {!isLocked && <Globe className="w-4 h-4 text-[#8a7258] mt-0.5 shrink-0" />}
        <div className="flex-1">
          <div className="font-bold text-[#4a3424] text-sm leading-tight flex items-center gap-1.5 flex-wrap">
            {skill.title} 
            <span className="text-[10px] px-1.5 py-0.5 bg-[#f4ebe1] text-[#8c5e32] rounded font-mono">{skill.versions}</span>
          </div>
          <div className="text-[11px] text-[#8a7258] font-medium mt-1">Learned from {skill.count} correction{skill.count > 1 ? 's' : ''}</div>
          <button className="text-[11px] text-[#2563eb] font-semibold flex items-center gap-1 mt-0.5 hover:underline">
            History <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      <div className="mt-auto pt-4 flex items-center justify-between">
        <div className="text-[10px] text-[#a38a70] font-semibold">Created {skill.date}</div>
        <div className="flex items-center gap-2">
          <button className="text-[#8a7258] hover:text-[#8c5e32]"><Edit3 className="w-3.5 h-3.5" /></button>
          <div className="w-6 h-3.5 bg-[#8c5e32] rounded-full relative cursor-pointer">
            <div className="w-2.5 h-2.5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
          </div>
          <button className="text-[#8a7258] hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    </div>
  );
}

function SparklesIcon(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
}
function ChevronDownIcon(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
}
