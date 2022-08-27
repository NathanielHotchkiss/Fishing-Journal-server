const express = require("express");
const db = require("../../db");
const {
  validatePassword,
  hasUserWithEmail,
  hashPassword,
} = require("../../actions/auth");

const jsonBodyParser = express.json();

const router = express.Router();

router

  .get("/:user_id", async (req, res) => {
    const { user_id } = req.params;
    const { rows: app_users } = await db.file("db/app_users/get_by_id.sql", {
      user_id,
    });
    res.json(app_users);
  })

  .post("/new", jsonBodyParser, async (req, res, next) => {
    const { password, email, first_name, last_name } = req.body;

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
      } = await db.file("db/app_users/put.sql", newUser);

      res.status(201).json(app_users);
    } catch (error) {
      next(error);
    }
  });

module.exports = router;
