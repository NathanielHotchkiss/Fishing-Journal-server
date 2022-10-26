/* eslint-disable no-await-in-loop */
const { readFileSync, existsSync, watch, readdirSync } = require("fs");
const { Client, Pool } = require("pg");

require("dotenv").config();

const {
  DATABASE_URL,
  DEV_DATABASE_URL,
  NODE_ENV,
} = process.env;

NODE_ENV === "production" ? DATABASE_URL : DEV_DATABASE_URL;

const IS_DEV = NODE_ENV === "development";
const PREFIX = "go_"; // all types, functions, triggers should be prefixed this way

const db_config = {
  connectionString: DATABASE_URL,
  ssl: IS_DEV ? undefined : { rejectUnauthorized: false },
};

const pool = new Pool(db_config);

const db_client = new Client(db_config);

db_client.on("connect", () => {
  console.log("info", "Database Client Connected.");
});

const executeSQL = async (client, filename_or_sql) => {
  let sql = filename_or_sql;
  if (filename_or_sql.toLowerCase().endsWith(".sql")) {
    sql = readFileSync(filename_or_sql).toString();
  }
  let result;
  try {
    result = await client.query(sql);
  } catch (e) {
    const msg = `SQL error: ${filename_or_sql} (Line: ${
      (sql.substring(0, e.position).match(/\n/g) || []).length
    }): ${e}.`;
    console.error(msg);
    throw e;
  }
  return result;
};

const query = (text, params) => db_client.query(text, params);

