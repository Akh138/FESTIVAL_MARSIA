import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// On utilise createPool : la connexion ne se fermera plus jamais !
const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    port: process.env.DB_PORT || 3308,
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "marsia",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export default pool;