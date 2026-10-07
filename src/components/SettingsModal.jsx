import React, { useState } from 'react';
import { X, Save, Database, Shield, Key, Cpu, FileText, Download } from 'lucide-react';

export default function SettingsModal({ onClose }) {
  const [apiKey, setApiKey] = useState('nb-secret-xxxxxxxxxxxxxxxx');
  const [readOnlyCurrent, setReadOnlyCurrent] = useState(true);
  const [noExternalNet, setNoExternalNet] = useState(true);
  const [modelRoute, setModelRoute] = useState('nano');
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4a3424]/40 backdrop-blur-sm">
      <div className="bg-[#fdfaf3] w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between p-5 border-b border-[#e8dcc4] bg-[#f4ebe1]">
          <h2 className="text-lg font-bold text-[#4a3424] flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-[#8c5e32]" />
            Belaw Preferences
          </h2>
          <button onClick={onClose} className="p-1.5 text-[#8a7258] hover:bg-[#e8dcc4] rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-[#8c5e32] uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4" /> API Connection
            </h3>
            <div className="bg-white p-4 rounded-xl border border-[#e8dcc4] shadow-sm">
              <label className="block text-sm font-semibold text-[#4a3424] mb-1">Nebius Token Factory Key</label>
              <input 
                type="password" 
                value={apiKey} 
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-[#fdfaf3] border border-[#e8dcc4] rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#8c5e32] focus:border-[#8c5e32] outline-none transition-all"
              />
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-bold text-[#8c5e32] uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4" /> Security Policy
            </h3>
            <div className="bg-white rounded-xl border border-[#e8dcc4] shadow-sm divide-y divide-[#e8dcc4]">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#4a3424]">Read-only current case</div>
                  <div className="text-xs text-[#8a7258] mt-0.5">Belaw can only read the current case folder</div>
                </div>
                <Toggle checked={readOnlyCurrent} onChange={() => setReadOnlyCurrent(!readOnlyCurrent)} />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#4a3424]">Offline mode</div>
                  <div className="text-xs text-[#8a7258] mt-0.5">Belaw cannot connect to external networks</div>
                </div>
                <Toggle checked={noExternalNet} onChange={() => setNoExternalNet(!noExternalNet)} />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-bold text-[#8c5e32] uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4" /> Model Routing
            </h3>
            <div className="bg-white p-4 rounded-xl border border-[#e8dcc4] shadow-sm flex gap-3">
              {['nano', 'super', 'ultra'].map(model => (
                <button
                  key={model}
                  onClick={() => setModelRoute(model)}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-semibold capitalize transition-all ${
                    modelRoute === model 
                      ? 'border-[#8c5e32] bg-[#f4ebe1] text-[#8c5e32]' 
                      : 'border-[#e8dcc4] text-[#8a7258] hover:bg-[#fdfaf3]'
                  }`}
                >
                  {model}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-bold text-[#8c5e32] uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4" /> Data Storage
            </h3>
            <div className="bg-[#f0f9eb] border border-[#c2e6b3] p-4 rounded-xl flex items-start gap-3">
              <Database className="w-5 h-5 text-[#529e33] shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-[#356e21]">Data stored on this device</div>
                <div className="text-xs text-[#529e33] mt-1">All case files, memory, and corrections remain on your local hardware. Nothing is sent to the cloud.</div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-sm font-bold text-[#8a7258] hover:text-[#8c5e32] transition-colors flex items-center gap-1">
              {showAdvanced ? 'Hide' : 'Show'} Advanced Config
            </button>
            {showAdvanced && (
              <div className="bg-[#2d241c] text-[#d4c5b0] p-4 rounded-xl font-mono text-xs overflow-x-auto">
                <pre>
{`openshell:
  enforcement_mode: KERNEL_LSM_EBPF
  sandbox:
    isolated_path: /sandboxes/
    cross_tenant_access: DENY
models:
  primary: nemotron-nano
  fallback: nemotron-super`}
                </pre>
              </div>
            )}
          </section>

          <section className="pt-4 border-t border-[#e8dcc4] flex items-center justify-between">
            <div className="text-xs text-[#8a7258]">
              <div className="font-semibold text-[#4a3424]">Belaw v2.4.0</div>
              <div>Open-source license • NemoClaw blueprint compatible</div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#f4ebe1] text-[#8c5e32] border border-[#e8dcc4] hover:bg-[#ebe1d3] font-semibold text-sm rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              Export Audit Log
            </button>
          </section>

        </div>

        <div className="p-5 border-t border-[#e8dcc4] bg-[#fdfaf3] flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 rounded-lg font-semibold text-[#8a7258] hover:bg-[#f4ebe1] transition-colors">
            Cancel
          </button>
          <button onClick={onClose} className="px-5 py-2 rounded-lg font-bold bg-[#8c5e32] text-white hover:bg-[#6b4c2a] shadow-sm transition-colors flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}

function SettingsIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-[#8c5e32] focus:ring-offset-2 ${
        checked ? 'bg-[#529e33]' : 'bg-[#d6c7b3]'
      }`}
    >
      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
        checked ? 'left-6' : 'left-1'
      }`} />
    </button>
  );
}
