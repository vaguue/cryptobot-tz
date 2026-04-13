import { connectMongo } from "../mongo.js";
import mongoose from "mongoose";

async function main() {
  console.log(process.argv);
  const seederName = process.argv[2];
  
  if (!seederName) {
    console.error("What's the matter with you? You gotta give me a name! (e.g. npm run seed users)");
    process.exit(1);
  }

  console.log("Connecting to the database...");
  await connectMongo();

  try {
    let seeder;
    try {
      // Dynamic import to keep things organized like a well-oiled machine
      seeder = await import(`./${seederName}.seeder.js`);
    } catch (e) {
      console.error(`I don't know any guy named '${seederName}'. You sure he works for us?`);
      process.exit(1);
    }

    if (typeof seeder.run !== 'function') {
      console.error(`This '${seederName}' guy doesn't know how to do his job (missing export run function).`);
      process.exit(1);
    }

    console.log(`Putting '${seederName}' to work...`);
    await seeder.run();

  } catch (err) {
    console.error("Fucking disaster:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected. We're done here.");
  }
}

main();
