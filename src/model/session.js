import mongoose from "mongoose";
const { Schema } = mongoose;

const sessionSchema = new Schema({
  sessionData: {
    type: Schema.Types.Mixed,
  },
  expiresAt: { type: Date, required: true },
});

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 1 });

export const Session = mongoose.models.Session || mongoose.model("Session", sessionSchema);
