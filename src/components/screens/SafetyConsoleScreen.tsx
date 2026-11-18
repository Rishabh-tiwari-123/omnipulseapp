import React, { useState, useRef, useEffect } from 'react';
import { usePulse } from '../../context/PulseContext';
import {
  ShieldCheck,
  Droplet,
  Send,
  Bot,
  User,
  AlertTriangle,
  Activity,
  Info,
  Sparkles,
  X,
  Play,
  Heart,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AdMobModal } from '../AdMobModal';
import { askPulseAI, BiometricContext } from '../../services/pulseAiService';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  source?: string;
  recommendation?: string;
}

const PRESET_QUERIES = [
  "Analyze my post-workout meal",
  "Is my heart rate safe for HIIT?",
  "20-min hostel room workout",
];

export const SafetyConsoleScreen: React.FC = () => {
  const {
    activeWorkout,
    biometrics,
    wallet,
    consumeAiQuery,
    unlockAiQueriesWithAd,
    isHighCardiacStrain,
  } = usePulse();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: `Hello! I'm your Pulse-AI Biometric Concierge. Your current session has logged ${activeWorkout.activeCalories} kcal at ${activeWorkout.simulatedBpm} BPM. How can I optimize your recovery protocol today?`,
      timestamp: '9:41 AM',
      source: 'local-biometric-engine',
      recommendation: 'Replenish electrolytes & monitor cardiac rhythm',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [showFormulaTooltip, setShowFormulaTooltip] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(true);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Exact water replenishment formula requested:
  // Water_ml = Math.round((ActiveCalories * 1.2) + (DurationMinutes * 8))
  const durationMinutes = Math.floor(activeWorkout.durationSeconds / 60);
  const calculatedHydrationMl = Math.round(activeWorkout.activeCalories * 1.2 + durationMinutes * 8);

  // Display percentage toward daily hydration target (e.g. 500ml base workout replenisher)
  const hydrationTargetMl = 500;
  const hydrationPercent = Math.min(100, Math.round((calculatedHydrationMl / hydrationTargetMl) * 100));

  // Max HR and safe thresholds
  const maxHr = biometrics.maxHeartRate; // 220 - Age
  const highStrainThreshold = Math.round(maxHr * 0.85); // 85% of Max HR

  // Cardiac Safety Gauge Angle Math:
  // Map BPM range (60 BPM to 200 BPM) to angle range (-90 deg to +90 deg)
  const clampedBpm = Math.min(200, Math.max(60, activeWorkout.simulatedBpm));
  const bpmRatio = (clampedBpm - 60) / (200 - 60);
  const needleAngle = -90 + bpmRatio * 180;

  // Real-time Telemetry Area Chart points
  // X-axis intervals matching blueprint: 00h, 12h, 18h, 20h, 45h (scaled to session)
  const telemetryPoints = [
    { label: '00h', bpm: 72, cal: 15 },
    { label: '12h', bpm: 115, cal: 65 },
    { label: '18h', bpm: 142, cal: 130 },
    { label: '20h', bpm: 162, cal: 185 },
    { label: '45h', bpm: activeWorkout.simulatedBpm, cal: activeWorkout.activeCalories },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    // Check AdMob usage gate
    const hasCredit = consumeAiQuery();
    if (!hasCredit) {
      setIsAdModalOpen(true);
      return;
    }

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    const context: BiometricContext = {
      age: biometrics.age,
      weightKg: biometrics.weightKg,
      heightCm: biometrics.heightCm,
      maxHeartRate: biometrics.maxHeartRate,
      currentBpm: activeWorkout.simulatedBpm,
      activeCalories: activeWorkout.activeCalories,
      durationMinutes,
      exerciseType: activeWorkout.exerciseType,
      isHighStrain: isHighCardiacStrain,
      hydrationNeededMl: calculatedHydrationMl,
      fatBurnZoneLow: biometrics.fatBurnZoneLow,
      fatBurnZoneHigh: biometrics.fatBurnZoneHigh,
    };

    try {
      const response = await askPulseAI(query, context);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: response.source,
        recommendation: response.keyRecommendation,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Based on your ${activeWorkout.activeCalories} kcal burned and ${activeWorkout.simulatedBpm} BPM, consume ${calculatedHydrationMl}ml water and 25g protein within 45m.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'local-biometric-engine',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-400/30 flex items-center justify-center text-[#00F5D4]">
            <Activity size={18} />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">Health Screen</h1>
            <p className="text-[11px] text-slate-400">AI Biometrics &amp; Safety Console</p>
          </div>
        </div>

        {/* Glowing Sensor Verified Badge */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-[10px] font-mono text-[#10B981] shadow-glow-mint">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
          <ShieldCheck size={12} className="text-[#10B981]" />
          <span className="font-bold">Sensor Verified</span>
        </div>
      </div>

      {/* Animated Coral Red High Cardiac Strain Alert Banner (>85% Max HR) */}
      {isHighCardiacStrain && (
        <div className="glass-panel-coral p-3 text-xs flex items-center space-x-2.5 animate-bounce shadow-glow-coral">
          <div className="w-7 h-7 rounded-full bg-red-500/20 border border-[#F43F5E] flex items-center justify-center text-[#F43F5E] shrink-0">
            <AlertTriangle size={16} className="animate-pulse" />
          </div>
          <div className="text-slate-100 flex-1">
            <div className="font-bold text-[#F43F5E] flex items-center space-x-1">
              <span>HIGH CARDIAC STRAIN / OVERTRAINING WARNING</span>
            </div>
            <div className="text-[11px] text-slate-200 mt-0.5 leading-tight">
              Heart Rate is <span className="font-mono font-bold text-white">{activeWorkout.simulatedBpm} BPM</span> (exceeds 85% limit of {highStrainThreshold} BPM for Age {biometrics.age}). Reduce workout tempo immediately!
            </div>
          </div>
        </div>
      )}

      {/* 1. Cardiac Safety Gauge & Real-Time Telemetry Curve */}
      <div className="glass-panel-card p-4 relative overflow-hidden">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-400/90">
            Cardiac Safety Gauge
          </span>
          <div className="text-[10px] font-mono text-slate-400">
            Max HR: {maxHr} BPM
          </div>
        </div>

        {/* Semi-Circular SVG Gauge */}
        <div className="relative w-64 h-32 mx-auto mt-2">
          <svg viewBox="0 0 220 120" className="w-full h-full overflow-visible">
            <defs>
              <filter id="glowTeal" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#00F5D4" floodOpacity="0.6" />
              </filter>
              <filter id="glowEmerald" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#10B981" floodOpacity="0.6" />
              </filter>
              <filter id="glowCoral" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#F43F5E" floodOpacity="0.8" />
              </filter>
            </defs>

            {/* Background Base Arc */}
            <path
              d="M 20 110 A 90 90 0 0 1 200 110"
              fill="none"
              stroke="#131e29"
              strokeWidth="14"
              strokeLinecap="round"
            />

            {/* Zone 1: Warm-up (Teal #00F5D4) 60-120 BPM */}
            <path
              d="M 20 110 A 90 90 0 0 1 72 42"
              fill="none"
              stroke="#00F5D4"
              strokeWidth="14"
              strokeLinecap="round"
              filter="url(#glowTeal)"
            />

            {/* Zone 2: Active Fat-Burn/Cardio (Emerald #10B981) 120-168 BPM */}
            <path
              d="M 78 37 A 90 90 0 0 1 148 37"
              fill="none"
              stroke="#10B981"
              strokeWidth="14"
              strokeLinecap="round"
              filter="url(#glowEmerald)"
            />

            {/* Zone 3: Redline Strain (Coral Red #F43F5E) >168 BPM */}
            <path
              d="M 154 42 A 90 90 0 0 1 200 110"
              fill="none"
              stroke="#F43F5E"
              strokeWidth="14"
              strokeLinecap="round"
              filter="url(#glowCoral)"
            />

            {/* Center Dynamic Needle */}
            <g transform={`translate(110, 110) rotate(${needleAngle})`}>
              <polygon
                points="-3.5,0 3.5,0 0,-82"
                fill={isHighCardiacStrain ? '#F43F5E' : '#00F5D4'}
                className="transition-transform duration-500 ease-out filter drop-shadow-[0_0_6px_#00F5D4]"
              />
              <circle cx="0" cy="0" r="7" fill="#ffffff" />
              <circle cx="0" cy="0" r="3" fill="#070B10" />
            </g>
          </svg>
        </div>

        {/* Zone Labels with current ratio indicator */}
        <div className="flex justify-between px-3 text-[10px] font-mono mt-1">
          <div className="flex items-center space-x-1 text-[#00F5D4]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4]" />
            <span>Warm-up</span>
          </div>
          <div className="flex items-center space-x-1 text-[#10B981]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span>Active</span>
          </div>
          <div className="flex items-center space-x-1 text-[#F43F5E]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F43F5E]" />
            <span>Redline</span>
          </div>
        </div>

        {/* Real-Time SVG Telemetry Area/Line Chart */}
        <div className="mt-4 pt-3 border-t border-teal-400/15">
          <div className="flex justify-between items-center text-[11px] mb-2">
            <span className="text-slate-300 font-medium flex items-center space-x-1.5">
              <Heart size={12} className={isHighCardiacStrain ? 'text-[#F43F5E] animate-ping' : 'text-[#00F5D4]'} />
              <span>Cardiac Telemetry Curve</span>
            </span>
            <div className="font-mono text-xs">
              <span className={`font-bold ${isHighCardiacStrain ? 'text-[#F43F5E]' : 'text-[#00F5D4]'}`}>
                {activeWorkout.simulatedBpm} BPM
              </span>
              <span className="text-slate-500 text-[10px] ml-1">/ {activeWorkout.activeCalories} kcal</span>
            </div>
          </div>

          {/* Telemetry Chart Grid */}
          <div className="flex items-stretch space-x-2">
            {/* Y-Axis Labels matching blueprint: 150, 90, 60, 30, 0 */}
            <div className="flex flex-col justify-between text-[9px] font-mono text-slate-500 select-none pr-1">
              <span>150</span>
              <span>90</span>
              <span>60</span>
              <span>30</span>
              <span>0</span>
            </div>

            {/* SVG Chart Area */}
            <div className="flex-1 h-24 relative">
              <svg viewBox="0 0 240 80" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00F5D4" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#00F5D4" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#00F5D4" />
                    <stop offset="70%" stopColor="#10B981" />
                    <stop offset="100%" stopColor={isHighCardiacStrain ? '#F43F5E' : '#00F5D4'} />
                  </linearGradient>
                </defs>

                {/* Horizontal grid lines */}
                <line x1="0" y1="0" x2="240" y2="0" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="0" y1="20" x2="240" y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="0" y1="40" x2="240" y2="40" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="0" y1="60" x2="240" y2="60" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />

                {/* Gradient Area Fill */}
                <path
                  d="M 10 58 Q 50 48, 80 40 T 140 24 T 190 18 T 235 12 L 235 75 L 10 75 Z"
                  fill="url(#areaGrad)"
                />

                {/* Main Curve Stroke */}
                <path
                  d="M 10 58 Q 50 48, 80 40 T 140 24 T 190 18 T 235 12"
                  fill="none"
                  stroke="url(#lineGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="filter drop-shadow-[0_0_6px_rgba(0,245,212,0.5)]"
                />

                {/* Glowing Nodes */}
                <circle cx="10" cy="58" r="3" fill="#00F5D4" />
                <circle cx="80" cy="40" r="3" fill="#00F5D4" />
                <circle cx="140" cy="24" r="3" fill="#10B981" />
                <circle cx="190" cy="18" r="3" fill="#10B981" />
                <circle
                  cx="235"
                  cy="12"
                  r="4.5"
                  fill={isHighCardiacStrain ? '#F43F5E' : '#00F5D4'}
                  className="animate-ping"
                />
                <circle
                  cx="235"
                  cy="12"
                  r="3.5"
                  fill="#ffffff"
                />
              </svg>
            </div>
          </div>

          {/* X-Axis Labels matching blueprint: 00h, 12h, 18h, 20h, 45h */}
          <div className="flex justify-between pl-6 text-[9px] font-mono text-slate-500 mt-1">
            {telemetryPoints.map((p, idx) => (
              <span key={idx} className={idx === telemetryPoints.length - 1 ? 'text-teal-300 font-bold' : ''}>
                {p.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Smart Hydration & Recovery Calculator */}
      <div className="glass-panel-card p-4 space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-teal-400/90">
            <Droplet size={14} className="text-[#00F5D4]" />
            <span>Smart Hydration Calculator</span>
          </div>
          <button
            onClick={() => setShowFormulaTooltip(!showFormulaTooltip)}
            className="text-slate-400 hover:text-[#00F5D4] transition-colors p-1"
            title="Formula Info"
          >
            <Info size={14} />
          </button>
        </div>

        {/* Sweat Loss Formula Tooltip */}
        {showFormulaTooltip && (
          <div className="p-2.5 rounded-xl bg-teal-950/40 border border-teal-400/30 text-[11px] text-slate-200 space-y-1 animate-fadeIn">
            <div className="flex items-center justify-between text-[#00F5D4] font-bold">
              <span>Sweat Loss Science Formula:</span>
              <button onClick={() => setShowFormulaTooltip(false)}>
                <X size={12} />
              </button>
            </div>
            <div className="font-mono text-[10px] text-emerald-300">
              Water_ml = Math.round((ActiveCalories × 1.2) + (DurationMinutes × 8))
            </div>
            <p className="text-[10px] text-slate-400">
              Accounts for thermal sweat evaporative volume (1.2ml per kcal) plus baseline respiratory metabolic moisture expenditure (8ml per active minute).
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="space-y-1">
            <div className="text-[11px] text-slate-300">
              Replenishment Target:
            </div>
            <div className="text-xl font-black font-mono text-white">
              <span className="text-[#00F5D4] glow-text-teal">{calculatedHydrationMl}ml</span> Needed
            </div>
            <div className="text-[10px] text-teal-400/80 font-mono">
              ({activeWorkout.activeCalories} kcal × 1.2) + ({durationMinutes}m × 8)
            </div>
          </div>

          {/* Glowing Circular Droplet Hydration Ring */}
          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            <svg className="w-18 h-18 transform -rotate-90">
              <circle
                cx="36"
                cy="36"
                r="28"
                stroke="#131e29"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="36"
                cy="36"
                r="28"
                stroke="#00F5D4"
                strokeWidth="7"
                strokeDasharray={175}
                strokeDashoffset={175 - (hydrationPercent / 100) * 175}
                strokeLinecap="round"
                fill="transparent"
                className="drop-shadow-[0_0_10px_rgba(0,245,212,0.45)] transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
              <Droplet size={14} className="text-[#00F5D4] mb-0.5 fill-current" />
              <span className="text-xs font-bold text-white">{hydrationPercent}%</span>
              <span className="text-[7px] text-teal-300 font-bold uppercase tracking-wider">Target</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Pulse-AI Health Chat Concierge */}
      <div className="glass-panel-card p-4 space-y-3 relative overflow-hidden">
        {/* Header with expand/collapse and AdMob usage gate */}
        <div className="flex items-center justify-between pb-2 border-b border-teal-400/15">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-[#00F5D4]">
              <Bot size={14} />
            </div>
            <div>
              <span className="text-xs font-bold text-white tracking-wide">Pulse-AI Chat Prompt</span>
              <p className="text-[10px] text-slate-400">Need post-workout meal tip?</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* AdMob Gated Usage Counter */}
            <div className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/15 border border-teal-400/30 text-[#00F5D4]">
              {wallet.freeAiQueriesLeft} Free Left
            </div>
            <button
              onClick={() => setIsChatExpanded(!isChatExpanded)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {isChatExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {isChatExpanded && (
          <>
            {/* Quick-Prompt Clickable Chips */}
            <div className="flex flex-wrap gap-1.5">
              {PRESET_QUERIES.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-black/40 border border-teal-400/20 text-slate-300 hover:text-[#00F5D4] hover:border-teal-400/50 transition-all active:scale-[0.98]"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Chat Messages Stream */}
            <div className="h-52 overflow-y-auto space-y-2.5 pr-1 p-2 bg-black/30 rounded-xl border border-teal-400/10 text-xs scrollbar-none">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-start space-x-2 ${
                    m.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {m.sender === 'ai' && (
                    <div className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-[#00F5D4] shrink-0 mt-0.5">
                      <Bot size={12} />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] p-2.5 rounded-xl text-[11px] leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-teal-500/20 border border-teal-400/30 text-white rounded-tr-none'
                        : 'bg-slate-900/90 border border-slate-700/60 text-slate-200 rounded-tl-none space-y-1'
                    }`}
                  >
                    <div>{m.text}</div>

                    {/* AI Recommendation Pill */}
                    {m.recommendation && (
                      <div className="mt-1 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-400/30 text-[9px] font-mono text-[#10B981] flex items-center space-x-1">
                        <Sparkles size={9} />
                        <span>Rec: {m.recommendation}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[8px] text-slate-400 mt-1 font-mono pt-0.5">
                      {m.source && (
                        <span className="text-teal-400/80">
                          {m.source.startsWith('gemini') ? m.source.replace('gemini-', 'Gemini ').replace('-', ' ').toUpperCase() : 'Biometric Engine'}
                        </span>
                      )}
                      <span>{m.timestamp}</span>
                    </div>
                  </div>

                  {m.sender === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-[#10B981] shrink-0 mt-0.5">
                      <User size={12} />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center space-x-2 text-[10px] text-teal-400 font-mono animate-pulse p-1">
                  <Bot size={12} />
                  <span>Pulse-AI analyzing live telemetry &amp; biometrics...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* AdMob Gated Banner when free queries hit 0 */}
            {wallet.freeAiQueriesLeft <= 0 && (
              <div className="p-2.5 rounded-xl bg-teal-950/30 border border-teal-400/30 flex items-center justify-between text-xs animate-fadeIn">
                <div className="text-[11px] text-slate-300">
                  <span className="font-bold text-white">Daily limit reached.</span> Watch a 15s Rewarded Ad to unlock 3 more queries.
                </div>
                <button
                  onClick={() => setIsAdModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-[10px] shadow-glow-teal flex items-center space-x-1 shrink-0 ml-2 hover:opacity-90 transition-all"
                >
                  <Play size={10} className="fill-current" />
                  <span>Watch Ad (+3)</span>
                </button>
              </div>
            )}

            {/* Chat Input Field */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder={
                  wallet.freeAiQueriesLeft > 0
                    ? "Ask Pulse-AI about recovery, diet, strain..."
                    : "Unlock with 15s Ad above..."
                }
                disabled={wallet.freeAiQueriesLeft <= 0}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-black/40 border border-teal-400/20 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400/60"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={wallet.freeAiQueriesLeft <= 0 || !inputMessage.trim()}
                className="p-2 rounded-xl bg-[#00F5D4] text-slate-950 font-bold hover:bg-teal-300 disabled:opacity-40 transition-colors shadow-glow-teal"
              >
                <Send size={15} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* AdMob Rewarded Video Modal for unlocking queries */}
      <AdMobModal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
        onComplete={() => {
          unlockAiQueriesWithAd();
          return {
            success: true,
            coinsAwarded: 0,
            transactionId: `AI-${Date.now().toString(36).toUpperCase()}`,
            message: "Unlocked 3 Free AI Consultations!",
          };
        }}
        title="AdMob Video: Unlock AI Queries"
        rewardText="+3 Free Pulse-AI Consultations"
      />
    </div>
  );
};
