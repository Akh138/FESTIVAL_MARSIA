import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";

import userRoutes from "./routes/user.routes.js";
import createFilmRoutes from "./routes/films.js";
import db from "./config/db.js"; // connexion à ta BDD
import createAdminRoutes from "./routes/admin.routes.js";

const app = express();

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

export default app;
