/**
 * OmniPulse Native Bridge Service Module
 * Handles native Android bridges for Google Health Connect and Google AdMob SSV,
 * with automatic, zero-downtime fallback to web simulation on browsers.
 */

export interface HealthConnectMetadata {
  id: string;
  dataOrigin: string;
  recordingMethod?: 'RECORDING_METHOD_UNKNOWN' | 'RECORDING_METHOD_MANUAL_ENTRY' | 'RECORDING_METHOD_AUTOMATIC';
  device?: {
    manufacturer?: string;
    model?: string;
    type?: string;
  };
}

export interface ExerciseSessionRecord {
  metadata: HealthConnectMetadata;
  exerciseType: string;
  title?: string;
  startTime: string;
  endTime: string;
}

export interface HeartRateSample {
  beatsPerMinute: number;
  time: string;
}

export interface HeartRateRecord {
  metadata: HealthConnectMetadata;
  samples: HeartRateSample[];
  startTime: string;
  endTime: string;
}

export interface StepsRecord {
  metadata: HealthConnectMetadata;
  count: number;
  startTime: string;
  endTime: string;
}

export interface ActiveCaloriesBurnedRecord {
  metadata: HealthConnectMetadata;
  energy: {
    inKilocalories: number;
  };
  startTime: string;
  endTime: string;
}

export interface FilteredHealthTelemetry {
  exerciseSessions: ExerciseSessionRecord[];
  heartRateRecords: HeartRateRecord[];
  stepsRecords: StepsRecord[];
  calorieRecords: ActiveCaloriesBurnedRecord[];
  totalCalories: number;
  avgBpm: number;
  totalSteps: number;
  rejectedManualCount: number;
  isSimulated: boolean;
}

export interface AdMobRewardResult {
  success: boolean;
  rewarded: boolean;
  transactionId?: string;
  rewardAmount?: number;
  isSimulated: boolean;
  error?: string;
}

class NativeBridgeService {
  /**
   * Detects whether the app is executing inside a native Capacitor shell
   */
  isNativePlatform(): boolean {
    if (typeof window === 'undefined') return false;
    const cap = (window as any).Capacitor;
    return Boolean(cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform());
  }

  /**
   * Initializes Google Health Connect client on Android
   */
  async requestHealthConnectPermissions(): Promise<{ success: boolean; granted: string[] }> {
    if (!this.isNativePlatform()) {
      console.log('[NativeBridge] Running on Web: Simulating Health Connect permission grant (100%).');
      return {
        success: true,
        granted: [
          'android.permission.health.READ_STEPS',
          'android.permission.health.READ_HEART_RATE',
          'android.permission.health.READ_EXERCISE',
          'android.permission.health.READ_ACTIVE_CALORIES_BURNED',
        ],
      };
    }

    try {
      // In native Android, interface with Health Connect Capacitor plugin
      const healthPlugin = (window as any).Capacitor?.Plugins?.HealthConnect;
      if (healthPlugin?.requestPermissions) {
        const result = await healthPlugin.requestPermissions({
          permissions: [
            'READ_STEPS',
            'READ_HEART_RATE',
            'READ_EXERCISE',
            'READ_ACTIVE_CALORIES_BURNED',
          ],
        });
        return { success: true, granted: result.granted || [] };
      }
    } catch (err) {
      console.warn('[NativeBridge] Health Connect native permission request failed:', err);
    }

    return { success: false, granted: [] };
  }

