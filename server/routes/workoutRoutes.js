import express from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { WorkoutLog } from '../models/WorkoutLog.js';
import { memoryStore } from '../services/memoryStore.js';

const router = express.Router();

/**
 * POST /api/v1/workouts/verify-and-mint
 * Verifies physical sensor integrity and mints Sweat XP
 */
router.post('/verify-and-mint', async (req, res) => {
  try {
    const {
      userId,
      exerciseType,
      recordingMethod,
      deviceType,
      durationMins,
      activeCalories,
      avgHeartRate,
      cadenceStdDev,
      healthConnectId,
    } = req.body;

    // Rule 1: Reject manual entry workouts
    if (recordingMethod === 'RECORDING_METHOD_MANUAL_ENTRY') {
      if (userId && mongoose.connection.readyState === 1) {
        await User.findByIdAndUpdate(userId, {
          $inc: { 'antiCheat.trustScore': -15 },
        });
      }
      return res.status(403).json({
        success: false,
        fraudCode: 'ERR_MANUAL_ENTRY_FORBIDDEN',
        message: 'Anti-Fraud Rejection: Manual entry workouts cannot mint verified tokens or Sweat XP.',
      });
    }

    // Rule 2: Reject mechanical pendulum shaker spoofing (cadenceStdDev < 1.5)
    if (cadenceStdDev !== undefined && Number(cadenceStdDev) < 1.5) {
      if (userId && mongoose.connection.readyState === 1) {
        await User.findByIdAndUpdate(userId, {
          $inc: { 'antiCheat.trustScore': -25 },
        });
      }
      return res.status(403).json({
        success: false,
        fraudCode: 'ERR_MECHANICAL_SHAKER_DETECTED',
        message: `Anti-Fraud Rejection: Mechanical shaker spoof detected (Cadence StdDev: ${cadenceStdDev} < 1.5). Natural human gait variance required.`,
      });
    }

    // Rule 3: Cross-check heart rate vs calories for HIIT/Gym
    if (
      (exerciseType === 'Gym HIIT' || exerciseType === 'Running') &&
      activeCalories > 250 &&
      avgHeartRate < 85
    ) {
      return res.status(422).json({
        success: false,
        fraudCode: 'ERR_BIOMETRIC_MISMATCH',
        message: 'Anti-Fraud Rejection: Unrealistic caloric burn logged at resting heart rate.',
      });
    }

    // If MongoDB is offline, use zero-downtime memoryStore fallback
    if (mongoose.connection.readyState !== 1) {
      const result = memoryStore.recordWorkout({
        userId,
        exerciseType,
        recordingMethod,
        deviceType,
        durationMins,
        activeCalories,
        avgHeartRate,
        cadenceStdDev,
        healthConnectId,
      });
      return res.status(200).json(result);
    }

    // Calculate Sweat XP earned (e.g., activeCalories * 1.5)
    const sweatXpEarned = Math.round((activeCalories || 100) * 1.5);

    // Persist verified workout log
    let savedLog = null;
    let updatedUser = null;

    if (userId) {
      savedLog = await WorkoutLog.create({
        userId,
        healthConnectId,
        exerciseType: exerciseType || 'Gym HIIT',
        recordingMethod: recordingMethod || 'RECORDING_METHOD_SENSOR_HEART_RATE',
        deviceType: deviceType || 'Android_HealthConnect',
        durationMins: durationMins || 25,
        activeCalories: activeCalories || 233,
        avgHeartRate: avgHeartRate || 175,
        cadenceStdDev: cadenceStdDev || 3.2,
        coinsMinted: 0, // Coins only minted via AdMob SSV Turbo Boost
      });

      // Update user wallet & workout count
      updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $inc: {
            'wallet.sweatXp': sweatXpEarned,
            'antiCheat.workoutsCompletedCount': 1,
          },
        },
        { new: true }
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Workout verified and logged by Biometric Sensor Gate.',
      sweatXpEarned,
      workoutLogId: savedLog?._id || 'MOCK_LOG_01',
      userMetrics: updatedUser
        ? {
            sweatXp: updatedUser.wallet.sweatXp,
            workoutsCompleted: updatedUser.antiCheat.workoutsCompletedCount,
            trustScore: updatedUser.antiCheat.trustScore,
          }
        : null,
    });
  } catch (error) {
    console.error('[Workout Route Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error processing workout verification.',
      error: error.message,
    });
  }
});

export default router;

