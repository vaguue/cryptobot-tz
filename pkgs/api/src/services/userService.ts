import HttpError from "../server/errors/httpError.js";
import { User, type UserDocument } from "../models/User.js";
import type { PaginatedData, UserStatsPayload } from "../server/http/types.js";

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

  async getLeaderboard(
    telegramId: number,
    page: number = 1,
    limit: number = 25
  ): Promise<PaginatedData<UserStatsPayload>> {
    await this.ensureUser(telegramId);

    const skip = (page - 1) * limit;
    
    const [top, total] = await Promise.all([
      User.find().sort({ clicks: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(),
    ]);

    const ids = new Set(top.map((u) => u.telegramId));
    
    // We get rank based on exact skip + i + 1 assuming no ties
    // For a more accurate rank in ties, you would query count of users with > clicks
    // But for a simple leaderboard skip + i + 1 is fine.
    const ranked = top.map((u, i) => ({
      id: u.telegramId,
      clicks: u.clicks,
      rank: skip + i + 1,
    }));

    const totalPages = Math.ceil(total / limit);
    let meData;

    if (!ids.has(telegramId)) {
      const rank = await this.getRank(telegramId);
      const me = await User.findOne({ telegramId }).lean();
      if (me) {
        meData = { id: me.telegramId, clicks: me.clicks, rank };
      }
    } else {
      meData = ranked.find(u => u.id === telegramId);
    }

    return {
      rows: ranked,
      total,
      totalPages,
      page,
      limit,
      me: meData,
    };
  }
}
