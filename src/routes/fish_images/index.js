const express = require("express");
const db = require("../../db");
const multer = require("multer");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

const { requireAuth } = require("../../middleware/auth");
const { uploadFile, getFileStream } = require("../../actions/s3");

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router
  .route("/")

  .post(upload.single("image"), async (req, res, next) => {
    const { fish_id } = req.body;
    const { file: { filename, mimetype, size } = {} } = req;

    const filepath = req.file.path;

    try {
      const newImage = {
        fish_id,
        filename,
        filepath,
        mimetype,
        size,
      };

      await uploadFile(req.file);

      await unlinkFile(filepath);

      const {
        rows: [fish_images],
      } = await db.file("db/fish_images/post.sql", newImage);

      res.status(201).json(fish_images);
    } catch (error) {
      next(error);
    }
  });

router
  .route("/:key")

  .get((req, res) => {
    console.log(req.params);
    const key = req.params.key;
    const readStream = getFileStream(key);

    readStream.pipe(res);
  });

module.exports = router;
