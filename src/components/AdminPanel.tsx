import React, { useState } from 'react';
import { defaultWeights, ScoringWeights } from '../utils/scoringModel';

export default function AdminPanel() {
  const [weights, setWeights] = useState<ScoringWeights>(defaultWeights);
  const [primaryColor, setPrimaryColor] = useState('#47682d');
  const [secondaryColor, setSecondaryColor] = useState('#14314F');
  const [activeTab, setActiveTab] = useState('scoring');

  const updateWeight = (key: keyof ScoringWeights, value: number) => {
    setWeights({ ...weights, [key]: value });
  };

  const saveSettings = () => {
    alert('Settings saved successfully! In production, this would update the database and apply changes site-wide.');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-3xl font-bold text-[#14314F] mb-6">Admin Control Panel</h2>

      <div className="flex gap-2 mb-6 border-b">
        {[
          { id: 'scoring', label: 'Scoring Model' },
          { id: 'api', label: 'API Management' },
          { id: 'theme', label: 'Theme Settings' },
          { id: 'users', label: 'User Management' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === tab.id 
                ? 'text-[#47682d] border-b-2 border-[#47682d]' 
                : 'text-gray-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'scoring' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Physical Condition: {(weights.physicalCondition * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={weights.physicalCondition}
              onChange={(e) => updateWeight('physicalCondition', Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">
              Player Profile: {(weights.playerProfile * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={weights.playerProfile}
              onChange={(e) => updateWeight('playerProfile', Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">
              Market Signals: {(weights.marketSignals * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={weights.marketSignals}
              onChange={(e) => updateWeight('marketSignals', Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">
              Timing & Trends: {(weights.timingTrends * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={weights.timingTrends}
              onChange={(e) => updateWeight('timingTrends', Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              Total: {((weights.physicalCondition + weights.playerProfile + weights.marketSignals + weights.timingTrends) * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      )}

      {activeTab === 'api' && (
        <div className="space-y-4">
          {['eBay API', 'PWCC API', 'PSA API', 'Beckett API'].map(api => (
            <div key={api} className="border-2 border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{api}</h3>
                  <p className="text-sm text-gray-600">Status: Connected</p>
                </div>
                <button className="bg-[#47682d] text-white px-4 py-2 rounded-lg">Configure</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'theme' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Primary Color (Forest Green)</label>
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-full h-12 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Secondary Color (Midnight Blue)</label>
            <input
              type="color"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="w-full h-12 rounded-lg"
            />
          </div>
        </div>
      )}

      <button 
        onClick={saveSettings}
        className="mt-6 w-full bg-[#47682d] text-white py-3 rounded-lg font-semibold hover:bg-[#47682d]/90 transition"
      >
        Save All Settings
      </button>
    </div>
  );
}
