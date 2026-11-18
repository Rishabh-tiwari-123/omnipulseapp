import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import {
  ScreenId,
  ExerciseType,
  UserBiometrics,
  WalletState,
  ActiveWorkoutState,
  PendingReferral,
  LeaderboardUser,
  VoucherItem,
  AdminTreasury,
  TelemetryPoint,
  PayoutOrderItem,
} from '../types';

interface PulseContextType {
  activeScreen: ScreenId;
  setActiveScreen: (screen: ScreenId) => void;
  biometrics: UserBiometrics;
  updateBiometrics: (updates: Partial<UserBiometrics>) => void;
  toggleHealthConnect: () => void;
  toggleCadenceSensor: () => void;
  wallet: WalletState;
  activeWorkout: ActiveWorkoutState;
  setExerciseType: (type: ExerciseType) => void;
  toggleWorkout: () => void;
  updateSimulatedBpm: (bpm: number) => void;
  updateCadence: (intensity: number, stdDev: number) => void;
  setRecordingMethod: (method: 'RECORDING_METHOD_SENSOR_HEART_RATE' | 'RECORDING_METHOD_MANUAL_ENTRY') => void;
  completeAdMobRewardedBoost: () => { success: boolean; coinsAwarded: number; transactionId: string; message: string };
  consumeAiQuery: () => boolean;
  unlockAiQueriesWithAd: () => void;
  pendingReferrals: PendingReferral[];
  campusLeaderboard: LeaderboardUser[];
  simulateFriendProgress: (referralId: string) => void;
  vouchers: VoucherItem[];
  redeemVoucher: (voucherId: string) => { success: boolean; pin?: string; inEscrow?: boolean; orderId?: string; error?: string };
  adminTreasury: AdminTreasury;
  requestUpiWithdrawal: (vpa: string, amountINR: number, coinCost: number) => { success: boolean; orderId?: string; error?: string };
  approvePayout: (orderId: string) => void;
  rejectFraudPayout: (orderId: string, reason: string) => void;
  restockVoucherPins: (brand: VoucherItem['brand'], pins: string[]) => void;
  isHighCardiacStrain: boolean;
  hydrationNeededMl: number;
  antiCheatWarning: string | null;
  clearAntiCheatWarning: () => void;
}

const SEED_STORAGE_KEY = 'omnipulse_v5_state';

const INITIAL_BIOMETRICS: UserBiometrics = {
  age: 22,
  weightKg: 68,
  heightCm: 175,
  maxHeartRate: 198, // 220 - 22
  targetSafeHeartRate: 130,
  fatBurnZoneLow: 119, // 60%
  fatBurnZoneHigh: 139, // 70%
  permissionsConfigured: true,
  healthConnectEnabled: true,
  cadenceSensorEnabled: true,
};

const INITIAL_WALLET: WalletState = {
  verifiedPulseCoins: 1420,
  sweatXp: 3450,
  streakDays: 5,
  dailyCoinsMintedToday: 15,
  dailyCoinCap: 35,
  freeAiQueriesLeft: 2,
  streakMultiplier: 1.2,
};

const INITIAL_TELEMETRY: TelemetryPoint[] = [
  { timestamp: '00m', bpm: 78, calories: 12 },
  { timestamp: '05m', bpm: 112, calories: 45 },
  { timestamp: '10m', bpm: 138, calories: 88 },
  { timestamp: '15m', bpm: 154, calories: 132 },
  { timestamp: '20m', bpm: 168, calories: 185 },
  { timestamp: '25m', bpm: 175, calories: 233 },
];

const INITIAL_WORKOUT: ActiveWorkoutState = {
  isActive: true,
  isPaused: false,
  exerciseType: 'Gym HIIT',
  durationSeconds: 1520, // ~25 min
  simulatedBpm: 175,
  cadenceIntensity: 165,
  cadenceStdDev: 3.2,
  recordingMethod: 'RECORDING_METHOD_SENSOR_HEART_RATE',
  activeCalories: 233,
  telemetryHistory: INITIAL_TELEMETRY,
  antiCheatStatus: 'VERIFIED',
  isTurboBoosted: false,
};

