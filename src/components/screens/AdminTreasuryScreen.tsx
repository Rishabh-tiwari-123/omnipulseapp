import React, { useState } from 'react';
import { usePulse } from '../../context/PulseContext';
import { VoucherItem } from '../../types';
import {
  Lock,
  Wallet,
  CheckCircle2,
  XCircle,
  Plus,
  Key,
  FileText,
  PieChart,
  ChevronLeft,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminTreasuryScreen: React.FC = () => {
  const {
    adminTreasury,
    approvePayout,
    rejectFraudPayout,
    restockVoucherPins,
    vouchers,
    setActiveScreen,
  } = usePulse();

  const [selectedBrand, setSelectedBrand] = useState<VoucherItem['brand']>('Google Play');
  const [newPinsText, setNewPinsText] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPinsText.trim()) return;

    // Split by newlines or commas
    const pins = newPinsText
      .split(/[\n,]/)
      .map((p) => p.trim())
      .filter((p) => p.length > 5);

    if (pins.length === 0) return;

    restockVoucherPins(selectedBrand, pins);
    setActionNotice(`Added ${pins.length} new 16-digit PIN(s) to ${selectedBrand} vault! Store inventory replenished.`);
    setNewPinsText('');
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleQuickGenPins = () => {
    const brandPrefix =
      selectedBrand === 'Google Play'
        ? 'GP'
        : selectedBrand === 'Swiggy'
        ? 'SWIG'
        : selectedBrand === 'Zomato'
        ? 'ZOM'
        : 'DEC';
    const generated: string[] = [];
    for (let i = 0; i < 3; i++) {
      const r1 = Math.floor(1000 + Math.random() * 9000);
      const r2 = Math.floor(1000 + Math.random() * 9000);
      const r3 = Math.floor(1000 + Math.random() * 9000);
      generated.push(`${brandPrefix}-${r1}-${r2}-${r3}`);
    }
    setNewPinsText(generated.join('\n'));
  };

  const handleApprove = (orderId: string, amount: number) => {
    approvePayout(orderId);
    confetti({
      particleCount: 60,
      spread: 60,
      colors: ['#00F5D4', '#10B981'],
    });
    setActionNotice(`✓ Payout ${orderId} (₹${amount}) APPROVED & PAID from Dynamic Capital Pool.`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleReject = (orderId: string, trustScore: number) => {
    const reason = trustScore < 70 ? 'Low Trust Score / Rapid Cadence Jitter' : 'Sensor gait anomaly detected';
    rejectFraudPayout(orderId, reason);
    setActionNotice(`✕ Order ${orderId} REJECTED AS FRAUD: ${reason}.`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Top Header matching Blueprint: ≡ Admin Panel */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveScreen('workout')}
            className="p-1.5 rounded-lg bg-black/40 border border-teal-400/20 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">Admin Panel</h1>
            <p className="text-[11px] text-slate-400">Founder Treasury &amp; Dynamic Unit Economics</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-400/30 text-[10px] font-mono text-[#00F5D4] shadow-glow-teal">
          <Lock size={12} />
          <span>60/40 Split Active</span>
        </div>
      </div>

      {/* Floating Action Notice Toast */}
      {actionNotice && (
        <div className="glass-panel-card p-3 border-teal-400 text-xs text-white flex items-center justify-between shadow-glow-teal animate-fadeIn">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-white ml-2">✕</button>
        </div>
      )}

      {/* 1. Top Financial Telemetry Cards matching Blueprint */}
      <div className="grid grid-cols-3 gap-2">
        {/* CAPITAL POOL (60%) */}
        <div className="glass-panel-card p-3 space-y-1 relative overflow-hidden border-teal-400/35 shadow-glow-teal">
          <div className="text-[9px] uppercase font-bold tracking-wider text-teal-400">
            CAPITAL POOL:
          </div>
          <div className="text-xl font-black font-mono text-white glow-text-teal">
            ₹{adminTreasury.capitalPoolINR.toFixed(0)}
          </div>
          <div className="text-[8px] text-emerald-400 font-mono">
            60% Payout Reserve
          </div>
        </div>

        {/* Total AdMob Revenue */}
        <div className="glass-panel-card p-3 space-y-1 relative overflow-hidden border-teal-400/20">
          <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
            AdMob Rev:
          </div>
          <div className="text-xl font-black font-mono text-white">
            ₹{adminTreasury.adMobRevenueINR.toLocaleString()}
          </div>
          <div className="text-[8px] text-slate-400 font-mono">
            SSV Accrued
          </div>
        </div>

        {/* Target Pay Limit: 60% */}
        <div className="glass-panel-card p-3 space-y-1 relative overflow-hidden border-emerald-400/30 shadow-glow-mint">
          <div className="text-[9px] uppercase font-bold tracking-wider text-emerald-400">
            Target Pay Limit:
          </div>
          <div className="text-xl font-black font-mono text-emerald-300">
            60%
          </div>
          <div className="text-[8px] text-slate-400 font-mono">
            +40% Locked Profit
          </div>
        </div>
      </div>

      {/* Solvency Status Banner */}
      <div className="glass-panel p-2.5 flex items-center justify-between text-xs font-mono border-teal-400/25 bg-black/40">
        <div className="flex items-center space-x-1.5 text-slate-300">
          <PieChart size={13} className="text-[#00F5D4]" />
          <span>Net Founder Profit Margin:</span>
        </div>
        <div className="text-emerald-400 font-bold font-mono">
          ₹{adminTreasury.founderProfitINR.toFixed(2)} (40% Locked)
        </div>
      </div>

      {/* 2. "Pending Payout Approval" Table matching Blueprint */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-teal-400/90">
            <Wallet size={13} />
            <span>Pending Payout Approval</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {adminTreasury.pendingPayoutQueue.filter((p) => p.status === 'ESCROW_48HR').length} Pending Review
          </span>
        </div>

        {/* Table Header Bar */}
        <div className="p-2 bg-black/50 rounded-xl border border-teal-400/15 grid grid-cols-12 text-[10px] font-mono text-slate-400 font-semibold px-3">
          <div className="col-span-3">User ID</div>
          <div className="col-span-5">VPA (UPI ID)</div>
          <div className="col-span-4 text-right">Trust Score</div>
        </div>

        {/* Table Rows */}
        <div className="space-y-2">
          {adminTreasury.pendingPayoutQueue.map((order) => {
            const isEscrow = order.status === 'ESCROW_48HR';
            const isApproved = order.status === 'APPROVED_PAID';
            const isRejected = order.status === 'REJECTED_FRAUD';

            return (
              <div
                key={order.id}
                className={`p-3 rounded-2xl border text-xs space-y-2.5 transition-all ${
                  isRejected
                    ? 'glass-panel-coral border-[#F43F5E]/40'
                    : isApproved
                    ? 'glass-panel border-emerald-400/30 bg-emerald-950/20'
                    : 'glass-panel-card border-teal-400/20'
                }`}
              >
                {/* Row Data matching Blueprint */}
                <div className="grid grid-cols-12 items-center font-mono">
                  {/* User ID */}
                  <div className="col-span-3 truncate">
                    <span className="text-white font-bold">{order.userId.replace('USR-', '')}</span>
                    <div className="text-[9px] text-slate-500">{order.id}</div>
                  </div>

                  {/* VPA (UPI ID) */}
                  <div className="col-span-5 truncate text-teal-300 text-[11px]">
                    <span className="truncate block" title={order.vpa}>{order.vpa}</span>
                    <span className="text-[9px] text-slate-400">₹{order.amountINR} ({order.coinsDeducted}c)</span>
                  </div>

                  {/* Anti-Cheat Trust Score */}
                  <div className="col-span-4 text-right">
                    <span
                      className={`font-black text-xs ${
                        order.trustScore >= 90
                          ? 'text-emerald-400'
                          : order.trustScore >= 70
                          ? 'text-yellow-400'
                          : 'text-[#F43F5E]'
                      }`}
                    >
                      {order.trustScore}%
                    </span>
                    <div className="text-[8px] text-slate-500">
                      {order.adsVerifiedCount} Ads Verified
                    </div>
                  </div>
                </div>

                {/* Working Action Buttons matching Blueprint: [APPROVE & PAY] and [REJECT FRAUD] */}
                {isEscrow ? (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-teal-400/10">
                    {/* [APPROVE & PAY] with Emerald outline */}
                    <button
                      onClick={() => handleApprove(order.id, order.amountINR)}
                      className="py-2 px-3 rounded-xl border-2 border-[#10B981] bg-[#10B981]/15 hover:bg-[#10B981]/25 text-[#10B981] font-bold font-mono text-[11px] flex items-center justify-center space-x-1 transition-all active:scale-[0.98] shadow-glow-mint"
                    >
                      <CheckCircle2 size={13} />
                      <span>[APPROVE &amp; PAY]</span>
                    </button>

                    {/* [REJECT FRAUD] with Coral Red outline */}
                    <button
                      onClick={() => handleReject(order.id, order.trustScore)}
                      className="py-2 px-3 rounded-xl border-2 border-[#F43F5E] bg-[#F43F5E]/15 hover:bg-[#F43F5E]/25 text-[#F43F5E] font-bold font-mono text-[11px] flex items-center justify-center space-x-1 transition-all active:scale-[0.98] shadow-glow-coral"
                    >
                      <XCircle size={13} />
                      <span>[REJECT FRAUD]</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-1.5 border-t border-teal-400/10 flex items-center justify-between text-[10px] font-mono">
                    <span className={isApproved ? 'text-emerald-400 font-bold' : 'text-[#F43F5E] font-bold'}>
                      Status: {order.status}
                    </span>
                    {order.note && (
                      <span className="text-slate-400 truncate max-w-[180px] text-[9px]">{order.note}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Voucher PIN Vault Manager */}
      <div className="glass-panel-card p-4 space-y-3 border-teal-400/25">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-teal-400">
            <Key size={14} />
            <span>Voucher PIN Vault Manager</span>
          </div>
          <button
            onClick={handleQuickGenPins}
            className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 underline"
          >
            + Auto-Gen 3 PINs
          </button>
        </div>

        <form onSubmit={handleRestockSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-medium mb-1">
                Select Brand:
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value as VoucherItem['brand'])}
                className="w-full bg-black/50 border border-teal-400/25 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-teal-400 font-mono"
              >
                <option value="Google Play">Google Play</option>
                <option value="Swiggy">Swiggy</option>
                <option value="Zomato">Zomato</option>
                <option value="Decathlon">Decathlon</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-medium mb-1">
                Current Inventory:
              </label>
              <div className="p-2 bg-black/50 rounded-xl border border-teal-400/15 font-mono font-bold text-teal-300 text-xs">
                {vouchers.find((v) => v.brand === selectedBrand)?.stockLeft || 0} Codes In Stock
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-medium mb-1">
              Paste 16-Digit Voucher PINs (one per line):
            </label>
            <textarea
              rows={2}
              placeholder="e.g. GP-8839-4412-9901"
              value={newPinsText}
              onChange={(e) => setNewPinsText(e.target.value)}
              className="w-full bg-black/50 border border-teal-400/20 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-teal-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-3 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 text-[#00F5D4] font-bold text-xs tracking-wide shadow-glow-teal flex items-center justify-center space-x-1.5 transition-all active:scale-[0.98]"
          >
            <Plus size={14} />
            <span>Restock PIN Vault into Store</span>
          </button>
        </form>
      </div>

      {/* Dynamic Treasury Audit Ledger Logs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-400/90 flex items-center space-x-1">
            <FileText size={13} />
            <span>Dynamic Treasury Audit Trail</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Immutable Log</span>
        </div>

        <div className="p-2.5 rounded-xl bg-black/40 border border-teal-400/15 max-h-36 overflow-y-auto space-y-1.5 font-mono text-[10px] scrollbar-none">
          {adminTreasury.treasuryLogs.map((log) => (
            <div key={log.id} className="p-1.5 rounded-lg bg-slate-900/70 border border-slate-800 text-slate-300">
              <div className="flex justify-between text-slate-400 text-[9px] mb-0.5">
                <span className="text-teal-400 font-bold">{log.type}</span>
                <span>{log.timestamp}</span>
              </div>
              <div>{log.description}</div>
              {log.amount && (
                <div className="text-right text-emerald-400 font-bold mt-0.5 font-mono">
                  {log.amount}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
