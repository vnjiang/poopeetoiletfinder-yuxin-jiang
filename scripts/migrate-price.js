import mongoose from "mongoose";
import Toilet from "../backend/models/toilet.js"; // 改成你真实路径

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
      // 你说：不是 free/free for customer 就都当 paid 保留 price string
      updates.type = "paid";

      // 保护：如果 enum 限制金额，这里做校验，否则会留下保存时炸掉的脏数据
      if (!ALLOWED_PRICES.has(price)) {
        // 不直接改坏数据，先标记出来
        updates.migrationNote = `Invalid legacy price: ${price}`;
        flagged++;
      } else {
        updates.price = price;
      }
    } else {
      // price 为空：不要硬改成 paid，否则会违反 paid 必填 price
      // 如果 type 已经是 free/free for customer，就确保 price 不存在
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

  // 看看需要人工处理的有多少
  const flaggedCount = await Toilet.countDocuments({ migrationNote: { $exists: true } });
  console.log("Flagged docs needing review:", flaggedCount);

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
