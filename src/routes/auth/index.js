const express = require("express");
const {
  getUserWithEmail,
  comparePasswords,
  createJwt,
} = require("../../actions/auth");
const { requireAuth } = require("../../middleware/auth");

const authRouter = express.Router();
const jsonBodyParser = express.json();

authRouter
  .route("/token")
  .post(jsonBodyParser, async (req, res, next) => {
    const { email, password } = req.body;
    const loginUser = { email, password };

    for (const [key, value] of Object.entries(loginUser))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`,
        });

    try {
      const dbUser = await getUserWithEmail(loginUser.email);

      if (!dbUser)
        return res.status(400).json({
          error: "Incorrect email or password",
        });

      const compareMatch = await comparePasswords(
        loginUser.password,
        dbUser.password
      );

      if (!compareMatch)
        return res.status(400).json({
          error: "Incorrect email or password",
        });

      const sub = dbUser.email;
      const payload = {
        user_id: dbUser.user_id,
        first_name: dbUser.first_name,
        last_name: dbUser.last_name,
      };
      res.send({
        authToken: createJwt(sub, payload),
      });
    } catch (error) {
      next(error);
    }
  })
  .put(requireAuth, (req, res) => {
    const sub = req.app_user.email;
    const payload = {
      user_id: req.app_user.user_id,
      first_name: req.app_user.first_name,
      last_name: req.app_user.last_name,
    };
    res.send({
      authToken: createJwt(sub, payload),
    });
  });

module.exports = authRouter;
