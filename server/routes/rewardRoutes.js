import express from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { RedemptionOrder } from '../models/RedemptionOrder.js';
import { memoryStore } from '../services/memoryStore.js';

const router = express.Router();

/**
 * POST /api/v1/rewards/redeem
 * Processes UPI Cashout and Digital Voucher redemption orders into 48hr Escrow
 */
router.post('/redeem', async (req, res) => {
  try {
    const { userId, rewardType, brand, coinsDeducted, payoutAmountINR, upiVpa, voucherCode } = req.body;

    if (!coinsDeducted || coinsDeducted <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid coin redemption amount.' });
    }

    if (mongoose.connection.readyState !== 1) {
      const result = memoryStore.createRedemption({
        userId,
        rewardType,
        brand,
        coinsDeducted,
        payoutAmountINR,
        upiVpa,
        voucherCode,
      });
      return res.status(200).json(result);
    }

    let user = null;
    if (userId) {
      user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      // Anti-fraud checks
      if (user.antiCheat.isFrozen) {
        return res.status(403).json({
          success: false,
          message: 'Account is frozen due to sensor spoofing investigations. Contact founder support.',
        });
      }

      if (user.antiCheat.trustScore < 80) {
        return res.status(403).json({
          success: false,
          message: `Anti-Fraud: Trust score is ${user.antiCheat.trustScore}% (must be at least 80% to redeem fiat/vouchers).`,
        });
      }

      if (user.wallet.verifiedCoins < coinsDeducted) {
        return res.status(400).json({
          success: false,
          message: `Insufficient balance. Required: ${coinsDeducted}, Available: ${user.wallet.verifiedCoins}`,
        });
      }

      // UPI VPA Regex format validation if rewardType === 'UPI_CASHOUT'
      if (rewardType === 'UPI_CASHOUT') {
        const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
        if (!upiVpa || !upiRegex.test(upiVpa.trim())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid UPI VPA address format. Must match name@bank (e.g., name@okaxis).',
          });
        }
      }

      // Deduct coins atomically
      user.wallet.verifiedCoins -= coinsDeducted;
      await user.save();
    }

    // Create redemption order in 48-Hour Escrow queue
    const order = await RedemptionOrder.create({
      userId: user?._id || userId,
      rewardType: rewardType || 'UPI_CASHOUT',
      brand: brand || (rewardType === 'UPI_CASHOUT' ? 'UPI_DIRECT' : 'Google Play'),
      coinsDeducted,
      payoutAmountINR: payoutAmountINR || Number((coinsDeducted / 100).toFixed(0)),
      upiVpa: upiVpa ? upiVpa.trim() : null,
      voucherCodeAssigned: voucherCode || null,
      status: 'ESCROW_48HR',
    });

    return res.status(201).json({
      success: true,
      message: 'Redemption order queued successfully in 48-Hour Verification Escrow.',
      order: {
        id: order._id,
        rewardType: order.rewardType,
        payoutAmountINR: order.payoutAmountINR,
        status: order.status,
        createdAt: order.createdAt,
      },
      updatedBalance: user ? user.wallet.verifiedCoins : undefined,
    });
  } catch (error) {
    console.error('[Redeem Route Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create redemption order.',
      error: error.message,
    });
  }
});

export default router;

