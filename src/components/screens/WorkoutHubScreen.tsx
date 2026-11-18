import React, { useState } from 'react';
import { usePulse } from '../../context/PulseContext';
import { ExerciseType } from '../../types';
import {
  Flame,
  Heart,
  Play,
  Pause,
  Zap,
  Sliders,
  AlertTriangle,
  Footprints,
  Activity,
  Compass,
  Bike,
  Waves,
  Sparkles,
  Settings,
  Menu,
} from 'lucide-react';
import { AdMobModal } from '../AdMobModal';

const EXERCISES: { type: ExerciseType; label: string; met: number; icon: any }[] = [
  { type: 'Walking', label: 'Walking', met: 3.5, icon: Footprints },
  { type: 'Gym HIIT', label: 'Gym HIIT', met: 8.0, icon: Flame },
  { type: 'Running', label: 'Running', met: 9.8, icon: Activity },
  { type: 'Cycling', label: 'Cycling', met: 7.5, icon: Bike },
  { type: 'Yoga', label: 'Yoga', met: 3.0, icon: Compass },
  { type: 'Swimming', label: 'Swimming', met: 7.0, icon: Waves },
];

export const WorkoutHubScreen: React.FC = () => {
  const {
    activeWorkout,
    biometrics,
    setExerciseType,
    toggleWorkout,
    updateSimulatedBpm,
    updateCadence,
    setRecordingMethod,
    completeAdMobRewardedBoost,
    isHighCardiacStrain,
    antiCheatWarning,
    clearAntiCheatWarning,
  } = usePulse();

  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [showSimulatorDrawer, setShowSimulatorDrawer] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // SVG circular gauge math
  const radius = 105;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Let progress represent BPM effort toward 200 BPM
  const progressRatio = Math.min(1, Math.max(0, (activeWorkout.simulatedBpm - 50) / 150));
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={() => setShowSimulatorDrawer(!showSimulatorDrawer)}
          className="p-2 rounded-xl bg-slate-900/60 border border-teal-400/20 text-slate-300 hover:text-white transition-colors"
          title="Toggle Simulation & Anti-Cheat Controls"
        >
          <Menu size={18} />
        </button>

        <div className="text-center">
          <h1 className="text-base font-bold text-white tracking-wide">Multi-Sport</h1>
          <div className="flex items-center justify-center space-x-1 text-[11px] text-teal-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-ping" />
            <span>{activeWorkout.isPaused ? 'SESSION PAUSED' : 'LIVE TELEMETRY'}</span>
          </div>
        </div>

        <button
          onClick={() => setShowSimulatorDrawer(!showSimulatorDrawer)}
          className="p-2 rounded-xl bg-slate-900/60 border border-teal-400/20 text-teal-400 hover:text-white transition-colors"
          title="Telemetry Settings"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Anti-Cheat Warning Modal / Banner if triggered */}
      {antiCheatWarning && (
        <div className="glass-panel-coral p-3 text-xs flex items-start space-x-2 animate-bounce">
          <AlertTriangle className="text-[#F43F5E] shrink-0 mt-0.5" size={16} />
          <div className="flex-1 text-slate-200">
            <span className="font-bold text-[#F43F5E]">Anti-Fraud Triggered: </span>
            {antiCheatWarning}
          </div>
          <button
            onClick={clearAntiCheatWarning}
            className="text-slate-400 hover:text-white text-xs font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* High Cardiac Strain Warning Banner */}
      {isHighCardiacStrain && (
        <div className="glass-panel-coral p-3 text-xs flex items-center space-x-2 animate-pulse">
          <AlertTriangle className="text-[#F43F5E] shrink-0" size={18} />
          <div className="text-slate-200 font-medium">
            <span className="font-bold text-[#F43F5E]">High Cardiac Strain Alert: </span>
            Heart rate exceeds 85% of Max HR ({biometrics.maxHeartRate} BPM). Drop pace immediately!
          </div>
        </div>
      )}

      {/* Central Glowing Circular BPM & Calorie Ring */}
      <div className="relative flex flex-col items-center justify-center py-4">
        {/* Ambient neon radial glow behind the ring */}
        <div
          className={`absolute w-60 h-60 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
            isHighCardiacStrain
              ? 'bg-[#F43F5E]/20'
              : activeWorkout.isTurboBoosted
              ? 'bg-[#00F5D4]/25'
              : 'bg-[#10B981]/20'
          }`}
        />

        <div className="relative flex items-center justify-center">
          <svg
            height={radius * 2}
            width={radius * 2}
            className="transform -rotate-90 filter drop-shadow-[0_0_15px_rgba(0,245,212,0.35)]"
          >
            <defs>
              <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00F5D4" />
                <stop offset="100%" stopColor={isHighCardiacStrain ? '#F43F5E' : '#10B981'} />
              </linearGradient>
            </defs>

            {/* Background track circle */}
            <circle
              stroke="rgba(255, 255, 255, 0.06)"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />

            {/* Glowing active progress arc */}
            <circle
              stroke="url(#ringGradient)"
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={circumference + ' ' + circumference}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              className="transition-all duration-500 ease-out"
            />
          </svg>

          {/* Center Metrics Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-400/90 flex items-center space-x-1">
              <span>Target Effort</span>
            </span>

            <div className="my-1 flex items-center space-x-1.5">
              <Heart
                size={18}
                className={`transition-colors duration-300 ${
                  isHighCardiacStrain
                    ? 'text-[#F43F5E] animate-ping'
                    : 'text-[#00F5D4] animate-pulse'
                } fill-current`}
              />
              <span
                className={`text-4xl font-black font-mono tracking-tight ${
                  isHighCardiacStrain
                    ? 'text-[#F43F5E] glow-text-coral'
                    : 'text-white glow-text-teal'
                }`}
              >
                {activeWorkout.simulatedBpm}
              </span>
            </div>

            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              BPM
            </span>

            <div className="mt-2 text-xs font-mono font-bold text-slate-300">
              <span className="text-white text-sm">{activeWorkout.activeCalories}</span>
              <span className="text-slate-400 text-[10px] ml-1">kcal</span>
            </div>
          </div>
        </div>

        {/* Quick telemetry pills below the ring */}
        <div className="mt-4 flex items-center space-x-3">
          <div className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-400/30 text-xs font-mono text-[#00F5D4] flex items-center space-x-1 shadow-glow-teal">
            <Zap size={13} className="fill-current" />
            <span className="font-bold">{activeWorkout.simulatedBpm} BPM</span>
          </div>

          <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-xs font-mono text-[#10B981] flex items-center space-x-1 shadow-glow-mint">
            <Flame size={13} className="fill-current" />
            <span className="font-bold">{activeWorkout.activeCalories} kcal</span>
          </div>

          <div className="px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-300">
            <span>{formatTime(activeWorkout.durationSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Simulator Drawer (Collapsible for anti-cheat & live sliders) */}
      {showSimulatorDrawer && (
        <div className="glass-panel p-3.5 space-y-3 border-teal-400/40 bg-slate-900/90 text-xs animate-fadeIn">
          <div className="flex items-center justify-between text-teal-400 font-bold border-b border-teal-400/20 pb-1.5">
            <div className="flex items-center space-x-1.5">
              <Sliders size={14} />
              <span>Interactive Telemetry & Anti-Cheat Lab</span>
            </div>
            <button
              onClick={() => setShowSimulatorDrawer(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* BPM Slider */}
          <div className="space-y-1">
            <div className="flex justify-between font-mono text-[11px]">
              <span className="text-slate-300">Live Heart Rate Simulation:</span>
              <span className={activeWorkout.simulatedBpm > 168 ? 'text-[#F43F5E] font-bold' : 'text-teal-400 font-bold'}>
                {activeWorkout.simulatedBpm} BPM {activeWorkout.simulatedBpm > 168 ? '(Redline Alert)' : ''}
              </span>
            </div>
            <input
              type="range"
              min="60"
              max="200"
              value={activeWorkout.simulatedBpm}
              onChange={(e) => updateSimulatedBpm(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#00F5D4]"
            />
          </div>

          {/* Anti-Cheat Mode Switches */}
          <div className="space-y-1.5 pt-1">
            <span className="text-slate-300 font-medium block text-[11px]">Anti-Cheat Physical Audit Profile:</span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => {
                  setRecordingMethod('RECORDING_METHOD_SENSOR_HEART_RATE');
                  updateCadence(165, 3.4);
                }}
                className={`p-2 rounded-lg text-left transition-all border ${
                  activeWorkout.antiCheatStatus === 'VERIFIED'
                    ? 'bg-emerald-950/40 border-emerald-400 text-emerald-300 shadow-glow-mint'
                    : 'bg-black/30 border-slate-700 text-slate-400'
                }`}
              >
                <div className="font-bold text-[10px]">Natural Gait</div>
                <div className="text-[9px] text-slate-400">StdDev: 3.4 (Pass)</div>
              </button>

              <button
                onClick={() => {
                  setRecordingMethod('RECORDING_METHOD_SENSOR_HEART_RATE');
                  updateCadence(180, 0.7);
                }}
                className={`p-2 rounded-lg text-left transition-all border ${
                  activeWorkout.antiCheatStatus === 'FLAGGED_SHAKER'
                    ? 'bg-red-950/40 border-[#F43F5E] text-red-300 shadow-glow-coral'
                    : 'bg-black/30 border-slate-700 text-slate-400'
                }`}
              >
                <div className="font-bold text-[10px]">Mechanical Shaker</div>
                <div className="text-[9px] text-red-400">StdDev: 0.7 &lt; 1.5</div>
              </button>

              <button
                onClick={() => {
                  setRecordingMethod('RECORDING_METHOD_MANUAL_ENTRY');
                }}
                className={`p-2 rounded-lg text-left transition-all border ${
                  activeWorkout.antiCheatStatus === 'FLAGGED_MANUAL'
                    ? 'bg-red-950/40 border-[#F43F5E] text-red-300 shadow-glow-coral'
                    : 'bg-black/30 border-slate-700 text-slate-400'
                }`}
              >
                <div className="font-bold text-[10px]">Manual Entry</div>
                <div className="text-[9px] text-red-400">No Sensor Log</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Sport Exercise Select Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-400/90">
            Exercise Select
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Current: {activeWorkout.exerciseType}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {EXERCISES.map((ex) => {
            const Icon = ex.icon;
            const isSelected = activeWorkout.exerciseType === ex.type;
            return (
              <button
                key={ex.type}
                onClick={() => setExerciseType(ex.type)}
                className={`p-2.5 rounded-xl flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'glass-panel border-teal-400 text-[#00F5D4] shadow-glow-teal scale-[1.02]'
                    : 'bg-black/25 border border-teal-400/10 text-slate-400 hover:text-white hover:border-teal-400/30'
                }`}
              >
                <Icon size={20} className={isSelected ? 'text-[#00F5D4]' : 'text-slate-400'} />
                <span className="text-[10px] font-medium mt-1 truncate max-w-full">
                  {ex.label}
                </span>
                <span className="text-[8px] font-mono text-slate-400">
                  {ex.met} MET
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action CTA Buttons */}
      <div className="space-y-2.5 pt-2">
        {/* Play / Pause Live Track CTA */}
        <button
          onClick={toggleWorkout}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-sm tracking-wide shadow-glow-teal flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
        >
          {activeWorkout.isPaused ? (
            <>
              <Play size={18} className="fill-current" />
              <span>Resume Live Track</span>
            </>
          ) : (
            <>
              <Pause size={18} className="fill-current" />
              <span>Play / Pause Live Track</span>
            </>
          )}
        </button>

        {/* Ad-Gated 2x Turbo Boost Button */}
        <button
          onClick={() => setIsAdModalOpen(true)}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-teal-950/60 to-emerald-950/40 border-2 border-[#00F5D4] text-[#00F5D4] font-bold text-xs uppercase tracking-wider shadow-glow-teal-lg flex items-center justify-center space-x-2 transition-all hover:bg-teal-500/10 active:scale-[0.98]"
        >
          <Sparkles size={16} className="text-[#00F5D4] animate-spin" />
          <span>⚡ Ad-Gated 2x Turbo Boost</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-400/20 text-white">
            +20 Coins
          </span>
        </button>
      </div>

      {/* Google AdMob Rewarded Video Simulator Modal */}
      <AdMobModal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
        onComplete={completeAdMobRewardedBoost}
        title="AdMob Turbo Boost Rewarded Video"
        rewardText="+20 Verified PulseCoins (SSV Signed)"
      />
    </div>
  );
};
