// const { Pool } = require("pg");
// require("dotenv").config();

// const pool = new Pool({
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     database: process.env.DB_NAME,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     max: 10,
//     idleTimeoutMillis: 30000,
//     connectionTimeoutMillis: 2000
// });

// pool.on("connect", () => {
//     console.log("PostgreSQL database connected");
// });

// pool.on("error", (err) => {
//     console.error("Unexpected PostgreSQL error:", err);
// });

// module.exports = pool;

const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Neon ya external cloud databases ke liye zaroori hai
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});

pool.on("connect", () => {
    console.log("PostgreSQL database connected");
});

pool.on("error", (err) => {
    console.error("Unexpected PostgreSQL error:", err);
});

module.exports = pool;