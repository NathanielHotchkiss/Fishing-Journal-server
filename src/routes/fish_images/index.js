const express = require("express");
const db = require("../../db");
const { requireAuth } = require("../../middleware/auth");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Create multer object
const imageUpload = multer({
  dest: "images",
});

router
  .route("/image")

  .post(imageUpload.single("image"), async (req, res, next) => {
    const { log_id } = req.body;
    const { filename, mimetype, size } = req.file;
    const filepath = req.file.path;

    try {
      const newImage = {
        log_id,
        filename,
        filepath,
        mimetype,
        size,
      };

      const {
        rows: [fish_images],
      } = await db.file("db/fish_images/post.sql", newImage);

      res.status(201).json(fish_images);
    } catch (error) {
      next(error);
    }
  });

router
  .route("/image/:filename")

  // Image Get Routes
  .get(async (req, res) => {
    const { filename } = req.params;
    await db
      .file("db/fish_images/get.sql", { filename })
      .then((images) => {
        if (images[0]) {
          const dirname = path.resolve();
          const fullfilepath = path.join(dirname, images[0].filepath);
          return res.type(images[0].mimetype).sendFile(fullfilepath);
        }
        return Promise.reject(new Error("Image does not exist"));
      })
      .catch((err) =>
        res
          .status(404)
          .json({ success: false, message: "not found", stack: err.stack })
      );
  });

//   .get(async (req, res) => {
//     const { fish_id } = req.params;
//     const {
//       rows: [fishing_logs],
//     } = await db.file("db/fishing_logs/get_fish.sql", { fish_id });
//     res.json(fishing_logs);
//   })

module.exports = router;