  /**
   * Reads Health Connect records and strictly filters out any manual entry spoofs
   */
  async readVerifiedHealthData(startTime: Date, endTime: Date): Promise<FilteredHealthTelemetry> {
    if (!this.isNativePlatform()) {
      // Web fallback: Interactive realistic simulation
      return {
        exerciseSessions: [
          {
            metadata: { id: 'sim-ex-1', dataOrigin: 'com.omnipulse.fitness', recordingMethod: 'RECORDING_METHOD_AUTOMATIC' },
            exerciseType: 'Gym HIIT',
            title: 'HIIT Session',
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
          },
        ],
        heartRateRecords: [
          {
            metadata: { id: 'sim-hr-1', dataOrigin: 'com.omnipulse.fitness', recordingMethod: 'RECORDING_METHOD_AUTOMATIC' },
            samples: [{ beatsPerMinute: 175, time: endTime.toISOString() }],
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
          },
        ],
        stepsRecords: [
          {
            metadata: { id: 'sim-st-1', dataOrigin: 'com.omnipulse.fitness', recordingMethod: 'RECORDING_METHOD_AUTOMATIC' },
            count: 3240,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
          },
        ],
        calorieRecords: [
          {
            metadata: { id: 'sim-cal-1', dataOrigin: 'com.omnipulse.fitness', recordingMethod: 'RECORDING_METHOD_AUTOMATIC' },
            energy: { inKilocalories: 233 },
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
          },
        ],
        totalCalories: 233,
        avgBpm: 175,
        totalSteps: 3240,
        rejectedManualCount: 0,
        isSimulated: true,
      };
    }

    try {
      const healthPlugin = (window as any).Capacitor?.Plugins?.HealthConnect;
      if (healthPlugin?.readRecords) {
        const rawRecords = await healthPlugin.readRecords({
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          types: ['ExerciseSessionRecord', 'StepsRecord', 'HeartRateRecord', 'ActiveCaloriesBurnedRecord'],
        });

        let rejectedManualCount = 0;

        // Anti-Fraud Filter: Explicitly discard any record where recordingMethod === 'RECORDING_METHOD_MANUAL_ENTRY'
        const filterValid = <T extends { metadata: HealthConnectMetadata }>(items: T[]): T[] => {
          if (!Array.isArray(items)) return [];
          return items.filter((item) => {
            if (item.metadata?.recordingMethod === 'RECORDING_METHOD_MANUAL_ENTRY') {
              rejectedManualCount += 1;
              return false;
            }
            return true;
          });
        };

        const validSessions = filterValid<ExerciseSessionRecord>(rawRecords.exerciseSessions || []);
        const validHeartRates = filterValid<HeartRateRecord>(rawRecords.heartRateRecords || []);
        const validSteps = filterValid<StepsRecord>(rawRecords.stepsRecords || []);
        const validCalories = filterValid<ActiveCaloriesBurnedRecord>(rawRecords.calorieRecords || []);

        const totalSteps = validSteps.reduce((acc, s) => acc + (s.count || 0), 0);
        const totalCalories = validCalories.reduce((acc, c) => acc + (c.energy?.inKilocalories || 0), 0);

        let sumBpm = 0;
        let countBpm = 0;
        validHeartRates.forEach((hr) => {
          hr.samples?.forEach((sample) => {
            sumBpm += sample.beatsPerMinute;
            countBpm += 1;
          });
        });

        return {
          exerciseSessions: validSessions,
          heartRateRecords: validHeartRates,
          stepsRecords: validSteps,
          calorieRecords: validCalories,
          totalCalories,
          avgBpm: countBpm > 0 ? Math.round(sumBpm / countBpm) : 0,
          totalSteps,
          rejectedManualCount,
          isSimulated: false,
        };
      }
    } catch (err) {
      console.warn('[NativeBridge] Failed to read Health Connect records:', err);
    }

    // Default safety fallback
    return {
      exerciseSessions: [],
      heartRateRecords: [],
      stepsRecords: [],
      calorieRecords: [],
      totalCalories: 0,
      avgBpm: 0,
      totalSteps: 0,
      rejectedManualCount: 0,
      isSimulated: true,
    };
  }

  /**
   * Initializes Google AdMob on Android and displays Rewarded Video with SSV
   */
  async showRewardedVideo(userId: string, customData?: string): Promise<AdMobRewardResult> {
    if (!this.isNativePlatform()) {
      // Browser simulation
      const mockTxId = `SSV-WEB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      return {
        success: true,
        rewarded: true,
        transactionId: mockTxId,
        rewardAmount: 20,
        isSimulated: true,
      };
    }

    try {
      const adMobPlugin = (window as any).Capacitor?.Plugins?.AdMob;
      if (adMobPlugin) {
        // Initialize AdMob if available
        if (typeof adMobPlugin.initialize === 'function') {
          await adMobPlugin.initialize({
            requestTrackingAuthorization: true,
            testingDevices: [],
            initializeForTesting: true,
          }).catch(() => {});
        }

        // Prepare Rewarded Video with SSV (Server-Side Verification) options
        await adMobPlugin.prepareRewardVideoAd({
          adId: 'ca-app-pub-6842617720697423/9094545249', // Production Rewarded Ad Unit ID
          isTesting: true, // Safe testing mode enabled during pre-Play-Store testing
          ssv: {
            userId: userId || 'omnipulse_user_default',
            customData: customData || JSON.stringify({ app: 'OmniPulse', version: '5.0.0' }),
          },
        });

        const rewardItem = await adMobPlugin.showRewardVideoAd();
        const txId = `SSV-NATIVE-${Date.now().toString(36).toUpperCase()}`;

        return {
          success: true,
          rewarded: Boolean(rewardItem),
          transactionId: txId,
          rewardAmount: Number(rewardItem?.amount) || 20,
          isSimulated: false,
        };
      }
    } catch (err: any) {
      console.warn('[NativeBridge] Native AdMob execution error:', err);
      return {
        success: false,
        rewarded: false,
        isSimulated: false,
        error: err?.message || 'AdMob native playback failed',
      };
    }

    return {
      success: false,
      rewarded: false,
      isSimulated: true,
      error: 'AdMob plugin not installed on native bridge',
    };
  }
}

export const nativeBridge = new NativeBridgeService();
export default nativeBridge;

