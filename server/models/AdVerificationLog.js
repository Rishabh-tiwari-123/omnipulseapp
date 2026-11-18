import mongoose from 'mongoose';

const AdVerificationLogSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true, // Crucial: prevents AdMob SSV replay attacks
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  adUnitId: {
    type: String,
    required: true,
  },
  rewardType: {
    type: String,
    default: 'PULSE_COIN_TURBO_BOOST',
  },
  rewardAmount: {
    type: Number,
    default: 20,
  },
  signatureVerified: {
    type: Boolean,
    default: true,
  },
  keyId: {
    type: String,
    default: null,
  },
  verifiedAt: {
    type: Date,
    default: Date.now,
  },
});

export const AdVerificationLog =
  mongoose.models.AdVerificationLog || mongoose.model('AdVerificationLog', AdVerificationLogSchema);
export default AdVerificationLog;

