const express = require("express");
const db = require("../../db");
const { requireAuth } = require("../../middleware/auth");

const jsonBodyParser = express.json();

const router = express.Router();

router

  .get("/", async (req, res) => {
    const { rows: fishing_logs } = await db.file("db/fishing_logs/get_all.sql");
    res.json(fishing_logs);
  })

  .get("/:user_id", async (req, res) => {
    const { user_id } = req.params;
    const { rows: fishing_logs } = await db.file(
      "db/fishing_logs/get_by_id.sql",
      { user_id }
    );
    res.json(fishing_logs);
  })

  .delete("/:fish_id", async (req, res, next) => {
    const { fish_id } = req.params;
    await db
      .file("db/fishing_logs/delete.sql", { fish_id })
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })

  .put("/:fish_id", jsonBodyParser, async (req, res, next) => {
    const { fish_id } = req.params;

    console.log("req.body: ", req.body);
    console.log("fish_id: ", fish_id);
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
      const newFishingLog = {
        user_id,
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
      } = await db.file("db/fishing_logs/put.sql", newFishingLog, fish_id);
      console.log("fishing logs: ", fishing_logs);
      res.status(201).json(fishing_logs);
    } catch (error) {
      next(error);
    }
  })

  .get("/get/:fish_id", async (req, res) => {
    const { fish_id } = req.params;
    const {
      rows: [fishing_logs],
    } = await db.file("db/fishing_logs/get_by_id_fish.sql", { fish_id });
    console.log(fishing_logs);
    res.json(fishing_logs);
  })

  .post("/new", jsonBodyParser, async (req, res, next) => {
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

module.exports = router;
