import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2, ShieldCheck, X, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdMobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => { success: boolean; coinsAwarded: number; transactionId: string; message: string };
  title?: string;
  rewardText?: string;
}

export const AdMobModal: React.FC<AdMobModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  title = "Google AdMob Rewarded Video",
  rewardText = "+20 Verified PulseCoins",
}) => {
  const [countdown, setCountdown] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [result, setResult] = useState<{ success: boolean; coinsAwarded: number; transactionId: string; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCountdown(5);
      setIsPlaying(true);
      setIsCompleted(false);
      setResult(null);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: any;
    if (isOpen && isPlaying && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    } else if (isOpen && isPlaying && countdown === 0) {
      setIsPlaying(false);
      setIsCompleted(true);
      const res = onComplete();
      setResult(res);
      if (res.success) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#00F5D4', '#10B981', '#38BDF8'],
        });
      }
    }
    return () => clearInterval(timer);
  }, [isOpen, isPlaying, countdown, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-2xl bg-[#0A1016] border border-teal-400/30 p-5 shadow-glow-teal text-white overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#00F5D4]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-[#10B981]/15 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-teal-400/15">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-teal-500/20 text-[#00F5D4] border border-teal-500/30">
              AdMob SSV Simulator
            </span>
            <span className="text-xs text-slate-400">{title}</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Video Simulation Screen */}
        <div className="my-4 relative rounded-xl overflow-hidden aspect-video bg-gradient-to-br from-slate-900 via-[#070B10] to-[#0D151C] border border-slate-700/50 flex flex-col items-center justify-center text-center p-4">
          {isPlaying && (
            <>
              {/* Countdown badge */}
              <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm border border-teal-400/30 px-2 py-1 rounded-full text-xs font-mono font-bold text-[#00F5D4] flex items-center space-x-1">
                <span>Reward in:</span>
                <span className="text-sm text-white">{countdown}s</span>
              </div>

              {/* Fake Ad Video Content */}
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-[#00F5D4] animate-pulse">
                  <Play size={22} className="fill-current translate-x-0.5" />
                </div>
                <div className="text-xs font-medium text-slate-300">
                  Google Partner Video Sponsor
                </div>
                <div className="text-[11px] text-teal-400/80 font-mono">
                  [Simulated Ad Stream • AdMob Reward SDK]
                </div>
              </div>

              {/* Bottom progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-1000 ease-linear"
                  style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                />
              </div>
            </>
          )}

          {isCompleted && result && (
            <div className="space-y-2 animate-scaleUp">
              {result.success ? (
                <>
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-[#10B981]">
                    <CheckCircle2 size={28} />
                  </div>
                  <div className="text-sm font-semibold text-emerald-300">
                    Reward Verified!
                  </div>
                  <div className="text-xs text-slate-300 font-mono">
                    {rewardText}
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 mx-auto rounded-full bg-coral-500/20 border border-[#F43F5E]/50 flex items-center justify-center text-[#F43F5E]">
                    <AlertTriangle size={28} />
                  </div>
                  <div className="text-sm font-semibold text-red-400">
                    Minting Rejected
                  </div>
                  <div className="text-[11px] text-slate-300 line-clamp-2 px-2">
                    {result.message}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* AdMob SSV Signature Details */}
        {isCompleted && result && result.success && (
          <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-400/20 text-[11px] font-mono space-y-1 mb-4">
            <div className="flex items-center text-emerald-400 font-semibold space-x-1">
              <ShieldCheck size={14} />
              <span>AdMob SSV Callback Cryptographically Signed</span>
            </div>
            <div className="text-slate-400 truncate">
              TxID: <span className="text-teal-300">{result.transactionId}</span>
            </div>
            <div className="text-slate-400">
              Split: <span className="text-emerald-300">60% Payout Pool</span> / <span className="text-slate-300">40% Founder Profit</span>
            </div>
          </div>
        )}

        {/* Bottom action */}
        {isCompleted ? (
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-sm tracking-wide shadow-glow-teal transition-all"
          >
            Claim & Return to App
          </button>
        ) : (
          <div className="text-center text-xs text-slate-400">
            Please watch the full 5s simulation to mint Verified PulseCoins
          </div>
        )}
      </div>
    </div>
  );
};
