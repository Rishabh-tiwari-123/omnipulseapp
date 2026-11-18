import React, { useState } from 'react';
import { usePulse } from '../../context/PulseContext';
import {
  Copy,
  Check,
  Sparkles,
  Trophy,
  Flame,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SquadsReferralScreen: React.FC = () => {
  const { pendingReferrals, campusLeaderboard, simulateFriendProgress, setActiveScreen } = usePulse();
  const [copiedCode, setCopiedCode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const referralCode = "OMNI-6B8";
  const shareMessage = `Join my fitness squad on OmniPulse v5! Earn UPI cash & brand vouchers for verified workouts. Use my invite code: ${referralCode} https://omnipulse.app/join/${referralCode}`;

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setToastMessage("Referral Code copied to clipboard!");
    setTimeout(() => {
      setCopiedCode(false);
      setToastMessage(null);
    }, 2500);
  };

  // One-tap WhatsApp deep-link trigger matching specification
  const shareOnWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank');
  };

  const handleSimulateMilestone = (id: string, friendName: string) => {
    simulateFriendProgress(id);
    confetti({
      particleCount: 85,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00F5D4', '#10B981', '#25D366', '#38BDF8'],
    });
    setToastMessage(`🎉 ${friendName} completed 3 workouts & 5 ads! +50 Verified PulseCoins credited to your wallet.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Top Header matching Blueprint */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveScreen('workout')}
            className="p-1.5 rounded-lg bg-black/40 border border-teal-400/20 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">Squad and Referrals</h1>
            <p className="text-[11px] text-slate-400">Campus Viral Hub &amp; Anti-Fraud</p>
          </div>
        </div>

        {/* Glowing Green WhatsApp Share Button */}
        <button
          onClick={shareOnWhatsApp}
          className="p-2 rounded-xl bg-[#25D366]/20 border border-[#25D366]/50 text-[#25D366] hover:bg-[#25D366]/30 transition-all shadow-[0_0_15px_rgba(37,211,102,0.35)] flex items-center space-x-1"
          title="Share on WhatsApp (wa.me)"
        >
          {/* Custom WhatsApp SVG icon */}
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.067-2.228-.567-1.748-.722-2.871-2.493-2.958-2.608-.088-.116-.692-.923-.692-1.763 0-.84.44-1.25.597-1.424.157-.174.341-.218.455-.218.114 0 .228.001.328.006.105.005.247-.04.385.293.144.347.49 1.196.533 1.284.043.088.072.19.014.305-.058.115-.087.187-.173.289-.087.102-.183.228-.261.306-.087.087-.178.182-.077.355.101.174.45 1.056 1.488 1.98.591.527 1.088.69 1.246.769.158.079.25.066.345-.044.095-.11.408-.475.518-.638.11-.163.22-.136.371-.08.151.057.958.452 1.123.535.165.083.275.124.316.194.041.07.041.406-.103.811z" />
          </svg>
        </button>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="glass-panel-card p-3 border-teal-400 text-xs text-teal-200 flex items-center space-x-2 shadow-glow-teal animate-fadeIn">
          <Sparkles size={16} className="text-[#00F5D4] shrink-0 animate-spin" />
          <span className="flex-1 font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* 1. Shareable Referral Code Card matching Blueprint */}
      <div className="glass-panel-card p-4 space-y-3 relative overflow-hidden border-teal-400/30 shadow-glow-teal">
        {/* Glow ambient background */}
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#00F5D4]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
            Your Referral Code:
          </span>
          <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
            <Sparkles size={11} className="text-[#00F5D4]" />
            <span>+50 Coins / Active Friend</span>
          </span>
        </div>

        {/* Code Box with One-Tap WhatsApp Button */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-black/50 border border-teal-400/30">
          <div className="font-mono text-2xl font-black text-white tracking-widest glow-text-teal">
            {referralCode}
          </div>

          <div className="flex items-center space-x-2">
            {/* Copy Button */}
            <button
              onClick={copyCode}
              className="p-2.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-400/35 text-[#00F5D4] transition-all active:scale-[0.95]"
              title="Copy Code"
            >
              {copiedCode ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
            </button>

            {/* Glowing Green WhatsApp Deep-Link Button */}
            <button
              onClick={shareOnWhatsApp}
              className="p-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-bold shadow-[0_0_20px_rgba(37,211,102,0.45)] transition-all active:scale-[0.95] flex items-center space-x-1.5"
              title="Share on WhatsApp"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.067-2.228-.567-1.748-.722-2.871-2.493-2.958-2.608-.088-.116-.692-.923-.692-1.763 0-.84.44-1.25.597-1.424.157-.174.341-.218.455-.218.114 0 .228.001.328.006.105.005.247-.04.385.293.144.347.49 1.196.533 1.284.043.088.072.19.014.305-.058.115-.087.187-.173.289-.087.102-.183.228-.261.306-.087.087-.178.182-.077.355.101.174.45 1.056 1.488 1.98.591.527 1.088.69 1.246.769.158.079.25.066.345-.044.095-.11.408-.475.518-.638.11-.163.22-.136.371-.08.151.057.958.452 1.123.535.165.083.275.124.316.194.041.07.041.406-.103.811z" />
              </svg>
              <span className="text-xs font-black">Share</span>
            </button>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 leading-relaxed">
          <span className="text-[#00F5D4] font-semibold">Anti-Fraud Safeguard:</span> Reward coins mint only after your friend completes <span className="text-white font-medium">3 verified sensor workouts</span> and <span className="text-white font-medium">5 AdMob ads</span>.
        </p>
      </div>

      {/* 2. Pending Milestones Anti-Fraud List matching Blueprint */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-teal-400/90 flex items-center space-x-1">
              <ShieldCheck size={13} />
              <span>Pending Milestones:</span>
            </div>
            <div className="text-[10px] text-slate-400">Invite a friend to earn 50 Coins</div>
          </div>

          <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-400/30">
            {pendingReferrals.filter(r => r.status === 'completed').length}/{pendingReferrals.length} Cleared
          </span>
        </div>

        <div className="space-y-2.5">
          {pendingReferrals.map((friend) => {
            const isDone = friend.status === 'completed';
            const workoutProgress = (friend.workoutsCompleted / friend.workoutsRequired) * 100;
            const adsProgress = (friend.adsWatched / friend.adsRequired) * 100;

            return (
              <div
                key={friend.id}
                className="glass-panel-card p-3.5 space-y-2.5 border-teal-400/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="w-9 h-9 rounded-full border-2 border-teal-400/50 object-cover shadow-glow-teal"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">{friend.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {isDone ? 'Verified & Awarded (+50 Coins)' : `${friend.workoutsCompleted}/3 workouts, ${friend.adsWatched}/5 ads`}
                      </div>
                    </div>
                  </div>

                  {isDone ? (
                    <span className="inline-flex items-center space-x-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-400/40 shadow-glow-mint">
                      <CheckCircle2 size={12} />
                      <span>Verified</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSimulateMilestone(friend.id, friend.name)}
                      className="text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-xl bg-teal-500/20 text-[#00F5D4] border border-teal-400/40 hover:bg-teal-500/30 transition-all shadow-glow-teal active:scale-[0.96]"
                    >
                      + Simulate Milestone
                    </button>
                  )}
                </div>

                {/* Dual Neon Progress Bars */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {/* Workouts Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-mono text-slate-400">
                      <span>Workouts:</span>
                      <span className="text-teal-300 font-bold">{friend.workoutsCompleted}/{friend.workoutsRequired}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-500 shadow-glow-teal"
                        style={{ width: `${workoutProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Ads Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-mono text-slate-400">
                      <span>AdMob Ads:</span>
                      <span className="text-emerald-300 font-bold">{friend.adsWatched}/{friend.adsRequired}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-500 shadow-glow-mint"
                        style={{ width: `${adsProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Campus Hostel Leaderboard matching Blueprint */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-400/90 flex items-center space-x-1.5">
            <Trophy size={13} className="text-yellow-400" />
            <span>Campus Hostel Leaderboard</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Calories</span>
        </div>

        <div className="space-y-1.5">
          {campusLeaderboard.map((student) => (
            <div
              key={student.rank}
              className={`p-3 rounded-2xl flex items-center justify-between transition-all ${
                student.isUser
                  ? 'glass-panel border-teal-400/50 bg-teal-950/25 shadow-glow-teal scale-[1.01]'
                  : 'bg-black/35 border border-teal-400/15'
              }`}
            >
              <div className="flex items-center space-x-3">
                {/* Student Rank */}
                <span
                  className={`w-4 text-center font-mono font-black text-xs ${
                    student.rank === 1
                      ? 'text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]'
                      : student.rank === 2
                      ? 'text-slate-300'
                      : student.rank === 3
                      ? 'text-amber-500'
                      : 'text-slate-400'
                  }`}
                >
                  {student.rank}
                </span>

                {/* Avatar with glowing ring */}
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-8 h-8 rounded-full border border-teal-400/40 object-cover"
                />

                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className={`text-xs font-bold ${student.isUser ? 'text-[#00F5D4]' : 'text-white'}`}>
                      {student.name}
                    </span>
                    {student.isUser && (
                      <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-teal-500/20 text-[#00F5D4] border border-teal-400/30">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono truncate max-w-[140px]">
                    {student.hostel}
                  </div>
                </div>
              </div>

              {/* Formatted Calories Burned with Glowing Teal Dot */}
              <div className="flex items-center space-x-2 text-right">
                <span className="w-2 h-2 rounded-full bg-[#00F5D4] shadow-glow-teal animate-pulse shrink-0" />
                <div>
                  <div className="text-xs font-black font-mono text-white flex items-center justify-end space-x-1">
                    <Flame size={12} className="text-[#10B981] fill-current" />
                    <span>{student.calories.toLocaleString()}</span>
                  </div>
                  <div className="text-[9px] font-mono text-slate-400">
                    {student.sweatXp.toLocaleString()} XP
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
