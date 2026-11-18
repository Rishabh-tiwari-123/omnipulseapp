import React, { useState } from 'react';
import { usePulse } from '../../context/PulseContext';
import { Fingerprint, Activity, Footprints, ShieldCheck, Check, ArrowRight, HeartPulse } from 'lucide-react';

export const OnboardingScreen: React.FC = () => {
  const { biometrics, updateBiometrics, toggleHealthConnect, toggleCadenceSensor, setActiveScreen } = usePulse();
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(true);

  const handleFingerprintScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
    }, 1200);
  };

  const configuredCount = (biometrics.healthConnectEnabled ? 1 : 0) + (biometrics.cadenceSensorEnabled ? 1 : 0);
  const configuredPercent = Math.round((configuredCount / 2) * 100);

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-400/30 flex items-center justify-center text-[#00F5D4]">
            <HeartPulse size={18} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Biometric Onboarding</h1>
            <p className="text-[11px] text-slate-400">Step 1: Calibrate hardware sensors</p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-[#10B981] border border-emerald-500/30">
          v5.0 Active
        </span>
      </div>

      {/* Biometric Numerical Inputs */}
      <div className="glass-panel-card p-4 space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-teal-400/90 flex items-center space-x-1.5">
          <span>Physical Baseline Parameters</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {/* Age */}
          <div className="bg-black/30 rounded-xl p-2.5 border border-teal-400/15 focus-within:border-teal-400/50 transition-colors">
            <label className="block text-[10px] text-slate-400 uppercase font-medium">Age</label>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <input
                type="number"
                min="14"
                max="90"
                value={biometrics.age}
                onChange={(e) => updateBiometrics({ age: Number(e.target.value) || 20 })}
                className="w-full bg-transparent text-base font-bold text-white focus:outline-none font-mono"
              />
              <span className="text-[10px] text-slate-400 font-mono">yrs</span>
            </div>
          </div>

          {/* Weight */}
          <div className="bg-black/30 rounded-xl p-2.5 border border-teal-400/15 focus-within:border-teal-400/50 transition-colors">
            <label className="block text-[10px] text-slate-400 uppercase font-medium">Weight</label>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <input
                type="number"
                min="35"
                max="180"
                value={biometrics.weightKg}
                onChange={(e) => updateBiometrics({ weightKg: Number(e.target.value) || 65 })}
                className="w-full bg-transparent text-base font-bold text-white focus:outline-none font-mono"
              />
              <span className="text-[10px] text-slate-400 font-mono">kg</span>
            </div>
          </div>

          {/* Height */}
          <div className="bg-black/30 rounded-xl p-2.5 border border-teal-400/15 focus-within:border-teal-400/50 transition-colors">
            <label className="block text-[10px] text-slate-400 uppercase font-medium">Height</label>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <input
                type="number"
                min="120"
                max="220"
                value={biometrics.heightCm}
                onChange={(e) => updateBiometrics({ heightCm: Number(e.target.value) || 170 })}
                className="w-full bg-transparent text-base font-bold text-white focus:outline-none font-mono"
              />
              <span className="text-[10px] text-slate-400 font-mono">cm</span>
            </div>
          </div>
        </div>

        {/* Target Safe Heart Rate (Auto-Calculated) */}
        <div className="p-3 rounded-xl bg-teal-950/20 border border-teal-400/25 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-300">Target Safe Heart Rate</div>
            <div className="text-[10px] text-teal-400/80 font-mono">
              Max HR: {biometrics.maxHeartRate} BPM • Fat Burn: {biometrics.fatBurnZoneLow}-{biometrics.fatBurnZoneHigh} BPM
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-[#00F5D4] font-mono glow-text-teal">
              {biometrics.targetSafeHeartRate}
            </span>
            <span className="text-[10px] text-slate-400 ml-1">BPM</span>
          </div>
        </div>
      </div>

      {/* Sleek Biometric Check Console */}
      <div className="glass-panel-card p-5 text-center relative overflow-hidden">
        <div className="absolute top-2 right-2 flex items-center space-x-1 text-[10px] text-emerald-400 font-mono">
          <ShieldCheck size={12} />
          <span>AES-256 ENCRYPTED</span>
        </div>

        <p className="text-xs font-semibold text-slate-300 mb-3">Sleek Biometric Check Console</p>

        {/* Glowing Fingerprint Pad */}
        <div className="relative inline-block my-2">
          <button
            onClick={handleFingerprintScan}
            disabled={isScanning}
            className={`w-28 h-28 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden ${
              isScanning
                ? 'bg-teal-500/20 border-2 border-[#00F5D4] shadow-glow-teal-lg'
                : scanComplete
                ? 'bg-emerald-950/30 border-2 border-emerald-400/40 shadow-glow-mint'
                : 'bg-black/40 border border-teal-400/20 hover:border-teal-400/50'
            }`}
          >
            {/* Laser scanning sweep animation */}
            {isScanning && (
              <div className="absolute inset-x-0 h-1 bg-[#00F5D4] shadow-[0_0_12px_#00F5D4] animate-pulse top-1/2 -translate-y-1/2" />
            )}

            <Fingerprint
              size={56}
              className={`transition-colors duration-300 ${
                isScanning
                  ? 'text-[#00F5D4] animate-pulse'
                  : scanComplete
                  ? 'text-[#10B981]'
                  : 'text-slate-400'
              }`}
            />
          </button>
        </div>

        <div className="mt-2 text-xs">
          {isScanning ? (
            <span className="text-[#00F5D4] font-mono animate-pulse">
              Calibrating hardware sensor telemetry...
            </span>
          ) : scanComplete ? (
            <span className="text-emerald-400 font-medium inline-flex items-center space-x-1">
              <Check size={14} />
              <span>Biometric & Sensor Integrity Verified</span>
            </span>
          ) : (
            <span className="text-slate-400">Tap to calibrate optical sensors</span>
          )}
        </div>
      </div>

      {/* Permission Toggle Cards */}
      <div className="space-y-2.5">
        <div className="text-xs font-semibold uppercase tracking-wider text-teal-400/90 px-1">
          Permission Toggle Cards
        </div>

        {/* Google Health Connect */}
        <div className="glass-panel p-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-400/30 flex items-center justify-center text-[#00F5D4]">
              <Activity size={20} />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Google Health Connect</div>
              <div className="text-[11px] text-slate-400">Sync Heart Rate, Steps, & ExerciseSession</div>
            </div>
          </div>
          <button
            onClick={toggleHealthConnect}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              biometrics.healthConnectEnabled ? 'bg-[#00F5D4]' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-slate-950 shadow-md transform transition-transform ${
                biometrics.healthConnectEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Motion & Step Cadence Sensor */}
        <div className="glass-panel p-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-[#10B981]">
              <Footprints size={20} />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Motion & Cadence Sensor</div>
              <div className="text-[11px] text-slate-400">Anti-cheat gait variance validation (&gt;1.5 SD)</div>
            </div>
          </div>
          <button
            onClick={toggleCadenceSensor}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              biometrics.cadenceSensorEnabled ? 'bg-[#10B981]' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-slate-950 shadow-md transform transition-transform ${
                biometrics.cadenceSensorEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Progress & Proceed CTA */}
      <div className="glass-panel p-3.5 space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-300 font-medium">Basics Configured:</span>
          <span className="font-mono font-bold text-emerald-400">{configuredPercent}%</span>
        </div>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-500 shadow-glow-mint"
            style={{ width: `${configuredPercent}%` }}
          />
        </div>

        <button
          onClick={() => setActiveScreen('workout')}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#00F5D4] to-[#10B981] hover:opacity-95 text-slate-950 font-bold text-sm tracking-wide shadow-glow-teal flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
        >
          <span>Launch Workout Hub</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