const INITIAL_REFERRALS: PendingReferral[] = [
  {
    id: 'ref-1',
    name: 'Sanjay Kumar',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    workoutsCompleted: 2,
    workoutsRequired: 3,
    adsWatched: 4,
    adsRequired: 5,
    status: 'pending',
  },
  {
    id: 'ref-2',
    name: 'Aarav Patel',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    workoutsCompleted: 2,
    workoutsRequired: 3,
    adsWatched: 3,
    adsRequired: 5,
    status: 'pending',
  },
  {
    id: 'ref-3',
    name: 'Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    workoutsCompleted: 1,
    workoutsRequired: 3,
    adsWatched: 2,
    adsRequired: 5,
    status: 'pending',
  },
];

const INITIAL_LEADERBOARD: LeaderboardUser[] = [
  {
    rank: 1,
    name: 'Aarn Caetan',
    hostel: 'Aryabhatta Block B',
    calories: 183580,
    sweatXp: 9240,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    isUser: false,
  },
  {
    rank: 2,
    name: 'Uoetal Sanjay',
    hostel: 'Kalam Hall',
    calories: 139336,
    sweatXp: 7850,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
    isUser: false,
  },
  {
    rank: 3,
    name: 'Seny Vki',
    hostel: 'Vidyasagar Tower',
    calories: 133985,
    sweatXp: 7120,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    isUser: false,
  },
  {
    rank: 4,
    name: 'Rishabh Tiwari (You)',
    hostel: 'Tagore Block A',
    calories: 115316,
    sweatXp: 3450,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    isUser: true,
  },
];

const INITIAL_VOUCHERS: VoucherItem[] = [
  {
    id: 'v-gplay-10',
    brand: 'Google Play',
    title: 'Google Play ₹10 Code',
    valueINR: 10,
    coinCost: 1000,
    stockLeft: 4,
    brandColor: '#00F5D4',
    pinVault: ['GP-8839-4412-9901', 'GP-7721-3390-1124', 'GP-9901-2245-7763', 'GP-4421-9981-0021'],
  },
  {
    id: 'v-swiggy-25',
    brand: 'Swiggy',
    title: 'Swiggy ₹25 Food Pass',
    valueINR: 25,
    coinCost: 2400,
    stockLeft: 2,
    brandColor: '#FC8019',
    pinVault: ['SWIG-7712-4491-0023', 'SWIG-9982-1134-5561'],
  },
  {
    id: 'v-zomato-25',
    brand: 'Zomato',
    title: 'Zomato ₹25 Meal Drop',
    valueINR: 25,
    coinCost: 2400,
    stockLeft: 2,
    brandColor: '#E23744',
    pinVault: ['ZOM-5512-8891-3324', 'ZOM-6632-1109-7782'],
  },
  {
    id: 'v-decathlon-50',
    brand: 'Decathlon',
    title: 'Decathlon ₹50 Gear Pass',
    valueINR: 50,
    coinCost: 4700,
    stockLeft: 3,
    brandColor: '#0082C3',
    pinVault: ['DEC-1122-3344-5566', 'DEC-7788-9900-1122', 'DEC-3344-5566-7788'],
  },
];

