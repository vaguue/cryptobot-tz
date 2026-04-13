import { User } from "../../models/User.js";

export async function run() {
  console.log("Clearing existing fake users...");
  // Let's assume real tg user IDs are somewhat large, fake ones can be negative or specific range
  // Actually, we'll just insert 100 random users between 1,000,000 and 9,000,000
  
  const fakeUsers = [];
  for (let i = 0; i < 100; i++) {
    const telegramId = Math.floor(Math.random() * 8000000) + 1000000;
    const clicks = Math.floor(Math.random() * 500000); // Up to 500k clicks
    fakeUsers.push({
      telegramId,
      clicks,
      updatedAt: new Date(),
    });
  }

  console.log(`Inserting ${fakeUsers.length} fake mooks...`);
  await User.insertMany(fakeUsers);
  
  console.log("Done. Bada bing, bada boom.");
}
