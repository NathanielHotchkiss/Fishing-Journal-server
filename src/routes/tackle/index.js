const express = require("express");
const db = require("../../db");
const { requireAuth } = require("../../middleware/auth");

const jsonBodyParser = express.json();

const router = express.Router();

router
  .route("/")

  .post(jsonBodyParser, async (req, res, next) => {
    const { user_id, title, description, type } = req.body;

    for (const field of ["title", "description", "type"])
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`,
        });
    try {
      const newTackle = {
        user_id,
        title,
        description,
        type,
      };

      const {
        rows: [tackle],
      } = await db.file("db/tackle/post.sql", newTackle);

      res.status(201).json(tackle);
    } catch (error) {
      next(error);
    }
  });

router
  .route("/:tackle_id")
  .all(checkTackleExists, requireAuth)

  .get(async (req, res) => {
    const { tackle_id } = req.params;
    const {
      rows: [tackle],
    } = await db.file("db/tackle/get_tackle.sql", { tackle_id });
    res.json(tackle);
  })

  .put(jsonBodyParser, async (req, res, next) => {
    const { tackle_id } = req.params;

    const { title, description, type } = req.body;

    for (const field of ["title", "description", "type"])
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`,
        });
    try {
      const newTackle = {
        tackle_id,
        title,
        description,
        type,
      };

      const {
        rows: [tackle],
      } = await db.file("db/tackle/put.sql", newTackle);

      res.status(201).json(tackle);
    } catch (error) {
      next(error);
    }
  })

  .delete(async (req, res, next) => {
    const { tackle_id } = req.params;
    await db
      .file("db/tackle/delete.sql", { tackle_id })
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

router
  .route("/user/:user_id")

  .get(requireAuth, async (req, res) => {
    const { user_id } = req.params;

    const { rows: tackle } = await db.file(
      "db/tackle/get_all_by_user.sql",
      { user_id }
    );
    res.json(tackle);
  });

async function checkTackleExists(req, res, next) {
  const { tackle_id } = req.params;
  try {
    const tackle = await db.file("db/tackle/get_tackle.sql", {
      tackle_id,
    });
    if (!tackle) {
      return res.status(404).json({
        error: "Tackle does not exist",
      });
    }
    res.locals.tackle = tackle;

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = router;
