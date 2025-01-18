import mongoose from "mongoose";
const { Schema } = mongoose;

const veriftSchema = new Schema({
  user: {
    type: Schema.Types.String,
    required: true,
  },
  otp: {
    type: Schema.Types.Number,
    required: true,
  },
  expiresAt: { type: Date, required: true },
});

veriftSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 1 });

export const Verify = mongoose.models.Verify || mongoose.model("Verify", veriftSchema);
