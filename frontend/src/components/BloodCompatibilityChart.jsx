import React, { useState } from 'react';
import { CheckCircle2, Heart, Droplet } from 'lucide-react';

const compatibilityData = {
  'O+': {
    canReceiveFrom: ['O-', 'O+'],
    canDonateTo: ['O+', 'A+', 'B+', 'AB+'],
  },
  'O-': {
    canReceiveFrom: ['O-'],
    canDonateTo: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
  },
  'A+': {
    canReceiveFrom: ['A+', 'A-', 'O+', 'O-'],
    canDonateTo: ['A+', 'AB+'],
  },
  'A-': {
    canReceiveFrom: ['A-', 'O-'],
    canDonateTo: ['A+', 'A-', 'AB+', 'AB-'],
  },
  'B+': {
    canReceiveFrom: ['B+', 'B-', 'O+', 'O-'],
    canDonateTo: ['B+', 'AB+'],
  },
  'B-': {
    canReceiveFrom: ['B-', 'O-'],
    canDonateTo: ['B+', 'B-', 'AB+', 'AB-'],
  },
  'AB+': {
    canReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
    canDonateTo: ['AB+'],
  },
  'AB-': {
    canReceiveFrom: ['AB-', 'A-', 'B-', 'O-'],
    canDonateTo: ['AB+', 'AB-'],
  },
};

const BloodCompatibilityChart = () => {
  const [selectedGroup, setSelectedGroup] = useState('O+');

  const currentInfo = compatibilityData[selectedGroup] || compatibilityData['O+'];

  return (
    <div className="card-panel p-6 md:p-10 rounded-3xl space-y-8 shadow-lg" style={{ border: '1px solid var(--card-border)' }}>
      {/* SECTION HEADER */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-500/10 text-red-600 text-xs font-extrabold uppercase tracking-wider">
          <Droplet className="w-3.5 h-3.5 fill-current" />
          <span>Interactive Transfusion Matrix</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: 'var(--text-heading)' }}>
          Blood Group Compatibility Chart
        </h2>
        <p className="text-xs md:text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
          Select a blood type to see compatible donor types and recipient matches instantly.
        </p>
      </div>

      {/* BLOOD TYPE SELECTOR PILLS */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
        {Object.keys(compatibilityData).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedGroup(type)}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              selectedGroup === type
                ? 'bg-red-600 text-white shadow-lg scale-105'
                : ''
            }`}
            style={
              selectedGroup === type
                ? {}
                : { background: 'var(--subtle-bg)', border: '1px solid var(--card-border)', color: 'var(--text-heading)' }
            }
          >
            {type}
          </button>
        ))}
      </div>

      {/* COMPATIBILITY CARDS CONTAINER - EXACTLY MATCHING USER SCREENSHOT */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
        
        {/* LEFT CARD: CAN RECEIVE FROM */}
        <div
          className="md:col-span-5 p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-6"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
        >
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                Can Receive From
              </h3>
              <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                People with <span className="font-bold" style={{ color: 'var(--text-heading)' }}>{selectedGroup}</span> blood can receive from:
              </p>
            </div>

            {/* DONOR PILLS (GREEN) */}
            <div className="flex flex-wrap gap-3 py-2">
              {currentInfo.canReceiveFrom.map((donor) => (
                <div
                  key={donor}
                  className="w-11 h-11 rounded-full bg-emerald-700 text-white flex items-center justify-center font-black text-xs shadow-md border-2 border-emerald-600"
                >
                  {donor}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{currentInfo.canReceiveFrom.length} compatible donor type{currentInfo.canReceiveFrom.length > 1 ? 's' : ''}</span>
            </span>
          </div>
        </div>

        {/* CENTER BLOOD DROPLET ELEMENT */}
        <div className="md:col-span-2 flex flex-col items-center justify-center space-y-2 text-center py-2">
          <div className="relative flex items-center justify-center">
            {/* Pulsing glow background */}
            <div className="absolute w-20 h-20 rounded-full bg-red-500/20 animate-pulse"></div>
            
            {/* SVG Blood Drop Shape */}
            <div className="relative w-16 h-20 bg-gradient-to-b from-red-500 to-red-700 rounded-b-full rounded-t-full flex items-center justify-center shadow-xl text-white font-black text-xl border-2 border-red-400">
              <div className="mt-4">{selectedGroup}</div>
            </div>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Selected blood group
          </span>
        </div>

        {/* RIGHT CARD: CAN DONATE TO */}
        <div
          className="md:col-span-5 p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-6"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
        >
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-red-700 dark:text-red-400">
                Can Donate To
              </h3>
              <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                People with <span className="font-bold" style={{ color: 'var(--text-heading)' }}>{selectedGroup}</span> blood can donate to:
              </p>
            </div>

            {/* RECIPIENT PILLS (DARK / BLACK) */}
            <div className="flex flex-wrap gap-3 py-2">
              {currentInfo.canDonateTo.map((recipient) => (
                <div
                  key={recipient}
                  className="w-11 h-11 rounded-full bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-center font-black text-xs shadow-md border-2 border-slate-700"
                >
                  {recipient}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-500/15 text-red-700 dark:text-red-300 text-xs font-bold border border-red-500/30">
              <Heart className="w-4 h-4 text-red-600 fill-red-600 shrink-0" />
              <span>{currentInfo.canDonateTo.length} compatible recipient type{currentInfo.canDonateTo.length > 1 ? 's' : ''}</span>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BloodCompatibilityChart;
