const express = require("express");
const db = require("../../db");
const { requireAuth } = require("../../middleware/auth");

const jsonBodyParser = express.json();

const router = express.Router();

router
  .route("/")

  .post(jsonBodyParser, async (req, res, next) => {
    const {
      user_id,
      species,
      fish_length,
      pounds,
      ounces,
      bait,
      fishing_method,
    } = req.body;

    for (const field of ["species", "fish_length", "pounds", "ounces"])
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`,
        });
    try {
      const newLog = {
        user_id,
        species,
        fish_length,
        pounds,
        ounces,
        bait,
        fishing_method,
      };

      const {
        rows: [fishing_logs],
      } = await db.file("db/fishing_logs/post.sql", newLog);

      res.status(201).json(fishing_logs);
    } catch (error) {
      next(error);
    }
  });

router
  .route("/:fish_id")
  .all(checkLogExists)

  .get(async (req, res) => {
    const { fish_id } = req.params;
    const {
      rows: [fishing_logs],
    } = await db.file("db/fishing_logs/get_fish.sql", { fish_id });
    console.log(fishing_logs);
    res.json(fishing_logs);
  })

  .put(jsonBodyParser, async (req, res, next) => {
    const { fish_id } = req.params;

    console.log("req.body: ", req.body);
    console.log("fish_id: ", fish_id);
    const { species, fish_length, pounds, ounces, bait, fishing_method } =
      req.body;

    for (const field of ["species", "fish_length", "pounds", "ounces"])
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`,
        });
    try {
      const newFishingLog = {
        fish_id,
        species,
        fish_length,
        pounds,
        ounces,
        bait,
        fishing_method,
      };
      console.log("newFishingLog ", newFishingLog);
      console.log("fish_id: ", fish_id);

      const {
        rows: [fishing_logs],
      } = await db.file("db/fishing_logs/put.sql", newFishingLog);
      console.log("fishing logs: ", fishing_logs);
      res.status(201).json(fishing_logs);
    } catch (error) {
      next(error);
    }
  })

  .delete(async (req, res, next) => {
    const { fish_id } = req.params;
    await db
      .file("db/fishing_logs/delete.sql", { fish_id })
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

router
  .route("/user/:user_id")

  .get(async (req, res) => {
    const { user_id } = req.params;
    console.log(user_id);
    const { rows: fishing_logs } = await db.file(
      "db/fishing_logs/get_all_by_user.sql",
      { user_id }
    );
    res.json(fishing_logs);
  });

async function checkLogExists(req, res, next) {
  const { fish_id } = req.params;
  try {
    const fishingLog = await db.file("db/fishing_logs/get_fish.sql", {
      fish_id,
    });
    if (!fishingLog) {
      return res.status(404).json({
        error: "Log does not exist",
      });
    }
    res.fishingLog = fishingLog;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = router;
