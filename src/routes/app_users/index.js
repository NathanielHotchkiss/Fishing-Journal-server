const express = require("express");
const db = require("../../db");
const { requireAuth } = require("../../middleware/auth");
const {
  validatePassword,
  hasUserWithEmail,
  hashPassword,
} = require("../../actions/auth");

const jsonBodyParser = express.json();

const router = express.Router();

router
  .route("/")

  .post(jsonBodyParser, async (req, res, next) => {
    const { password, email, first_name, last_name } = req.body;

    email = toLowercase(email);

    for (const field of ["first_name", "last_name", "email", "password"])
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`,
        });

    try {
      const passwordError = validatePassword(password);

      if (passwordError) {
        return res.status(400).json({ error: passwordError });
      }

      const hasUserWithemail = await hasUserWithEmail(email);

      if (hasUserWithemail) {
        return res.status(400).json({ error: `email already taken` });
      }

      const hashedPassword = await hashPassword(password);

      const newUser = {
        email,
        password: hashedPassword,
        first_name,
        last_name,
      };

      const {
        rows: [app_users],
      } = await db.file("db/app_users/post.sql", newUser);
      res.status(201).json(app_users);
    } catch (error) {
      next(error);
    }
  });

router
  .route("/:user_id")
  .all(requireAuth)

  .get(async (req, res) => {
    const { user_id } = req.params;
    const {
      rows: [app_users],
    } = await db.file("db/app_users/get_by_id.sql", {
      user_id,
    });
    res.json(app_users);
  })

  .put(jsonBodyParser, async (req, res, next) => {
    const { user_id } = req.params;

    const { first_name, last_name, email } = req.body;

    email = toLowercase(email);

    for (const field of ["first_name", "last_name", "email"])
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`,
        });
    try {
      const newUser = {
        user_id,
        first_name,
        last_name,
        email,
      };

      const {
        rows: [app_users],
      } = await db.file("db/app_users/put.sql", newUser);

      res.status(201).json(app_users);
    } catch (error) {
      next(error);
    }
  })

  .delete(async (req, res, next) => {
    const { user_id } = req.params;
    await db
      .file("db/app_users/delete.sql", { user_id })
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = router;
