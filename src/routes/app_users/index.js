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
  .get("/", async (req, res) => {
    const { rows: app_users } = await db.file("db/app_users/get_all.sql");
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
        protocol: "email",
        password: hashedPassword,
        first_name,
        last_name,
      };

      const {
        rows: [user],
      } = await db.file("db/app_users/put.sql", newUser);

      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  });

module.exports = router;
