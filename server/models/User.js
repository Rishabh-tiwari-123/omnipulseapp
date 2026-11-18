import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    upiId: {
      type: String,
      trim: true,
      default: '',
    },
    biometrics: {
      age: { type: Number, default: 22 },
      weightKg: { type: Number, default: 68 },
      heightCm: { type: Number, default: 175 },
      maxHeartRate: { type: Number, default: 198 },
    },
    wallet: {
      verifiedCoins: { type: Number, default: 1420 },
      sweatXp: { type: Number, default: 3450 },
      lastMintDate: { type: Date, default: Date.now },
    },
    antiCheat: {
      trustScore: { type: Number, default: 100, min: 0, max: 100 },
      dailyCoinsMinted: { type: Number, default: 15 },
      workoutsCompletedCount: { type: Number, default: 0 },
      adsWatchedCount: { type: Number, default: 0 },
      isFrozen: { type: Boolean, default: false },
    },
    myReferralCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    referredBy: {
      type: String,
      default: null,
      trim: true,
    },
    referralBonusClaimed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;