const upgrade = async (dbRootPath, dbMigratePath, dbFunctionPaths = []) => {
  let droppedWrapper = false;
  /**
   * @description Drop the database wrapper
   * @param {object} c - A database client
   * @param {boolean} force
   */
  async function dropWrapper(c, force) {
    if (!force && droppedWrapper) {
      return;
    }
    const sqlLines = [];
    let result = await c.query(`
      SELECT 'DROP VIEW ' || table_name || ' CASCADE;' AS sql
      FROM information_schema.views
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      AND table_name LIKE '${PREFIX}%'`);
    for (const r of result.rows) {
      sqlLines.push(r.sql);
    }
    result = await c.query(`
      SELECT 'DROP TYPE IF EXISTS ' || ns.nspname || '.' || typname || ' CASCADE;' AS sql
       FROM pg_type INNER JOIN pg_namespace ns ON (pg_type.typnamespace = ns.oid)
       WHERE ns.nspname = 'public' AND typname LIKE '${PREFIX}%'`);
    for (const r of result.rows) {
      sqlLines.push(r.sql);
    }
    result = await c.query(`
      SELECT 'DROP FUNCTION IF EXISTS ' || ns.nspname || '.' || proname ||
       '(' || oidvectortypes(proargtypes) || ') CASCADE;' AS sql
       FROM pg_proc INNER JOIN pg_namespace ns ON (pg_proc.pronamespace = ns.oid)
       WHERE ns.nspname = 'public' AND pg_proc.prokind = 'f' AND proname LIKE '${PREFIX}%'`);
    for (const r of result.rows) {
      sqlLines.push(r.sql);
    }
    result = await c.query(`
      SELECT 'DROP PROCEDURE IF EXISTS ' || ns.nspname || '.' || proname ||
       '(' || oidvectortypes(proargtypes) || ') CASCADE;' AS sql
       FROM pg_proc INNER JOIN pg_namespace ns ON (pg_proc.pronamespace = ns.oid)
       WHERE ns.nspname = 'public' AND pg_proc.prokind = 'p' AND proname LIKE '${PREFIX}%'`);
    for (const r of result.rows) {
      sqlLines.push(r.sql);
    }
    await c.query(sqlLines.join(";"));

    if (!force) {
      droppedWrapper = true;
    }
  }

  const dbFunctionPathsFull = dbFunctionPaths
    .filter(Boolean)
    .map((dbPath) => `${dbRootPath}/${dbPath}`);

  /**
   * @description Create the database wrapper
   * @param {object} client
   * @param {boolean} forceDrop
   */
  async function createWrapper(client, forceDrop) {
    await client.query("BEGIN");
    // XXX get smart about functions by putting hash of code into db_migrate table
    await dropWrapper(client, forceDrop);
    try {
      for (const dbFunctionPath of dbFunctionPathsFull) {
        for (const sqlFilename of readdirSync(dbFunctionPath)) {
          // eslint-disable-next-line no-await-in-loop
          await executeSQL(client, `${dbFunctionPath}/${sqlFilename}`);
        }
      }
      await client.query("COMMIT");
      console.log(
        "warn",
        `Executed database wrapper scripts. (${dbFunctionPathsFull})`
      );
    } catch (e) {
      console.log(
        "error",
        `Failed to execute database wrapper scripts. (${dbFunctionPathsFull})`
      );
      console.log("Database wrapper error:", e); // Keep console log for full error details
      await client.query("ROLLBACK");
      throw new Error("Database Wrapper Failed");
    }
  }
  const client = new Client(db_config);
  await client.connect();
  try {
    const {
      rows: [postgresVersion],
    } = await client.query("SELECT version();");
    console.log("info", "Postgres Version: ", postgresVersion?.version);
    await client.query("BEGIN;");
    const {
      rows: [latestVersion],
    } = await executeSQL(
      client,
      "SELECT MAX(db_version) as latest from db_versions;"
    );
    let version = latestVersion.latest || 0;
    const basePath = `${dbRootPath}/${dbMigratePath}`;
    console.log("warn", `Current database version: ${version}`);
    while (
      version < 900 &&
      existsSync(`${basePath}/${Number(version) + 1}.sql`)
    ) {
      const startTime = new Date();
      console.log("warn", `Migrating the database to version: ${++version}`);
      await executeSQL(client, `${basePath}/${version}.sql`);
      console.log("warn", `Migrated to version: ${version}`);
      await executeSQL(
        client,
        `INSERT INTO db_versions (db_version) VALUES (${version})`
      );
      const runtime = new Date() - startTime;
      console.log(
        "info",
        `Migration to ${version} took ${runtime / 1000} seconds`
      );
    }
    if (existsSync(`${basePath}/pending.sql`)) {
      await dropWrapper(client);
      await executeSQL(
        client,
        `${basePath}/pending_undo.sql`,
        "Undid pending migration (pending_undo.sql).",
        true
      );
      await executeSQL(
        client,
        `${basePath}/pending.sql`,
        "Executed pending migration (pending.sql)."
      );
    }
    await client.query("COMMIT");

    if (dbFunctionPathsFull.length) {
      await createWrapper(client);
      console.log(
        "warn",
        `Watching database wrapper directories (${dbFunctionPathsFull}) for changes.`
      );
      dbFunctionPathsFull.forEach((dbFunctionPath) => {
        watch(`${dbFunctionPath}`, async () => {
          const c = await pool.connect();
          try {
            // Ignore errors because we aren't in PRODUCTION OR STAGING
            createWrapper(c, true).catch(() => {});
          } finally {
            await c.release();
          }
        });
      });
    }
  } catch (e) {
    console.error("error", "Error while migrating the database: ", e);
    await client.query("ROLLBACK");
    throw new Error("Database Upgrade Failed.");
  } finally {
    await client.end();
  }
};

const file = async (filePath, params = {}) => {
  let sql = readFileSync(`./src/${filePath}`).toString();
  const namedParams = [];
  const namedParam = (m) => {
    const p = m.slice(2, -1);
    const i = namedParams.indexOf(p);
    if (i >= 0) {
      return `$${i + 1}`;
    }
    namedParams.push(p);
    return `$${namedParams.length}`;
  };
  if (Object.keys(params)?.length) {
    sql = sql.replace(/\$\{[^{}]+\}/g, namedParam);
  }

  const args = [];
  if (namedParams.length) {
    for (const param of namedParams) {
      args.push(params[param]);
    }
  }
  const queryParams = { text: sql, values: args };
  return db_client.query(queryParams).catch((e) => {
    console.log("error", e);
    throw e;
  });
};

const end = async () => {
  console.log("warn", "Database connections shutting down.");
  await pool.end();
  await db_client.end();
  console.log("warn", "Databse connections successfully shutdown");
};

const load = async () => {
  console.log("warn", "Creating new database connection.");
  await db_client.connect();
};

module.exports = {
  query,
  upgrade,
  file,
  end,
  load,
};
