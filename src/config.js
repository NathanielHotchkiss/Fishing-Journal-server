module.exports = {
  PORT: process.env.PORT || 5050,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || "s0m3th1ng-s3cr3t",
  JWT_EXPIRY: 10000
};
