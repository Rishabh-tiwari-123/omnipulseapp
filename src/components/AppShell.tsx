import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePulse } from '../context/PulseContext';
import { ScreenId } from '../types';
import {
  Wifi,
  Battery,
  Flame,
  HeartPulse,
  Wallet,
  Users,
  ShieldCheck,
  UserCheck,
  Signal,
  Sparkles,
} from 'lucide-react';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { WorkoutHubScreen } from './screens/WorkoutHubScreen';
import { SafetyConsoleScreen } from './screens/SafetyConsoleScreen';
import { RewardsStoreScreen } from './screens/RewardsStoreScreen';
import { SquadsReferralScreen } from './screens/SquadsReferralScreen';
import { AdminTreasuryScreen } from './screens/AdminTreasuryScreen';

interface NavItem {
  id: ScreenId;
  label: string;
  icon: any;
  screenNum: number;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'onboarding', label: 'Onboard', icon: UserCheck, screenNum: 1 },
  { id: 'workout', label: 'Workout', icon: Flame, screenNum: 2 },
  { id: 'safety', label: 'Health', icon: HeartPulse, screenNum: 3 },
  { id: 'rewards', label: 'Wallet', icon: Wallet, screenNum: 4 },
  { id: 'squads', label: 'Squads', icon: Users, screenNum: 5 },
  { id: 'admin', label: 'Admin', icon: ShieldCheck, screenNum: 6 },
];

export const AppShell: React.FC = () => {
  const { activeScreen, setActiveScreen, wallet, isHighCardiacStrain } = usePulse();

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'onboarding':
        return <OnboardingScreen />;
      case 'workout':
        return <WorkoutHubScreen />;
      case 'safety':
        return <SafetyConsoleScreen />;
      case 'rewards':
        return <RewardsStoreScreen />;
      case 'squads':
        return <SquadsReferralScreen />;
      case 'admin':
        return <AdminTreasuryScreen />;
      default:
        return <WorkoutHubScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-[#04070B] text-slate-100 flex flex-col justify-start items-center p-0 sm:py-6 selection:bg-[#00F5D4]/30">
      {/* Desktop Quick-Switch Screen Header Banner */}
      <div className="w-full max-w-md hidden sm:flex items-center justify-between pb-3 px-2 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00F5D4] shadow-glow-teal animate-pulse" />
          <span className="font-mono font-bold tracking-wider text-slate-300">
            OMNIPULSE v5 • OPTION 6
          </span>
        </div>
        <div className="flex items-center space-x-1 font-mono text-[11px] text-teal-400">
          <span>Obsidian Dark Slate</span>
        </div>
      </div>

      {/* Screen quick tabs (Desktop & Mobile tester bar) */}
      <div className="w-full max-w-md px-3 pb-2 flex items-center justify-between overflow-x-auto space-x-1 text-[11px] font-mono scrollbar-none">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveScreen(item.id)}
            className={`px-2 py-1 rounded-lg transition-all shrink-0 border ${
              activeScreen === item.id
                ? 'bg-teal-500/20 text-[#00F5D4] border-teal-400/50 shadow-glow-teal font-bold'
                : 'bg-black/40 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            S{item.screenNum}: {item.label}
          </button>
        ))}
      </div>

      {/* Centered Mobile Phone Viewport Container */}
      <div className="w-full max-w-md min-h-screen sm:min-h-[844px] sm:max-h-[890px] sm:rounded-[36px] bg-gradient-to-b from-[#0D151C] via-[#070B10] to-[#04070B] border-x sm:border-y border-teal-400/20 shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_20px_rgba(0,245,212,0.15)] relative flex flex-col overflow-hidden">
        {/* Top Status Bar (9:41, Signal, Wifi, Battery) */}
        <div className="pt-3 px-6 pb-2 flex items-center justify-between text-xs font-semibold select-none z-30 shrink-0">
          {/* Time */}
          <span className="font-mono text-xs tracking-tight text-slate-200">9:41</span>

          {/* Dynamic Island / Camera Notch */}
          <div className="w-20 h-4 bg-black rounded-full border border-slate-800/80 flex items-center justify-center space-x-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-700" />
            <div className="w-1.5 h-1.5 rounded-full bg-teal-500/40" />
          </div>

          {/* Indicators */}
          <div className="flex items-center space-x-2 text-slate-300">
            <Signal size={13} className="text-slate-200" />
            <Wifi size={13} className="text-slate-200" />
            <div className="flex items-center space-x-0.5">
              <span className="text-[10px] font-mono text-slate-300">100%</span>
              <Battery size={15} className="text-[#10B981] fill-current" />
            </div>
          </div>
        </div>

        {/* Global Wallet Pill & Cardiac Strain Warning Indicator */}
        <div className="px-4 py-1.5 flex items-center justify-between border-b border-teal-400/10 text-xs shrink-0 bg-black/25">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-teal-300 font-mono text-[11px]">
              <Sparkles size={12} className="text-[#00F5D4]" />
              <span className="font-bold">{wallet.verifiedPulseCoins.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400">Coins</span>
            </div>
            <span className="text-slate-600">•</span>
            <div className="text-[10px] font-mono text-emerald-400">
              ₹{(wallet.verifiedPulseCoins / 100).toFixed(0)} Value
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {isHighCardiacStrain ? (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-red-500/20 text-[#F43F5E] border border-red-500/30 animate-pulse">
                Strain &gt;85%
              </span>
            ) : (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-teal-500/10 text-[#00F5D4] border border-teal-500/25">
                Safe Aerobic
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Screen Content Body */}
        <div className="flex-1 overflow-y-auto px-4 pt-3 pb-24 scrollbar-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeScreen}
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.99 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {renderActiveScreen()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Frosted Glass Bottom Navigation Bar */}
        <div className="absolute bottom-0 inset-x-0 z-40 glass-nav border-t border-teal-400/20 px-2 py-2">
          <div className="flex items-center justify-around">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveScreen(item.id)}
                  className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
                    isActive
                      ? 'text-[#00F5D4] scale-105'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="relative">
                    <Icon size={19} className={isActive ? 'drop-shadow-[0_0_8px_#00F5D4]' : ''} />
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#00F5D4] shadow-glow-teal" />
                    )}
                  </div>
                  <span
                    className={`text-[9px] font-medium mt-1 tracking-tight ${
                      isActive ? 'font-bold text-[#00F5D4]' : 'text-slate-400'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Home indicator bar (iPhone gesture line) */}
          <div className="w-32 h-1 bg-slate-600/60 rounded-full mx-auto mt-2" />
        </div>
      </div>
    </div>
  );
};

