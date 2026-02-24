import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

export default db;
