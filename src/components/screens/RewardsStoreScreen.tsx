import React, { useState, useEffect } from 'react';
import { usePulse } from '../../context/PulseContext';
import { VoucherItem } from '../../types';
import {
  Wallet,
  Coins,
  Flame,
  Clock,
  CheckCircle2,
  Gift,
  ArrowUpRight,
  Shield,
  Copy,
  Check,
  X,
  Sparkles,
  Trophy,
  Users,
  CheckCircle,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RedemptionReceipt {
  type: 'upi' | 'voucher';
  title: string;
  orderId: string;
  amountText: string;
  pin?: string;
  vpa?: string;
  statusText: string;
  inEscrow: boolean;
}

export const RewardsStoreScreen: React.FC = () => {
  const { wallet, vouchers, requestUpiWithdrawal, redeemVoucher } = usePulse();

  // Accurate IST countdown calculation to 8:00 PM IST (20:00 IST = UTC+5:30)
  const [timeLeft, setTimeLeft] = useState(() => calculateISTRemaining());
  const [selectedUpiAmount, setSelectedUpiAmount] = useState<{ inr: number; coins: number } | null>(null);
  const [upiIdInput, setUpiIdInput] = useState('');
  const [upiError, setUpiError] = useState<string | null>(null);

  // Redemption receipt modal
  const [receipt, setReceipt] = useState<RedemptionReceipt | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [copiedPin, setCopiedPin] = useState(false);

  // Opt into campus streak challenge
  const [streakPoolJoined, setStreakPoolJoined] = useState(false);

  function calculateISTRemaining() {
    const now = new Date();
    // Convert to IST timestamp (UTC + 5.5 hours)
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const istNow = new Date(utcTime + 330 * 60000);

    const target = new Date(istNow);
    target.setHours(20, 0, 0, 0); // 8:00 PM IST

    if (istNow.getTime() >= target.getTime()) {
      target.setDate(target.getDate() + 1);
    }

    const diff = target.getTime() - istNow.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateISTRemaining());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleUpiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUpiAmount) return;
    setUpiError(null);

    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!upiRegex.test(upiIdInput.trim())) {
      setUpiError('Invalid UPI ID. Format must be name@bank (e.g., name@okaxis, user@okhdfcbank).');
      return;
    }

    const res = requestUpiWithdrawal(upiIdInput.trim(), selectedUpiAmount.inr, selectedUpiAmount.coins);
    if (res.success && res.orderId) {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#00F5D4', '#10B981', '#38BDF8'],
      });

      setReceipt({
        type: 'upi',
        title: `Instant UPI Cashout (₹${selectedUpiAmount.inr})`,
        orderId: res.orderId,
        amountText: `₹${selectedUpiAmount.inr}.00 INR`,
        vpa: upiIdInput.trim(),
        statusText: 'ESCROW_48HR — Live Anti-Cheat Audit Queued',
        inEscrow: true,
      });

      setSelectedUpiAmount(null);
      setUpiIdInput('');
    } else {
      setUpiError(res.error || 'Failed to submit withdrawal request.');
    }
  };

  const handleRedeemVoucher = (v: VoucherItem) => {
    setVoucherError(null);
    const res = redeemVoucher(v.id);
    if (res.success) {
      confetti({
        particleCount: 75,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#00F5D4', '#FC8019', '#10B981'],
      });

      setReceipt({
        type: 'voucher',
        title: v.title,
        orderId: res.orderId || `VCH-${Math.floor(100000 + Math.random() * 900000)}`,
        amountText: `₹${v.valueINR} Value (${v.brand})`,
        pin: res.pin,
        statusText: res.inEscrow
          ? 'ESCROW_48HR — Fresh PIN Restock Queued from Vault'
          : 'INSTANT_DELIVERED — Pre-Loaded 16-Digit PIN Ready',
        inEscrow: !!res.inEscrow,
      });
    } else {
      setVoucherError(res.error || 'Failed to redeem voucher.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-400/30 flex items-center justify-center text-[#00F5D4]">
            <Wallet size={18} />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">Visual Wallet</h1>
            <p className="text-[11px] text-slate-400">Sweat-to-UPI &amp; Voucher Store</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-[10px] font-mono text-[#10B981] shadow-glow-mint">
          <Flame size={12} className="fill-current text-[#10B981]" />
          <span>{wallet.streakDays}d Streak ({wallet.streakMultiplier}x)</span>
        </div>
      </div>

      {/* 1. Visual Wallet Header Card matching UI Blueprint */}
      <div className="glass-panel-card p-4 space-y-3 relative overflow-hidden border-teal-400/30 shadow-glow-teal">
        {/* Ambient background glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#00F5D4]/15 rounded-full blur-2xl pointer-events-none" />

        {/* PulseCoins Primary Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Glowing circular coin badge */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#00F5D4]/20 via-[#10B981]/30 to-[#00F5D4]/20 border-2 border-[#00F5D4] flex items-center justify-center text-[#00F5D4] shadow-glow-teal-lg">
              <Coins size={24} className="fill-current/30" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-300">PulseCoins:</span>
                <span className="text-2xl font-black font-mono text-white glow-text-teal">
                  {wallet.verifiedPulseCoins.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-[10px] font-mono text-emerald-400 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span className="font-bold">Verified Token</span>
                <span className="text-slate-400">• 1,000 PulseCoins = ₹10 INR</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-bold text-teal-300 bg-teal-950/40 px-2 py-1 rounded-md border border-teal-400/30">
              ₹{(wallet.verifiedPulseCoins / 100).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Sweat XP Sub-Card / Bar */}
        <div className="p-2.5 rounded-xl bg-black/40 border border-teal-400/15 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-black uppercase bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40">
              XP
            </span>
            <span className="font-bold text-slate-200">Sweat XP</span>
            <span className="text-slate-500 font-mono text-[10px]">• Campus Rank Points</span>
          </div>
          <div className="font-mono font-bold text-emerald-400 flex items-center space-x-1">
            <Flame size={12} className="fill-current text-[#10B981]" />
            <span>{wallet.sweatXp.toLocaleString()} XP</span>
          </div>
        </div>
      </div>

      {/* Daily Scarcity Drop Countdown Banner (IST Clock) */}
      <div className="glass-panel p-3 flex items-center justify-between border-teal-400/25 bg-gradient-to-r from-teal-950/30 via-emerald-950/20 to-teal-950/30 shadow-glow-teal">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-[#00F5D4]">
            <Clock size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Next Daily UPI &amp; Voucher Drop</div>
            <div className="text-[10px] text-slate-400">Unlocks today at 8:00 PM IST</div>
          </div>
        </div>
        <div className="text-right font-mono text-xs font-black text-[#00F5D4] bg-black/50 px-2.5 py-1 rounded-lg border border-teal-400/35 tracking-wider">
          {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
        </div>
      </div>

      {voucherError && (
        <div className="p-2.5 rounded-xl bg-red-950/40 border border-[#F43F5E]/40 text-[#F43F5E] text-xs flex items-center justify-between">
          <span>{voucherError}</span>
          <button onClick={() => setVoucherError(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* 2. Side-by-Side 2-Column Layout matching Blueprint */}
      <div className="space-y-2">
        {/* Column Headers */}
        <div className="grid grid-cols-2 gap-3 px-1 text-xs font-semibold uppercase tracking-wider text-teal-400/90">
          <div className="flex items-center space-x-1">
            <span>Instant UPI Cashout</span>
          </div>
          <div className="flex items-center space-x-1">
            <Gift size={13} className="text-[#00F5D4]" />
            <span>Digital Voucher</span>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-2 gap-2.5 items-start">
          {/* Left Column: Instant UPI Cashout Cards */}
          <div className="space-y-2.5">
            {/* ₹10 Card */}
            <button
              onClick={() => setSelectedUpiAmount({ inr: 10, coins: 1000 })}
              className="w-full glass-panel-card p-3 text-left relative overflow-hidden hover:border-[#00F5D4] transition-all active:scale-[0.98] group border-teal-400/25"
            >
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black font-mono text-white glow-text-teal">₹10</span>
                <span className="text-[10px] font-mono text-slate-400">1,000 Coins</span>
              </div>
              <div className="mt-2 flex items-center space-x-1 text-[9px] font-mono text-emerald-400">
                <CheckCircle2 size={11} className="text-[#10B981]" />
                <span>Live verification</span>
              </div>
              <div className="mt-1.5 inline-block text-[8px] font-mono px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-400/30">
                ESCROW_48HR
              </div>
            </button>

            {/* ₹25 Card */}
            <button
              onClick={() => setSelectedUpiAmount({ inr: 25, coins: 2400 })}
              className="w-full glass-panel-card p-3 text-left relative overflow-hidden hover:border-[#00F5D4] transition-all active:scale-[0.98] group border-teal-400/25"
            >
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black font-mono text-white glow-text-teal">₹25</span>
                <span className="text-[10px] font-mono text-slate-400">2,400 Coins</span>
              </div>
              <div className="mt-2 flex items-center space-x-1 text-[9px] font-mono text-emerald-400">
                <CheckCircle2 size={11} className="text-[#10B981]" />
                <span>Live verification</span>
              </div>
              <div className="mt-1.5 inline-block text-[8px] font-mono px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-400/30">
                ESCROW_48HR
              </div>
            </button>

            {/* ₹50 Card */}
            <button
              onClick={() => setSelectedUpiAmount({ inr: 50, coins: 4700 })}
              className="w-full glass-panel-card p-3 text-left relative overflow-hidden hover:border-[#00F5D4] transition-all active:scale-[0.98] group border-teal-400/25"
            >
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black font-mono text-white glow-text-teal">₹50</span>
                <span className="text-[10px] font-mono text-slate-400">4,700 Coins</span>
              </div>
              <div className="mt-2 flex items-center space-x-1 text-[9px] font-mono text-emerald-400">
                <CheckCircle2 size={11} className="text-[#10B981]" />
                <span>Live verification</span>
              </div>
              <div className="mt-1.5 inline-block text-[8px] font-mono px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-400/30">
                ESCROW_48HR
              </div>
            </button>
          </div>

          {/* Right Column: Digital Voucher Cards */}
          <div className="space-y-2.5">
            {vouchers.map((v) => {
              const isGPlay = v.brand === 'Google Play';
              const isSwiggy = v.brand === 'Swiggy';
              const isZomato = v.brand === 'Zomato';
              const isDecathlon = v.brand === 'Decathlon';

              return (
                <div
                  key={v.id}
                  className="glass-panel-card p-3 space-y-2 relative overflow-hidden border-teal-400/20 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {/* Brand Logo Icons */}
                      <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0">
                        {isGPlay && (
                          <div className="w-5 h-5 rounded bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-[#00F5D4]">
                            ▶
                          </div>
                        )}
                        {isSwiggy && (
                          <div className="w-5 h-5 rounded bg-orange-500/20 border border-orange-400/40 flex items-center justify-center text-[#FC8019]">
                            S
                          </div>
                        )}
                        {isZomato && (
                          <div className="w-5 h-5 rounded bg-red-500/20 border border-red-400/40 flex items-center justify-center text-[#E23744]">
                            Z
                          </div>
                        )}
                        {isDecathlon && (
                          <div className="w-5 h-5 rounded bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-[#0082C3]">
                            D
                          </div>
                        )}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate">{v.brand}</div>
                        <div className="text-[9px] font-mono text-emerald-400">₹{v.valueINR} Code</div>
                      </div>
                    </div>
                  </div>

                  {/* Stock Scarcity Progress Bar */}
                  <div>
                    <div className="flex justify-between text-[8px] font-mono text-slate-400 mb-0.5">
                      <span>Scarcity:</span>
                      <span className="text-teal-300 font-bold">{v.stockLeft} left today</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-500"
                        style={{ width: `${Math.min(100, (v.stockLeft / 4) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Redeem Button */}
                  <button
                    onClick={() => handleRedeemVoucher(v)}
                    disabled={wallet.verifiedPulseCoins < v.coinCost}
                    className="w-full py-1.5 px-2 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 border border-teal-400/30 text-[#00F5D4] font-bold text-[10px] font-mono flex items-center justify-center space-x-1 transition-all disabled:opacity-40"
                  >
                    <span>{v.coinCost}c</span>
                    <ArrowUpRight size={11} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Weekly Campus Challenge Card (Bottom Banner) */}
      <div className="glass-panel-card p-4 space-y-2.5 relative overflow-hidden border-teal-400/30 bg-gradient-to-r from-emerald-950/20 via-black/40 to-teal-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-[#00F5D4] shadow-glow-teal">
              <Trophy size={18} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white tracking-wide">Campus Challenge</span>
                <span className="text-[10px] font-mono font-bold text-[#00F5D4] bg-teal-950/50 px-1.5 py-0.5 rounded border border-teal-400/30">
                  Splitting ₹500
                </span>
              </div>
              <div className="text-[10px] text-slate-400">7-Day Verified Workout Streak Pool</div>
            </div>
          </div>

          <div className="flex items-center space-x-1 text-[10px] font-mono text-slate-400">
            <Users size={12} className="text-teal-400" />
            <span>142 Active</span>
          </div>
        </div>

        {/* User Streak Progress Indicator */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono">
            <span className="text-slate-300">Your Streak Progress:</span>
            <span className="text-emerald-400 font-bold">5/7 Days Completed (71%)</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 shadow-glow-mint"
              style={{ width: '71%' }}
            />
          </div>
        </div>

        <button
          onClick={() => {
            setStreakPoolJoined(true);
            confetti({ particleCount: 45, spread: 55, colors: ['#00F5D4', '#10B981'] });
          }}
          className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold tracking-wide transition-all ${
            streakPoolJoined
              ? 'bg-emerald-950/40 border border-emerald-400 text-emerald-300 shadow-glow-mint'
              : 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-glow-teal hover:opacity-95 active:scale-[0.98]'
          }`}
        >
          {streakPoolJoined ? '✓ Enrolled in Streak Pool (Day 5 Active)' : 'Opt In & Compete for ₹500 Pool'}
        </button>
      </div>

      {/* Withdraw to UPI Modal */}
      {selectedUpiAmount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl bg-[#0A1016] border border-teal-400/35 p-5 shadow-glow-teal text-white relative">
            <div className="flex items-center justify-between pb-3 border-b border-teal-400/20">
              <div className="flex items-center space-x-2">
                <Shield size={16} className="text-[#00F5D4]" />
                <span className="text-sm font-bold text-white">Withdraw to UPI</span>
              </div>
              <button
                onClick={() => {
                  setSelectedUpiAmount(null);
                  setUpiError(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpiSubmit} className="space-y-4 pt-3">
              <div className="p-3 rounded-xl bg-teal-950/25 border border-teal-400/25 flex justify-between items-center text-xs">
                <div>
                  <div className="text-slate-400">Cashout Value:</div>
                  <div className="text-xl font-black text-[#00F5D4] font-mono">₹{selectedUpiAmount.inr}.00</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400">Coin Deduction:</div>
                  <div className="text-xs font-mono font-bold text-white">{selectedUpiAmount.coins} PulseCoins</div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Enter your UPI ID (VPA):
                </label>
                <input
                  type="text"
                  placeholder="e.g. name@okaxis or user@okhdfcbank"
                  value={upiIdInput}
                  onChange={(e) => {
                    setUpiIdInput(e.target.value);
                    setUpiError(null);
                  }}
                  className="w-full bg-black/50 border border-teal-400/30 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-teal-400 shadow-inner"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Enforces regex verification: <code className="text-teal-300 text-[9px]">name@bank</code>
                </p>
              </div>

              {upiError && (
                <div className="text-xs text-red-400 bg-red-950/30 border border-red-500/30 p-2.5 rounded-lg leading-relaxed">
                  {upiError}
                </div>
              )}

              <div className="p-2 rounded-lg bg-black/40 border border-teal-400/10 text-[10px] text-slate-400 flex items-center space-x-1.5">
                <Info size={12} className="text-[#00F5D4] shrink-0" />
                <span>Orders undergo 48-Hour Escrow validation to prevent cadence spoofing.</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-xs tracking-wider uppercase shadow-glow-teal hover:opacity-95 transition-all active:scale-[0.98]"
              >
                Confirm &amp; Place in Escrow
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Unified Redemption Receipt Modal (UPI & Voucher) */}
      {receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl bg-[#0A1016] border border-emerald-400/40 p-5 shadow-glow-mint text-white relative">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-400/20">
              <div className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-[#10B981]" />
                <span className="text-sm font-bold text-white">Redemption Receipt</span>
              </div>
              <button
                onClick={() => setReceipt(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 pt-3 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-[#10B981]">
                <Sparkles size={24} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-white">{receipt.title}</h3>
                <div className="font-mono text-xs text-emerald-400 mt-0.5">{receipt.amountText}</div>
              </div>

              {/* Order ID & Status Box */}
              <div className="p-3 bg-black/50 border border-teal-400/25 rounded-xl text-left space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Order Reference:</span>
                  <span className="text-white font-bold">{receipt.orderId}</span>
                </div>
                {receipt.vpa && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Beneficiary UPI:</span>
                    <span className="text-teal-300 font-bold">{receipt.vpa}</span>
                  </div>
                )}
                <div className="pt-1 border-t border-teal-400/15">
                  <span className="text-slate-400 block text-[10px]">Queue Status:</span>
                  <span className="text-emerald-300 text-[10px] font-bold block">{receipt.statusText}</span>
                </div>
              </div>

              {/* 16-Digit PIN display if delivered */}
              {receipt.pin && (
                <div className="space-y-2">
                  <div className="p-3 bg-black/60 border border-[#00F5D4]/40 rounded-xl font-mono text-sm font-bold text-[#00F5D4] tracking-widest flex items-center justify-center">
                    {receipt.pin}
                  </div>
                  <button
                    onClick={() => copyToClipboard(receipt.pin!)}
                    className="w-full py-2 rounded-xl bg-teal-500/20 border border-teal-400/40 hover:bg-teal-500/30 text-[#00F5D4] font-bold text-xs flex items-center justify-center space-x-1.5 transition-all"
                  >
                    {copiedPin ? (
                      <>
                        <Check size={14} />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy 16-Digit Voucher PIN</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              <button
                onClick={() => setReceipt(null)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-glow-teal hover:opacity-95 transition-all"
              >
                Close &amp; View Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
