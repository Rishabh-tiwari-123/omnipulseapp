import mongoose from 'mongoose';

const RedemptionOrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  rewardType: {
    type: String,
    enum: ['UPI_CASHOUT', 'VOUCHER'],
    required: true,
  },
  brand: {
    type: String,
    default: null,
  },
  coinsDeducted: {
    type: Number,
    required: true,
  },
  payoutAmountINR: {
    type: Number,
    required: true,
  },
  upiVpa: {
    type: String,
    trim: true,
    default: null,
  },
  voucherCodeAssigned: {
    type: String,
    trim: true,
    default: null,
  },
  status: {
    type: String,
    enum: ['ESCROW_48HR', 'APPROVED_PAID', 'REJECTED_FRAUD'],
    default: 'ESCROW_48HR',
    index: true,
  },
  adminNotes: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const RedemptionOrder =
  mongoose.models.RedemptionOrder || mongoose.model('RedemptionOrder', RedemptionOrderSchema);
export default RedemptionOrder;

