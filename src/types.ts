export type ScreenId = 'onboarding' | 'workout' | 'safety' | 'rewards' | 'squads' | 'admin';

export type ExerciseType = 'Walking' | 'Gym HIIT' | 'Running' | 'Cycling' | 'Yoga' | 'Swimming';

export interface ExerciseConfig {
  name: ExerciseType;
  met: number;
  icon: string;
  defaultBpm: number;
  cadenceRange: [number, number];
}

export interface TelemetryPoint {
  timestamp: string;
  bpm: number;
  calories: number;
}

export interface UserBiometrics {
  age: number;
  weightKg: number;
  heightCm: number;
  maxHeartRate: number;
  targetSafeHeartRate: number;
  fatBurnZoneLow: number;
  fatBurnZoneHigh: number;
  permissionsConfigured: boolean;
  healthConnectEnabled: boolean;
  cadenceSensorEnabled: boolean;
}

export interface WalletState {
  verifiedPulseCoins: number;
  sweatXp: number;
  streakDays: number;
  dailyCoinsMintedToday: number;
  dailyCoinCap: number; // 35
  freeAiQueriesLeft: number;
  streakMultiplier: number;
}

export interface ActiveWorkoutState {
  isActive: boolean;
  isPaused: boolean;
  exerciseType: ExerciseType;
  durationSeconds: number;
  simulatedBpm: number;
  cadenceIntensity: number; // steps per min or cadence
  cadenceStdDev: number; // < 1.5 triggers mechanical shaker spoof rejection
  recordingMethod: 'RECORDING_METHOD_SENSOR_HEART_RATE' | 'RECORDING_METHOD_MANUAL_ENTRY';
  activeCalories: number;
  telemetryHistory: TelemetryPoint[];
  antiCheatStatus: 'VERIFIED' | 'FLAGGED_MANUAL' | 'FLAGGED_SHAKER';
  isTurboBoosted: boolean;
}

export interface PendingReferral {
  id: string;
  name: string;
  avatar: string;
  workoutsCompleted: number;
  workoutsRequired: number; // 3
  adsWatched: number;
  adsRequired: number; // 5
  status: 'pending' | 'completed';
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  hostel: string;
  calories: number;
  sweatXp: number;
  avatar: string;
  isUser: boolean;
}

export interface VoucherItem {
  id: string;
  brand: 'Google Play' | 'Swiggy' | 'Zomato' | 'Decathlon';
  title: string;
  valueINR: number;
  coinCost: number;
  stockLeft: number;
  brandColor: string;
  logoUrl?: string;
  pinVault: string[];
}

export interface PayoutOrderItem {
  id: string;
  userId: string;
  vpa: string;
  amountINR: number;
  coinsDeducted: number;
  trustScore: number; // 0 - 100%
  adsVerifiedCount: number;
  status: 'ESCROW_48HR' | 'APPROVED_PAID' | 'REJECTED_FRAUD';
  requestedAt: string;
  note?: string;
}

export interface TreasuryLog {
  id: string;
  timestamp: string;
  type: 'AD_SSV_MINT' | 'PAYOUT_REQUEST' | 'PAYOUT_APPROVED' | 'FRAUD_REJECTED' | 'PIN_RESTOCKED' | 'REFERRAL_BONUS';
  description: string;
  amount?: string;
}

export interface AdminTreasury {
  adMobRevenueINR: number;
  capitalPoolINR: number; // 60%
  founderProfitINR: number; // 40%
  targetPayLimitPercent: number; // 60%
  pendingPayoutQueue: PayoutOrderItem[];
  treasuryLogs: TreasuryLog[];
}

