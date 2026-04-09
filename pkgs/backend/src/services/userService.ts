import HttpError from "../server/httpError.js";
import { User, type UserDocument } from "../models/User.js";

export class UserService {
  async ensureUser(telegramId: number): Promise<UserDocument> {
    const now = new Date();
    const doc = await User.findOneAndUpdate(
      { telegramId },
      { $setOnInsert: { telegramId, clicks: 0, updatedAt: now } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    if (!doc) throw new HttpError("Failed to ensure user", 500);
    return doc;
  }

  async addClicks(telegramId: number, delta: number): Promise<UserDocument> {
    if (delta <= 0 || delta > 10_000) {
      throw new HttpError("Invalid click batch", 400);
    }
    const now = new Date();
    const doc = await User.findOneAndUpdate(
      { telegramId },
      {
        $inc: { clicks: delta },
        $set: { updatedAt: now },
        $setOnInsert: { telegramId },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    if (!doc) throw new HttpError("Failed to update user", 500);
    return doc;
  }

  async getRank(telegramId: number): Promise<number> {
    const user = await User.findOne({ telegramId }).lean();
    if (!user) return 0;
    const higher = await User.countDocuments({ clicks: { $gt: user.clicks } });
    return higher + 1;
  }

  async getMe(telegramId: number): Promise<{ id: number; clicks: number; rank: number }> {
    const user = await this.ensureUser(telegramId);
    const rank = await this.getRank(telegramId);
    return { id: user.telegramId, clicks: user.clicks, rank };
  }

  /**
   * Top 25 by clicks. If `telegramId` is not in that set, append one row for the user.
   */
  async getLeaderboard(telegramId: number): Promise<{ id: number; clicks: number; rank: number }[]> {
    await this.ensureUser(telegramId);

    const top = await User.find().sort({ clicks: -1 }).limit(25).lean();

    const ids = new Set(top.map((u) => u.telegramId));
    const ranked = top.map((u, i) => ({
      id: u.telegramId,
      clicks: u.clicks,
      rank: i + 1,
    }));

    if (ids.has(telegramId)) {
      return ranked;
    }

    const rank = await this.getRank(telegramId);
    const me = await User.findOne({ telegramId }).lean();
    if (!me) return ranked;

    return [...ranked, { id: me.telegramId, clicks: me.clicks, rank }];
  }
}