const INITIAL_TREASURY: AdminTreasury = {
  adMobRevenueINR: 1200,
  capitalPoolINR: 720, // 60%
  founderProfitINR: 480, // 40%
  targetPayLimitPercent: 60,
  pendingPayoutQueue: [
    {
      id: 'ORD-3552336',
      userId: 'USR-3552336',
      vpa: 'vionc@admint.com',
      amountINR: 10,
      coinsDeducted: 1000,
      trustScore: 100,
      adsVerifiedCount: 6,
      status: 'ESCROW_48HR',
      requestedAt: '2026-11-03 10:15 AM',
    },
    {
      id: 'ORD-3552334',
      userId: 'USR-3552334',
      vpa: 'omaith@gpldi.com',
      amountINR: 25,
      coinsDeducted: 2400,
      trustScore: 92,
      adsVerifiedCount: 4,
      status: 'ESCROW_48HR',
      requestedAt: '2026-11-03 11:42 AM',
    },
    {
      id: 'ORD-3552338',
      userId: 'USR-3552338',
      vpa: 'sorli@admint.com',
      amountINR: 50,
      coinsDeducted: 4700,
      trustScore: 60,
      adsVerifiedCount: 2,
      status: 'ESCROW_48HR',
      requestedAt: '2026-11-03 01:05 PM',
    },
  ],
  treasuryLogs: [
    {
      id: 'log-1',
      timestamp: '11:45 AM',
      type: 'AD_SSV_MINT',
      description: 'AdMob Rewarded Video SSV signature verified (Hash: #c4f9...8a12). Minted +20 Verified PulseCoins.',
      amount: '+20 Coins',
    },
    {
      id: 'log-2',
      timestamp: '12:10 PM',
      type: 'PAYOUT_REQUEST',
      description: 'UPI Escrow Order ORD-3552334 queued for ₹25 with 92% Anti-Cheat Trust Score.',
      amount: '₹25.00',
    },
    {
      id: 'log-3',
      timestamp: '01:05 PM',
      type: 'PAYOUT_REQUEST',
      description: 'UPI Escrow Order ORD-3552338 queued for ₹50 with 60% Trust Score (Flags: Rapid Cadence Jitter).',
      amount: '₹50.00',
    },
  ],
};

const PulseContext = createContext<PulseContextType | undefined>(undefined);

