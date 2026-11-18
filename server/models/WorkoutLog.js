import mongoose from 'mongoose';

const WorkoutLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  healthConnectId: {
    type: String,
    unique: true,
    sparse: true,
  },
  exerciseType: {
    type: String,
    required: true,
    enum: ['Walking', 'Gym HIIT', 'Running', 'Cycling', 'Yoga', 'Swimming'],
  },
  recordingMethod: {
    type: String,
    required: true,
    enum: [
      'RECORDING_METHOD_SENSOR_HEART_RATE',
      'RECORDING_METHOD_MANUAL_ENTRY',
      'RECORDING_METHOD_EXTERNAL_SYNC',
    ],
  },
  deviceType: {
    type: String,
    default: 'Android_HealthConnect',
  },
  durationMins: {
    type: Number,
    required: true,
  },
  activeCalories: {
    type: Number,
    required: true,
  },
  avgHeartRate: {
    type: Number,
    required: true,
  },
  cadenceStdDev: {
    type: Number,
    default: 2.8,
  },
  coinsMinted: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

export const WorkoutLog = mongoose.models.WorkoutLog || mongoose.model('WorkoutLog', WorkoutLogSchema);
export default WorkoutLog;

