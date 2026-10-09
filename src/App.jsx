import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import Chat from './pages/Chat';
import Skills from './pages/Skills';
import Cases from './pages/Cases';
import Logs from './pages/Logs';
import Settings from './pages/Settings';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCase, setSelectedCase] = useState(null);

  const handleOpenCase = (caseItem) => {
    setSelectedCase(caseItem);
    setActiveTab('chat');
  };

  return (
    <div className="app-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {activeTab === 'overview' && <Overview setActiveTab={setActiveTab} />}
        {activeTab === 'chat' && <Chat selectedCase={selectedCase} setSelectedCase={setSelectedCase} />}
        {activeTab === 'skills' && <Skills />}
        {activeTab === 'cases' && <Cases setActiveTab={setActiveTab} onOpenCase={handleOpenCase} />}
        {activeTab === 'logs' && <Logs />}
        {activeTab === 'settings' && <Settings setActiveTab={setActiveTab} />}
      </main>
    </div>
  );
}
export default App;
