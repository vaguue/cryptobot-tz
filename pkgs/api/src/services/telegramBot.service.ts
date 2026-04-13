import { Bot, InlineKeyboard } from "grammy";
import { config } from "../config.js";
import logger from "../logger.js";

export class TelegramBotService {
  private bot: Bot | null = null;

  constructor() {
    if (!config.TELEGRAM_BOT_TOKEN) {
      logger.warn("TELEGRAM_BOT_TOKEN is not set. Telegram bot will not be initialized.");
      return;
    }

    this.bot = new Bot(config.TELEGRAM_BOT_TOKEN);
    this.initHandlers();
  }

  private initHandlers() {
    if (!this.bot) return;

    this.bot.command("start", async (ctx) => {
      const username = ctx.from?.username ?? ctx.from?.first_name ?? "there";

      const text = `Hey, @${username}
      
Welcome to Crypto Boy! 🥳

Tap the screen 📲, earn more points, pump up your passive income, and develop your own strategy.

💙Got friends? Bring them to the game and get even more coins together!

Tap-and-Earn right now! 🔵`;

      const keyboard = new InlineKeyboard()
        .webApp("💰 Launch Game", "https://t.me/CryptoBoyBot/app")
        .row()
        .url("💬 Join Community", "https://t.me/+m1BOQ6W86zlmZGEy");

      try {
        await ctx.reply(text, { reply_markup: keyboard });
      } catch (err) {
        logger.warn(`Failed to send welcome message: ${err}`);
      }
    });

    this.bot.catch((err) => {
      const ctx = err.ctx;
      logger.error(`Error while handling update ${ctx.update.update_id}:`);
      logger.error(err.error);
    });
  }

  public async start() {
    if (!this.bot) return;

    // Start bot asynchronously
    this.bot
      .start({
        onStart: (botInfo) => {
          logger.info(`Telegram bot started as @${botInfo.username}`);
        },
      })
      .catch((err) => {
        logger.error(`Failed to start Telegram bot: ${err}`);
      });
  }

  public async stop() {
    if (!this.bot) return;
    await this.bot.stop();
    logger.info("Telegram bot stopped.");
  }
}

export const telegramBotService = new TelegramBotService();
