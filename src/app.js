const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const { NODE_ENV } = require("./config");

const app_users = require("./routes/app_users");
const auth = require("./routes/auth");
const fishing_logs = require("./routes/fishing_logs");
const species = require("./routes/species");
const tackle = require("./routes/tackle");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(cors());
app.use(helmet());
app.use(morgan(morganOption));

app.use("/app_users", app_users);
app.use("/auth", auth);
app.use("/fishing_logs", fishing_logs);
app.use("/species", species);
app.use("/tackle", tackle);

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "Internal Server Error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