export const PulseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved state or use initial seed
  const [activeScreen, setActiveScreen] = useState<ScreenId>('workout');
  const [biometrics, setBiometrics] = useState<UserBiometrics>(() => {
    const saved = localStorage.getItem(`${SEED_STORAGE_KEY}_biometrics`);
    return saved ? JSON.parse(saved) : INITIAL_BIOMETRICS;
  });

  const [wallet, setWallet] = useState<WalletState>(() => {
    const saved = localStorage.getItem(`${SEED_STORAGE_KEY}_wallet`);
    return saved ? JSON.parse(saved) : INITIAL_WALLET;
  });

  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkoutState>(() => {
    const saved = localStorage.getItem(`${SEED_STORAGE_KEY}_workout`);
    return saved ? JSON.parse(saved) : INITIAL_WORKOUT;
  });

  const [pendingReferrals, setPendingReferrals] = useState<PendingReferral[]>(() => {
    const saved = localStorage.getItem(`${SEED_STORAGE_KEY}_referrals`);
    return saved ? JSON.parse(saved) : INITIAL_REFERRALS;
  });

  const [campusLeaderboard] = useState<LeaderboardUser[]>(INITIAL_LEADERBOARD);

  const [vouchers, setVouchers] = useState<VoucherItem[]>(() => {
    const saved = localStorage.getItem(`${SEED_STORAGE_KEY}_vouchers`);
    return saved ? JSON.parse(saved) : INITIAL_VOUCHERS;
  });

  const [adminTreasury, setAdminTreasury] = useState<AdminTreasury>(() => {
    const saved = localStorage.getItem(`${SEED_STORAGE_KEY}_treasury`);
    return saved ? JSON.parse(saved) : INITIAL_TREASURY;
  });

  const [antiCheatWarning, setAntiCheatWarning] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${SEED_STORAGE_KEY}_biometrics`, JSON.stringify(biometrics));
  }, [biometrics]);

  useEffect(() => {
    localStorage.setItem(`${SEED_STORAGE_KEY}_wallet`, JSON.stringify(wallet));
  }, [wallet]);

  useEffect(() => {
    localStorage.setItem(`${SEED_STORAGE_KEY}_workout`, JSON.stringify(activeWorkout));
  }, [activeWorkout]);

  useEffect(() => {
    localStorage.setItem(`${SEED_STORAGE_KEY}_referrals`, JSON.stringify(pendingReferrals));
  }, [pendingReferrals]);

  useEffect(() => {
    localStorage.setItem(`${SEED_STORAGE_KEY}_vouchers`, JSON.stringify(vouchers));
  }, [vouchers]);

  useEffect(() => {
    localStorage.setItem(`${SEED_STORAGE_KEY}_treasury`, JSON.stringify(adminTreasury));
  }, [adminTreasury]);

  // Sync initial backend state on mount
  useEffect(() => {
    apiClient.fetchTreasuryOverview().then((res) => {
      if (res && res.success && res.treasury) {
        setAdminTreasury((prev) => ({
          ...prev,
          adMobRevenueINR: res.treasury.adMobRevenueINR ?? prev.adMobRevenueINR,
          capitalPoolINR: res.treasury.capitalPoolINR ?? prev.capitalPoolINR,
          founderProfitINR: res.treasury.founderProfitINR ?? prev.founderProfitINR,
          targetPayLimitPercent: res.treasury.targetPayLimitPercent ?? prev.targetPayLimitPercent,
        }));
      }
    }).catch(() => {});
  }, []);

  // Workout live timer effect
  useEffect(() => {
    let interval: any;
    if (activeWorkout.isActive && !activeWorkout.isPaused) {
      interval = setInterval(() => {
        setActiveWorkout((prev) => {
          const newDuration = prev.durationSeconds + 1;
          // Calorie burn increment based on active session
          const newCalories = Math.round(prev.activeCalories + (newDuration % 3 === 0 ? 1 : 0));

          // Every 30 seconds add telemetry point
          let newTelemetry = prev.telemetryHistory;
          if (newDuration % 30 === 0) {
            const minStr = `${Math.floor(newDuration / 60)}m`;
            newTelemetry = [...prev.telemetryHistory.slice(-10), { timestamp: minStr, bpm: prev.simulatedBpm, calories: newCalories }];
          }

          return {
            ...prev,
            durationSeconds: newDuration,
            activeCalories: newCalories,
            telemetryHistory: newTelemetry,
          };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeWorkout.isActive, activeWorkout.isPaused, biometrics.weightKg]);

  // High cardiac strain calculation (>85% Max HR)
  const isHighCardiacStrain = activeWorkout.simulatedBpm > biometrics.maxHeartRate * 0.85;

  // Hydration calculator formula: Math.round((ActiveCalories * 1.2) + (DurationMinutes * 8))
  const durationMinutes = Math.floor(activeWorkout.durationSeconds / 60);
  const hydrationNeededMl = Math.round(activeWorkout.activeCalories * 1.2 + durationMinutes * 8);

  const updateBiometrics = (updates: Partial<UserBiometrics>) => {
    setBiometrics((prev) => {
      const nextAge = updates.age !== undefined ? updates.age : prev.age;
      const maxHeartRate = 220 - nextAge;
      return {
        ...prev,
        ...updates,
        maxHeartRate,
        fatBurnZoneLow: Math.round(maxHeartRate * 0.6),
        fatBurnZoneHigh: Math.round(maxHeartRate * 0.7),
        targetSafeHeartRate: updates.targetSafeHeartRate || prev.targetSafeHeartRate,
      };
    });
  };

  const toggleHealthConnect = () => {
    setBiometrics((prev) => ({
      ...prev,
      healthConnectEnabled: !prev.healthConnectEnabled,
      permissionsConfigured: !prev.healthConnectEnabled && prev.cadenceSensorEnabled,
    }));
  };

  const toggleCadenceSensor = () => {
    setBiometrics((prev) => ({
      ...prev,
      cadenceSensorEnabled: !prev.cadenceSensorEnabled,
      permissionsConfigured: prev.healthConnectEnabled && !prev.cadenceSensorEnabled,
    }));
  };

  const setExerciseType = (type: ExerciseType) => {
    setActiveWorkout((prev) => ({
      ...prev,
      exerciseType: type,
    }));
  };

  const toggleWorkout = () => {
    setActiveWorkout((prev) => ({
      ...prev,
      isActive: true,
      isPaused: !prev.isPaused,
    }));
  };

  const updateSimulatedBpm = (bpm: number) => {
    setActiveWorkout((prev) => ({
      ...prev,
      simulatedBpm: bpm,
    }));
  };

  const updateCadence = (intensity: number, stdDev: number) => {
    setActiveWorkout((prev) => {
      let antiCheatStatus = prev.antiCheatStatus;
      if (stdDev < 1.5) {
        antiCheatStatus = 'FLAGGED_SHAKER';
      } else if (prev.recordingMethod === 'RECORDING_METHOD_MANUAL_ENTRY') {
        antiCheatStatus = 'FLAGGED_MANUAL';
      } else {
        antiCheatStatus = 'VERIFIED';
      }
      return {
        ...prev,
        cadenceIntensity: intensity,
        cadenceStdDev: stdDev,
        antiCheatStatus,
      };
    });
  };

  const setRecordingMethod = (method: 'RECORDING_METHOD_SENSOR_HEART_RATE' | 'RECORDING_METHOD_MANUAL_ENTRY') => {
    setActiveWorkout((prev) => ({
      ...prev,
      recordingMethod: method,
      antiCheatStatus: method === 'RECORDING_METHOD_MANUAL_ENTRY' ? 'FLAGGED_MANUAL' : (prev.cadenceStdDev < 1.5 ? 'FLAGGED_SHAKER' : 'VERIFIED'),
    }));
  };

  // Anti-Cheat validation check
  const antiCheatTriggerCheck = () => {
    if (activeWorkout.recordingMethod === 'RECORDING_METHOD_MANUAL_ENTRY') {
      return { passed: false, reason: 'REJECTED: Manual entry workouts cannot mint Verified PulseCoins. Switch to Sensor Verified mode.' };
    }
    if (activeWorkout.cadenceStdDev < 1.5) {
      return { passed: false, reason: 'REJECTED: Mechanical Shaker spoof detected (Cadence StdDev < 1.5). Natural gait variance required.' };
    }
    return { passed: true };
  };

  // Google AdMob Rewarded Video completion with SSV
  const completeAdMobRewardedBoost = () => {
    const check = antiCheatTriggerCheck();
    if (!check.passed) {
      setAntiCheatWarning(check.reason || 'Anti-fraud validation failed');
      return {
        success: false,
        coinsAwarded: 0,
        transactionId: '',
        message: check.reason || 'Verification rejected',
      };
    }

    if (wallet.dailyCoinsMintedToday >= wallet.dailyCoinCap) {
      const msg = `Daily cap reached (${wallet.dailyCoinCap} Coins/day max). Sweat XP will continue accumulating!`;
      setAntiCheatWarning(msg);
      return {
        success: false,
        coinsAwarded: 0,
        transactionId: '',
        message: msg,
      };
    }

    const coinsToMint = Math.min(20, wallet.dailyCoinCap - wallet.dailyCoinsMintedToday);
    const mockTxId = `SSV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Notify backend AdMob SSV asynchronously
    apiClient.verifyAdMobSSV({
      transaction_id: mockTxId,
      user_id: 'USR-3552336',
      ad_unit: 'ca-app-pub-3940256099942544/5224354917',
      reward_amount: coinsToMint,
    }).catch((err) => console.warn('[PulseContext] AdMob SSV sync notice:', err));

    // Update wallet
    setWallet((prev) => ({
      ...prev,
      verifiedPulseCoins: prev.verifiedPulseCoins + coinsToMint,
      dailyCoinsMintedToday: prev.dailyCoinsMintedToday + coinsToMint,
      sweatXp: prev.sweatXp + 150,
    }));

    // Update AdMob revenue & Dynamic Treasury 60/40 Split
    // Average AdMob rewarded ad in India pays ~₹0.20
    const addedRevenueINR = 0.20;
    setAdminTreasury((prev) => {
      const newRev = Number((prev.adMobRevenueINR + addedRevenueINR).toFixed(2));
      const newPool = Number((newRev * 0.60).toFixed(2));
      const newFounder = Number((newRev * 0.40).toFixed(2));
      const newLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'AD_SSV_MINT' as const,
        description: `AdMob SSV verified (${mockTxId}). Minted +${coinsToMint} Verified PulseCoins. 60% allocated to Capital Pool, 40% Net Founder Profit.`,
        amount: `+${coinsToMint} Coins`,
      };
      return {
        ...prev,
        adMobRevenueINR: newRev,
        capitalPoolINR: newPool,
        founderProfitINR: newFounder,
        treasuryLogs: [newLog, ...prev.treasuryLogs.slice(0, 19)],
      };
    });

    setActiveWorkout((prev) => ({
      ...prev,
      isTurboBoosted: true,
    }));

    return {
      success: true,
      coinsAwarded: coinsToMint,
      transactionId: mockTxId,
      message: `Verified by Google AdMob SSV. +${coinsToMint} Verified PulseCoins minted to wallet!`,
    };
  };

  const consumeAiQuery = () => {
    if (wallet.freeAiQueriesLeft > 0) {
      setWallet((prev) => ({
        ...prev,
        freeAiQueriesLeft: prev.freeAiQueriesLeft - 1,
      }));
      return true;
    }
    return false;
  };

  const unlockAiQueriesWithAd = () => {
    // Reward ad adds 3 more consultations
    setWallet((prev) => ({
      ...prev,
      freeAiQueriesLeft: prev.freeAiQueriesLeft + 3,
    }));

    const addedRevenueINR = 0.20;
    setAdminTreasury((prev) => {
      const newRev = Number((prev.adMobRevenueINR + addedRevenueINR).toFixed(2));
      return {
        ...prev,
        adMobRevenueINR: newRev,
        capitalPoolINR: Number((newRev * 0.60).toFixed(2)),
        founderProfitINR: Number((newRev * 0.40).toFixed(2)),
      };
    });
  };

  // Referral milestone simulation
  const simulateFriendProgress = (referralId: string) => {
    setPendingReferrals((prev) =>
      prev.map((r) => {
        if (r.id === referralId) {
          return {
            ...r,
            workoutsCompleted: 3,
            adsWatched: 5,
            status: 'completed',
          };
        }
        return r;
      })
    );

    // Credit +50 Verified PulseCoins bonus
    setWallet((prev) => ({
      ...prev,
      verifiedPulseCoins: prev.verifiedPulseCoins + 50,
      sweatXp: prev.sweatXp + 300,
    }));

    setAdminTreasury((prev) => {
      const newLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'REFERRAL_BONUS' as const,
        description: `Referral milestone verified: Friend completed 3 workouts & 5 ads. Credited +50 Verified PulseCoins to user.`,
        amount: '+50 Coins',
      };
      return {
        ...prev,
        treasuryLogs: [newLog, ...prev.treasuryLogs.slice(0, 19)],
      };
    });
  };

  // UPI Withdrawal request
  const requestUpiWithdrawal = (vpa: string, amountINR: number, coinCost: number) => {
    if (wallet.verifiedPulseCoins < coinCost) {
      return { success: false, error: 'Insufficient Verified PulseCoins balance.' };
    }
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!vpa || !upiRegex.test(vpa.trim())) {
      return { success: false, error: 'Invalid UPI VPA format. Must match name@bank (e.g., name@okaxis).' };
    }

    const orderId = `ORD-${Math.floor(1000000 + Math.random() * 9000000)}`;
    const newOrder: PayoutOrderItem = {
      id: orderId,
      userId: 'USR-3552336',
      vpa: vpa.trim(),
      amountINR,
      coinsDeducted: coinCost,
      trustScore: 98,
      adsVerifiedCount: Math.ceil(coinCost / 20),
      status: 'ESCROW_48HR',
      requestedAt: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };

    setWallet((prev) => ({
      ...prev,
      verifiedPulseCoins: prev.verifiedPulseCoins - coinCost,
    }));

    setAdminTreasury((prev) => ({
      ...prev,
      pendingPayoutQueue: [newOrder, ...prev.pendingPayoutQueue],
      treasuryLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'PAYOUT_REQUEST',
          description: `UPI Cashout requested: ₹${amountINR} to ${vpa.trim()} (${orderId}). Deducted ${coinCost} PulseCoins. Added to 48hr Escrow Queue.`,
          amount: `₹${amountINR}.00`,
        },
        ...prev.treasuryLogs.slice(0, 19),
      ],
    }));

    // Sync redemption to backend API asynchronously
    apiClient.redeemReward({
      userId: 'USR-3552336',
      rewardType: 'UPI_CASHOUT',
      brand: 'UPI',
      coinsDeducted: coinCost,
      payoutAmountINR: amountINR,
      upiVpa: vpa.trim(),
    }).catch((err) => console.warn('[PulseContext] UPI cashout sync notice:', err));

    return { success: true, orderId };
  };

  // Voucher redemption
  const redeemVoucher = (voucherId: string) => {
    const voucher = vouchers.find((v) => v.id === voucherId);
    if (!voucher) return { success: false, error: 'Voucher not found' };
    if (wallet.verifiedPulseCoins < voucher.coinCost) {
      return { success: false, error: `Need ${voucher.coinCost} PulseCoins (have ${wallet.verifiedPulseCoins})` };
    }

    // If pre-loaded PIN is in vault, assign immediately; otherwise place into 48-hour escrow queue
    const hasPreloadedPin = voucher.pinVault && voucher.pinVault.length > 0;
    const pin = hasPreloadedPin ? voucher.pinVault[0] : undefined;
    const updatedPins = hasPreloadedPin ? voucher.pinVault.slice(1) : [];
    const orderId = `VCH-${Math.floor(100000 + Math.random() * 900000)}`;

    // Sync voucher redemption to backend API asynchronously
    apiClient.redeemReward({
      userId: 'USR-3552336',
      rewardType: 'VOUCHER',
      brand: voucher.brand,
      coinsDeducted: voucher.coinCost,
      payoutAmountINR: voucher.valueINR,
      voucherCode: pin,
    }).catch((err) => console.warn('[PulseContext] Voucher redemption sync notice:', err));

    setVouchers((prev) =>
      prev.map((v) => (v.id === voucherId ? { ...v, stockLeft: Math.max(0, v.stockLeft - 1), pinVault: updatedPins } : v))
    );

    setWallet((prev) => ({
      ...prev,
      verifiedPulseCoins: prev.verifiedPulseCoins - voucher.coinCost,
    }));

    const logDesc = hasPreloadedPin
      ? `Redeemed ${voucher.title}. Assigned PIN ${pin!.slice(0, 7)}**** from vault.`
      : `Redeemed ${voucher.title}. Placed into 48-hour verification escrow queue (${orderId}).`;

    setAdminTreasury((prev) => ({
      ...prev,
      treasuryLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'PAYOUT_APPROVED',
          description: logDesc,
          amount: `-${voucher.coinCost} Coins`,
        },
        ...prev.treasuryLogs.slice(0, 19),
      ],
    }));

    return {
      success: true,
      pin,
      inEscrow: !hasPreloadedPin,
      orderId,
    };
  };

  // Admin approves payout
  const approvePayout = (orderId: string) => {
    // Notify production backend admin payout route asynchronously
    apiClient.processAdminPayout(orderId, 'APPROVE').catch((err) => console.warn('[PulseContext] Admin approve sync notice:', err));

    setAdminTreasury((prev) => {
      const order = prev.pendingPayoutQueue.find((o) => o.id === orderId);
      if (!order) return prev;
      const updatedQueue = prev.pendingPayoutQueue.map((o) =>
        o.id === orderId ? { ...o, status: 'APPROVED_PAID' as const, note: 'Processed via UPI Gateway' } : o
      );
      const newLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'PAYOUT_APPROVED' as const,
        description: `Admin [APPROVED & PAID] order ${orderId} (₹${order.amountINR} to ${order.vpa}). Paid from Dynamic Capital Pool.`,
        amount: `-₹${order.amountINR}.00`,
      };
      return {
        ...prev,
        capitalPoolINR: Math.max(0, Number((prev.capitalPoolINR - order.amountINR).toFixed(2))),
        pendingPayoutQueue: updatedQueue,
        treasuryLogs: [newLog, ...prev.treasuryLogs.slice(0, 19)],
      };
    });
  };

  // Admin rejects fraud payout
  const rejectFraudPayout = (orderId: string, reason: string) => {
    // Notify production backend admin reject route asynchronously
    apiClient.processAdminPayout(orderId, 'REJECT', { reason }).catch((err) => console.warn('[PulseContext] Admin reject sync notice:', err));

    setAdminTreasury((prev) => {
      const order = prev.pendingPayoutQueue.find((o) => o.id === orderId);
      if (!order) return prev;
      const updatedQueue = prev.pendingPayoutQueue.map((o) =>
        o.id === orderId ? { ...o, status: 'REJECTED_FRAUD' as const, note: reason } : o
      );
      const newLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'FRAUD_REJECTED' as const,
        description: `Admin [REJECTED FRAUD] for order ${orderId}. Reason: ${reason}. Coins confiscated, trust score reduced.`,
        amount: `₹${order.amountINR} Denied`,
      };
      return {
        ...prev,
        pendingPayoutQueue: updatedQueue,
        treasuryLogs: [newLog, ...prev.treasuryLogs.slice(0, 19)],
      };
    });
  };

  // Admin restocks voucher PINs
  const restockVoucherPins = (brand: VoucherItem['brand'], pins: string[]) => {
    setVouchers((prev) =>
      prev.map((v) => {
        if (v.brand === brand) {
          return {
            ...v,
            stockLeft: v.stockLeft + pins.length,
            pinVault: [...v.pinVault, ...pins],
          };
        }
        return v;
      })
    );

    setAdminTreasury((prev) => ({
      ...prev,
      treasuryLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'PIN_RESTOCKED',
          description: `Founder restocked ${pins.length} new 16-digit digital voucher PINs for ${brand}.`,
          amount: `+${pins.length} Codes`,
        },
        ...prev.treasuryLogs.slice(0, 19),
      ],
    }));
  };

  const clearAntiCheatWarning = () => setAntiCheatWarning(null);

  return (
    <PulseContext.Provider
      value={{
        activeScreen,
        setActiveScreen,
        biometrics,
        updateBiometrics,
        toggleHealthConnect,
        toggleCadenceSensor,
        wallet,
        activeWorkout,
        setExerciseType,
        toggleWorkout,
        updateSimulatedBpm,
        updateCadence,
        setRecordingMethod,
        completeAdMobRewardedBoost,
        consumeAiQuery,
        unlockAiQueriesWithAd,
        pendingReferrals,
        campusLeaderboard,
        simulateFriendProgress,
        vouchers,
        redeemVoucher,
        adminTreasury,
        requestUpiWithdrawal,
        approvePayout,
        rejectFraudPayout,
        restockVoucherPins,
        isHighCardiacStrain,
        hydrationNeededMl,
        antiCheatWarning,
        clearAntiCheatWarning,
      }}
    >
      {children}
    </PulseContext.Provider>
  );
};

export const usePulse = () => {
  const context = useContext(PulseContext);
  if (!context) {
    throw new Error('usePulse must be used within a PulseProvider');
  }
  return context;
};
