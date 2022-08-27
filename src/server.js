const app = require("./app");
const db = require("./db");
const { NODE_ENV, PORT } = process.env;

process.on("SIGTERM", async () => {
  console.log("warn", "Process terminate signal received.");
  try {
    express.close(); // this may not be right
    console.log("SERVER HAS STOPPED ACCEPTING CONNECTIONS");
  } catch (e) {
    console.log("THERE WAS AN ERROR SHUTTING DOWN", e);
  } finally {
    process.exit(0);
  }
});

const migrate = async () => {
  console.log("warn", "Running migration script");
  try {
    await db.upgrade("./src/db", "db_migrate", ["db_functions", "db_triggers"]);
  } catch (e) {
    console.log("error in migrate", e);
    await db.end();
    console.log("Shutting down with error");
    process.exit(1);
  }
};

app.listen(PORT, async () => {
  await migrate();
  await db.load();
  console.log(
    `Server running in ${NODE_ENV} mode and listening at port: ${PORT}`
  );
});
