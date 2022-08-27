const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../../db");
const config = require("../../config");

const REGEX_UPPER_LOWER_NUMBER_SPECIAL =
  /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const validatePassword = (password) => {
  if (password.length < 8) {
    return "Password be longer than 8 characters";
  }
  if (password.length > 72) {
    return "Password be less than 72 characters";
  }
  if (password.startsWith(" ") || password.endsWith(" ")) {
    return "Password must not start or end with empty spaces";
  }
  if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
    return "Password must contain one upper case, lower case, number and special character";
  }
  return null;
};

const hashPassword = (password) => bcrypt.hash(password, 12);

const getUserWithEmail = async (email) => {
  const {
    rows: [user],
  } = await db.file("db/app_users/get_by_email.sql", { emails: [email] });
  console.log("USER", user);
  return user;
};

const hasUserWithEmail = async (email) => {
  const user = await getUserWithEmail(email);
  return !!user;
};

const comparePasswords = (password, hash) => bcrypt.compare(password, hash);

const createJwt = (subject, payload) =>
  jwt.sign(payload, config.JWT_SECRET, {
    subject,
    expiresIn: config.JWT_EXPIRY,
    algorithm: "HS256",
  });

const verifyJwt = (token) =>
  jwt.verify(token, config.JWT_SECRET, {
    algorithms: ["HS256"],
  });

module.exports = {
  validatePassword,
  hashPassword,
  getUserWithEmail,
  hasUserWithEmail,
  comparePasswords,
  createJwt,
  verifyJwt,
};
