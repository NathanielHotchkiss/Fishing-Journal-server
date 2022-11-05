const express = require("express");
const db = require("../../db");
const { requireAuth } = require("../../middleware/auth");

const multer = require("multer");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

const { uploadFile, getFileStream } = require("../../actions/S3");

const jsonBodyParser = express.json();

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router
  .route("/")
  .all(requireAuth)

  .post(upload.single("image"), async (req, res, next) => {
    const {
      body: {
        user_id,
        species,
        fish_length,
        pounds,
        ounces,
        bait,
        fishing_method,
      },
    } = req;

    let filename = null,
      filepath = null,
      mimetype = null,
      size = null;

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
        filename,
        filepath,
        mimetype,
        size,
      };

      if (req.file) {
        let { file: { filename, mimetype, size } = {} } = req;
        let filepath = req.file.path;

        await uploadFile(req.file);

        await unlinkFile(filepath);
      }

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
  .all(checkLogExists, requireAuth)

  .get(async (req, res) => {
    const { fish_id } = req.params;

    const {
      rows: [fishing_logs],
    } = await db.file("db/fishing_logs/get.sql", { fish_id });

    const key = fishing_logs.filename;
    const readStream = getFileStream(key);

    readStream.pipe(res);

    res.json(fishing_logs);
  })

  .put(jsonBodyParser, async (req, res, next) => {
    const { fish_id } = req.params;

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
        filename,
        filepath,
        mimetype,
        size,
      };

      const {
        rows: [fishing_logs],
      } = await db.file("db/fishing_logs/put.sql", newFishingLog);

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
  .all(requireAuth)

  .get(async (req, res) => {
    const { user_id } = req.params;

    const { rows: fishing_logs } = await db.file(
      "db/fishing_logs/get_all_by_user.sql",
      { user_id }
    );

    res.json(fishing_logs);
  });

async function checkLogExists(req, res, next) {
  const { fish_id } = req.params;
  try {
    const fishingLog = await db.file("db/fishing_logs/get.sql", {
      fish_id,
    });
    if (!fishingLog) {
      return res.status(404).json({
        error: "Log does not exist.",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = router;
