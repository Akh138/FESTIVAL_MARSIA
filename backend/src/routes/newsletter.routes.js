import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import requireRoles from "../middlewares/requireRoles.middleware.js";

export default function createNewsletterRoutes(db) {
    const router = express.Router();

    // ======================================================
    // INSCRIPTION NEWSLETTER
    // Route publique, tout le monde peut s’inscrire
    // ======================================================
    router.post("/subscribe", async (req, res) => {
        try {
            const { email, langue } = req.body;

            if (!email) {
                return res.status(400).json({ message: "Email obligatoire" });
            }

            const langueFinal = langue === "EN" ? "EN" : "FR";

            const [existing] = await db.execute(
                "SELECT id_news FROM newsletter WHERE email = ?",
                [email]
            );

            if (existing.length > 0) {
                return res.status(200).json({
                    success: true,
                    message: "Déjà inscrit"
                });
            }

            await db.execute(
                `INSERT INTO newsletter (email, langue, confirme, date_inscription)
                 VALUES (?, ?, 0, NOW())`,
                [email, langueFinal]
            );

            return res.status(201).json({
                success: true,
                message: "Inscription newsletter OK"
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Erreur serveur" });
        }
    });

    // ======================================================
    // LIRE LES INSCRIPTIONS NEWSLETTER
    // ADMIN + MANAGER
    // ======================================================
    router.get(
        "/",
        authMiddleware,
        requireRoles(["ADMIN", "MANAGER"]),
        async (req, res) => {
            try {
                const [rows] = await db.execute(
                    "SELECT * FROM newsletter ORDER BY id_news DESC"
                );
                res.json(rows);
            } catch (err) {
                console.error(err);
                res.status(500).json({ message: "Erreur serveur" });
            }
        }
    );

    // ======================================================
    // MODIFIER UNE INSCRIPTION NEWSLETTER
    // ADMIN + MANAGER
    // ======================================================
    router.put(
        "/:id",
        authMiddleware,
        requireRoles(["ADMIN", "MANAGER"]),
        async (req, res) => {
            try {
                const id = Number(req.params.id);
                const { email, langue, confirme } = req.body;

                const langueFinal = langue === "EN" ? "EN" : "FR";
                const confirmeFinal = confirme ? 1 : 0;

                const [result] = await db.execute(
                    `UPDATE newsletter
                     SET email = ?, langue = ?, confirme = ?
                     WHERE id_news = ?`,
                    [email, langueFinal, confirmeFinal, id]
                );

                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: "Inscription introuvable" });
                }

                res.json({ message: "Newsletter mise à jour ✅" });
            } catch (err) {
                console.error(err);
                res.status(500).json({ message: "Erreur serveur" });
            }
        }
    );

    // ======================================================
    // SUPPRIMER UNE INSCRIPTION NEWSLETTER
    // ADMIN + MANAGER
    // ======================================================
    router.delete(
        "/:id",
        authMiddleware,
        requireRoles(["ADMIN", "MANAGER"]),
        async (req, res) => {
            try {
                const id = Number(req.params.id);

                const [result] = await db.execute(
                    "DELETE FROM newsletter WHERE id_news = ?",
                    [id]
                );

                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: "Inscription introuvable" });
                }

                res.json({ message: "Inscription supprimée ✅" });
            } catch (err) {
                console.error(err);
                res.status(500).json({ message: "Erreur serveur" });
            }
        }
    );

    return router;
}