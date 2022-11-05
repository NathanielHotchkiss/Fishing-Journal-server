const express = require("express");
const db = require("../../db");
const { requireAuth } = require("../../middleware/auth");

const jsonBodyParser = express.json();

const router = express.Router();

router
  .route("/")

  .post(jsonBodyParser, requireAuth, async (req, res, next) => {
    const { user_id, title, description, type } = req.body;

    for (const field of ["title", "type"])
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`,
        });
    try {
      const newSpecies = {
        user_id,
        title,
        description,
        type,
      };

      const {
        rows: [species],
      } = await db.file("db/species/post.sql", newSpecies);

      res.status(201).json(species);
    } catch (error) {
      next(error);
    }
  });

router
  .route("/:species_id")
  .all(checkSpeciesExists, requireAuth)

  .get(async (req, res) => {
    const { species_id } = req.params;
    const {
      rows: [species],
    } = await db.file("db/species/get_species.sql", { species_id });
    res.json(species);
  })

  .put(jsonBodyParser, async (req, res, next) => {
    const { species_id } = req.params;

    const { title, description, type } = req.body;

    for (const field of ["title", "type"])
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`,
        });
    try {
      const newSpecies = {
        species_id,
        title,
        description,
        type,
      };

      const {
        rows: [species],
      } = await db.file("db/species/put.sql", newSpecies);

      res.status(201).json(species);
    } catch (error) {
      next(error);
    }
  })

  .delete(async (req, res, next) => {
    const { species_id } = req.params;
    await db
      .file("db/species/delete.sql", { species_id })
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

router
  .route("/user/:user_id")

  .get(requireAuth, async (req, res) => {
    const { user_id } = req.params;

    const { rows: tackle } = await db.file("db/species/get_all_by_user.sql", {
      user_id,
    });
    res.json(tackle);
  });

async function checkSpeciesExists(req, res, next) {
  const { species_id } = req.params;
  try {
    const species = await db.file("db/species/get_species.sql", {
      species_id,
    });
    if (!species) {
      return res.status(404).json({
        error: "Species does not exist",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = router;
