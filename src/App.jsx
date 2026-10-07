import React, { useState } from 'react';
import TopNav from './components/TopNav';
import LeftSidebar from './components/LeftSidebar';
import SettingsModal from './components/SettingsModal';

// Placeholder components, we will implement these next
import DashboardTab from './components/DashboardTab';
import ChatWorkspace from './components/ChatWorkspace';
import SkillsLibrary from './components/SkillsLibrary';
import CasesManagement from './components/CasesManagement';
import ProtectionRecord from './components/ProtectionRecord';

import { CASES, INITIAL_SKILLS } from './data/mockData';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentCaseId, setCurrentCaseId] = useState('case-a');
  const [skills, setSkills] = useState(INITIAL_SKILLS);
  const [showSettings, setShowSettings] = useState(false);

  const currentCase = CASES.find(c => c.id === currentCaseId) || CASES[0];

  const handleAddSkill = (newSkill) => {
    setSkills(prev => [newSkill, ...prev]);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#fdfaf3] text-[#4a3424] font-sans overflow-hidden">
      <TopNav 
        activeTab={activeTab} 
        onSelectTab={setActiveTab} 
        onOpenSettings={() => setShowSettings(true)} 
      />
      
      <div className="flex-1 flex overflow-hidden relative">
        {activeTab !== 'dashboard' && (
          <LeftSidebar currentCaseId={currentCaseId} onSelectCase={setCurrentCaseId} />
        )}
        
        <main className="flex-1 overflow-y-auto bg-[#faf6ed] relative">
          {activeTab === 'dashboard' && <DashboardTab onSelectTab={setActiveTab} />}
          {activeTab === 'chat' && (
            <ChatWorkspace 
              currentCase={currentCase} 
              skills={skills} 
              onAddSkill={handleAddSkill} 
            />
          )}
          {activeTab === 'skills' && <SkillsLibrary skills={skills} />}
          {activeTab === 'cases' && <CasesManagement currentCaseId={currentCaseId} />}
          {activeTab === 'logs' && <ProtectionRecord />}
        </main>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default App;
