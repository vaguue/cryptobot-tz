import mongoose from "mongoose";

export interface IUser {
  telegramId: number;
  clicks: number;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    telegramId: { type: Number, required: true, unique: true },
    clicks: { type: Number, required: true, default: 0, min: 0 },
    updatedAt: { type: Date, default: () => new Date() },
  },
  { versionKey: false }
);

userSchema.index({ clicks: -1 });

export type UserDocument = mongoose.HydratedDocument<IUser>;

export const User = mongoose.model<IUser>("User", userSchema);
