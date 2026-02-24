import express from "express";
import { register, login } from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import db from "../config/db.js";

const router = express.Router();

// inscription
router.post("/register", register);

// connexion
router.post("/login", login);

// renvoie l'utilisateur complet depuis la BDD
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const [rows] = await db.execute(
            "SELECT id_utilisateur, nom, prenom, email, nom_role, date_inscription, actif FROM utilisateur WHERE id_utilisateur = ?",
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        res.json({
            user: rows[0],
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

export default router;
