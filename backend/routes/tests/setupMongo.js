const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongo;

async function connectTestMongo() {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
}

async function clearTestMongo() {
  const cols = await mongoose.connection.db.collections();
  for (const c of cols) await c.deleteMany({});
}

async function closeTestMongo() {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
}

module.exports = { connectTestMongo, clearTestMongo, closeTestMongo };
