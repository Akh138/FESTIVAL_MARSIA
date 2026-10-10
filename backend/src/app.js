import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";

import path from "path";
import { fileURLToPath } from "url";

import userRoutes from "./routes/user.routes.js";
import createFilmRoutes from "./routes/films.js";
import db from "./config/db.js"; // connexion à ta BDD
import createNotificationsRoutes from "./routes/notifications.routes.js";
import createAdminRoutes from "./routes/admin.routes.js";
import createNewsletterRoutes from "./routes/newsletter.routes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ rendre /uploads accessible depuis le navigateur
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(cors());
app.use(express.json());

// routes utilisateurs
app.use("/api/v1/utilisateurs", userRoutes);

// routes films
app.use("/api/v1/films", createFilmRoutes(db));

// routes auth
app.use("/api/v1/auth", authRoutes);

// ✅ routes admin
app.use("/api/v1/admin", createAdminRoutes(db));

// ✅ routes newsletter
app.use("/api/v1/newsletter", createNewsletterRoutes(db));

// routes notifications
app.use("/api/v1/notifications", createNotificationsRoutes(db));

export default app;