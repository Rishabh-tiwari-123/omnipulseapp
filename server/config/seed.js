import { User } from '../models/User.js';
import { RedemptionOrder } from '../models/RedemptionOrder.js';
import { AdVerificationLog } from '../models/AdVerificationLog.js';
import { WorkoutLog } from '../models/WorkoutLog.js';

export const seedInitialDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`[OmniPulse Seed] Database already contains ${userCount} users. Skipping seed.`);
      return;
    }

    console.log('[OmniPulse Seed] Seeding initial OmniPulse v5 demo data into MongoDB...');

    // 1. Create Primary Demo User
    const primaryUser = await User.create({
      name: 'Rishabh Tiwari',
      email: 'rishabh@omnipulse.app',
      upiId: 'rishabh@okhdfcbank',
      biometrics: {
        age: 22,
        weightKg: 68,
        heightCm: 175,
        maxHeartRate: 198,
      },
      wallet: {
        verifiedCoins: 1420,
        sweatXp: 3450,
        lastMintDate: new Date(),
      },
      antiCheat: {
        trustScore: 100,
        dailyCoinsMinted: 15,
        workoutsCompletedCount: 3,
        adsWatchedCount: 5,
        isFrozen: false,
      },
      myReferralCode: 'OMNI-6B8',
      referredBy: null,
      referralBonusClaimed: false,
    });

    // 2. Create Referred Friend Users for Pending Milestones
    await User.create([
      {
        name: 'Sanjay Kumar',
        email: 'sanjay@campus.edu',
        upiId: 'sanjay@okaxis',
        biometrics: { age: 21, weightKg: 65, heightCm: 172, maxHeartRate: 199 },
        wallet: { verifiedCoins: 300, sweatXp: 1200 },
        antiCheat: { trustScore: 95, dailyCoinsMinted: 10, workoutsCompletedCount: 2, adsWatchedCount: 4 },
        myReferralCode: 'SANJ-9A2',
        referredBy: 'OMNI-6B8',
        referralBonusClaimed: false,
      },
      {
        name: 'Aarav Patel',
        email: 'aarav@campus.edu',
        upiId: 'aarav@ibl',
        biometrics: { age: 23, weightKg: 72, heightCm: 178, maxHeartRate: 197 },
        wallet: { verifiedCoins: 450, sweatXp: 1600 },
        antiCheat: { trustScore: 90, dailyCoinsMinted: 15, workoutsCompletedCount: 2, adsWatchedCount: 3 },
        myReferralCode: 'AARV-4F1',
        referredBy: 'OMNI-6B8',
        referralBonusClaimed: false,
      },
      {
        name: 'Priya Sharma',
        email: 'priya@campus.edu',
        upiId: 'priya@ybl',
        biometrics: { age: 20, weightKg: 54, heightCm: 164, maxHeartRate: 200 },
        wallet: { verifiedCoins: 150, sweatXp: 800 },
        antiCheat: { trustScore: 100, dailyCoinsMinted: 5, workoutsCompletedCount: 1, adsWatchedCount: 2 },
        myReferralCode: 'PRIY-7B3',
        referredBy: 'OMNI-6B8',
        referralBonusClaimed: false,
      },
    ]);

    // 3. Seed Sample Workout Log for Primary User
    await WorkoutLog.create({
      userId: primaryUser._id,
      healthConnectId: 'hc-session-seed-01',
      exerciseType: 'Gym HIIT',
      recordingMethod: 'RECORDING_METHOD_SENSOR_HEART_RATE',
      deviceType: 'Android_HealthConnect',
      durationMins: 25,
      activeCalories: 233,
      avgHeartRate: 175,
      cadenceStdDev: 3.2,
      coinsMinted: 20,
    });

    // 4. Seed AdMob SSV Verification Log
    await AdVerificationLog.create({
      transactionId: 'SSV-SEED-TRANSACTION-9841',
      userId: primaryUser._id,
      adUnitId: 'ca-app-pub-omnipulse-turbo-boost',
      rewardType: 'VERIFIED_PULSE_COIN',
      rewardAmount: 20,
      signatureVerified: true,
    });

    // 5. Seed Blueprint Pending Payout Orders (Matching Admin Queue Blueprint)
    await RedemptionOrder.create([
      {
        userId: primaryUser._id,
        rewardType: 'UPI_CASHOUT',
        brand: 'UPI_DIRECT',
        coinsDeducted: 1000,
        payoutAmountINR: 10,
        upiVpa: 'vionc@admint.com',
        status: 'ESCROW_48HR',
        adminNotes: 'Trust score 100% - Clean biometric cadence verification.',
      },
      {
        userId: primaryUser._id,
        rewardType: 'UPI_CASHOUT',
        brand: 'UPI_DIRECT',
        coinsDeducted: 2400,
        payoutAmountINR: 25,
        upiVpa: 'omaith@gpldi.com',
        status: 'ESCROW_48HR',
        adminNotes: 'Trust score 92% - 4 ads verified.',
      },
      {
        userId: primaryUser._id,
        rewardType: 'UPI_CASHOUT',
        brand: 'UPI_DIRECT',
        coinsDeducted: 4700,
        payoutAmountINR: 50,
        upiVpa: 'sorli@admint.com',
        status: 'ESCROW_48HR',
        adminNotes: 'Trust score 60% - Rapid cadence jitter under review.',
      },
    ]);

    console.log('[OmniPulse Seed] Initial demo data seeded successfully!');
  } catch (err) {
    console.error('[OmniPulse Seed Error]:', err.message);
  }
};

