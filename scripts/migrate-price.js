import mongoose from "mongoose";
import Toilet from "../backend/models/toilet.js"; 

const ALLOWED_PRICES = new Set(["€0.2", "€0.5", "€1", "€1.5", "€2"]);

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("Missing MONGO_URI");

  await mongoose.connect(uri);

  const cursor = Toilet.find({}).cursor();

  let total = 0;
  let changed = 0;
  let flagged = 0;

  for await (const doc of cursor) {
    total++;

    const price = doc.price;
    const updates = {};
    const unsets = {};

    if (price === "free") {
      updates.type = "free";
      unsets.price = 1;
    } else if (price === "free for customer") {
      updates.type = "free for customer";
      unsets.price = 1;
    } else if (typeof price === "string" && price.length > 0) {
      
      updates.type = "paid";

      if (!ALLOWED_PRICES.has(price)) {
        updates.migrationNote = `Invalid legacy price: ${price}`;
        flagged++;
      } else {
        updates.price = price;
      }
    } else {

      if (doc.type === "free" || doc.type === "free for customer") {
        unsets.price = 1;
      } else {
        updates.migrationNote = "Missing legacy price";
        flagged++;
      }
    }

    const hasUpdate = Object.keys(updates).length > 0;
    const hasUnset = Object.keys(unsets).length > 0;

    if (!hasUpdate && !hasUnset) continue;

    changed++;
    await Toilet.updateOne(
      { _id: doc._id },
      {
        ...(hasUpdate ? { $set: updates } : {}),
        ...(hasUnset ? { $unset: unsets } : {}),
      },
      { runValidators: false }
    );
  }

  console.log({ total, changed, flagged });
  
  const flaggedCount = await Toilet.countDocuments({ migrationNote: { $exists: true } });
  console.log("Flagged docs needing review:", flaggedCount);

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
