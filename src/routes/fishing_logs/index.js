const express = require("express");
const db = require("../../db");
const {requireAuth} = require("../../middleware/auth");

const jsonBodyParser = express.json();

const router = express.Router();

router

  .get("/", async (req, res) => {
    const { rows: fishing_logs } = await db.file("db/fishing_logs/get_all.sql");
    res.json(fishing_logs);
  })

  .get("/:user_id", requireAuth, async (req, res) => {
    const { user_id } = req.params;
    const { rows: fishing_logs } = await db.file(
      "db/fishing_logs/get_logs_by_id.sql",
      { user_id }
    );
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
      } = await db.file("db/fishing_logs/put.sql", newLog);

      res.status(201).json(fishing_logs);
    } catch (error) {
      next(error);
    }
  });

module.exports = router;
