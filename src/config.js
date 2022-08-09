module.exports = {
  PORT: process.env.PORT || 8080,
  NODE_ENV: process.env.NODE_ENV || "development",
  JWT_SECRET: process.env.JWT_SECRET || "this-is-a-super-secret-password",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "3h",
};
