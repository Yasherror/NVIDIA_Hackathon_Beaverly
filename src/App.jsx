import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Overview from './components/Overview';
import SelfEvolvingMemory from './components/SelfEvolvingMemory';
import MemoryScopeDetection from './components/MemoryScopeDetection';
import StrictCaseIsolation from './components/StrictCaseIsolation';
import PreSubmissionVerification from './components/PreSubmissionVerification';
import BelawMascotGuide from './components/BelawMascotGuide';
import { CASES, INITIAL_SKILLS } from './data/mockData';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentCaseId, setCurrentCaseId] = useState('case-a');
  const [skills, setSkills] = useState(INITIAL_SKILLS);

  const currentCase = CASES.find(c => c.id === currentCaseId) || CASES[0];

  const handleAddSkill = (newSkill) => {
    setSkills(prev => [newSkill, ...prev]);
  };

  const handleResetDemo = () => {
    setSkills(INITIAL_SKILLS);
    setCurrentCaseId('case-a');
  };

  return (
    <div className="belaw-app">
      {/* Top Navbar */}
      <Navbar
        currentCaseId={currentCaseId}
        onSelectCase={setCurrentCaseId}
        onResetDemo={handleResetDemo}
        activeTab={activeTab}
        skillsCount={skills.length}
      />

      {/* Main Layout */}
      <div className="belaw-main-container flex flex-col md:flex-row">
        {/* Left Sidebar featuring the 4 required pillars */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          currentCase={currentCase}
          skillsCount={skills.length}
          mismatchCount={4}
        />

        {/* Center Workspace */}
        <main className="belaw-workspace max-w-7xl mx-auto w-full">
          {activeTab === 'overview' && (
            <Overview 
              onSelectTab={setActiveTab} 
              currentCase={currentCase} 
            />
          )}

          {activeTab === 'feature-1' && (
            <SelfEvolvingMemory
              skills={skills}
              onAddSkill={handleAddSkill}
            />
          )}

          {activeTab === 'feature-2' && (
            <MemoryScopeDetection
              currentCaseId={currentCaseId}
              onSelectCase={setCurrentCaseId}
              skills={skills}
              onAddSkill={handleAddSkill}
            />
          )}

          {activeTab === 'feature-3' && (
            <StrictCaseIsolation />
          )}

          {activeTab === 'feature-4' && (
            <PreSubmissionVerification />
          )}
        </main>
      </div>

      {/* Floating Interactive Beaver Mascot Guide */}
      <BelawMascotGuide
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />
    </div>
  );
}

export default App;
