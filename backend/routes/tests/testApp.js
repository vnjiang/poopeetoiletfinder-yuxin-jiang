const express = require("express");

function buildTestApp() {
  const app = express();
  app.use(express.json());

  app.use("/api/reviews", require("../reviewRoute"));
  app.use("/api/shared-toilets", require("../sharedToiletRoute"));
  app.use("/api/toilets", require("../toiletRoute"));

  return app;
}

module.exports = { buildTestApp };
