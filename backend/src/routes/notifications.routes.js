import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import requireRoles from "../middlewares/requireRoles.middleware.js";

export default function createNotificationsRoutes(db) {
    const router = express.Router();

    // =====================================================
    // LIRE LES NOTIFICATIONS
    // ADMIN + MANAGER
    // =====================================================
    router.get(
        "/",
        authMiddleware,
        requireRoles(["ADMIN", "MANAGER"]),
        async (req, res) => {
            try {
                const [rows] = await db.execute(
                    "SELECT * FROM notification ORDER BY date_envoi DESC"
                );

                res.json(rows);
            } catch (err) {
                console.error(err);
                res.status(500).json({ message: "Erreur serveur" });
            }
        }
    );

    // =====================================================
    // CREER UNE NOTIFICATION
    // ADMIN + MANAGER
    // =====================================================
    router.post(
        "/",
        authMiddleware,
        requireRoles(["ADMIN", "MANAGER"]),
        async (req, res) => {
            try {
                const { id_utilisateur, type_notification, contenu, lu } = req.body;

                await db.execute(
                    `INSERT INTO notification 
                    (id_utilisateur, type_notification, contenu, lu, date_envoi)
                    VALUES (?, ?, ?, ?, NOW())`,
                    [
                        id_utilisateur || null,
                        type_notification,
                        contenu,
                        lu ? 1 : 0
                    ]
                );

                res.status(201).json({ message: "Notification créée ✅" });
            } catch (err) {
                console.error(err);
                res.status(500).json({ message: "Erreur serveur" });
            }
        }
    );

    // =====================================================
    // MODIFIER UNE NOTIFICATION
    // ADMIN + MANAGER
    // =====================================================
    router.put(
        "/:id",
        authMiddleware,
        requireRoles(["ADMIN", "MANAGER"]),
        async (req, res) => {
            try {
                const id = Number(req.params.id);

                const { id_utilisateur, type_notification, contenu, lu } = req.body;

                const [result] = await db.execute(
                    `UPDATE notification
                     SET id_utilisateur=?, type_notification=?, contenu=?, lu=?
                     WHERE id_notification=?`,
                    [
                        id_utilisateur || null,
                        type_notification,
                        contenu,
                        lu ? 1 : 0,
                        id
                    ]
                );

                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: "Notification introuvable" });
                }

                res.json({ message: "Notification mise à jour ✅" });

            } catch (err) {
                console.error(err);
                res.status(500).json({ message: "Erreur serveur" });
            }
        }
    );

    // =====================================================
    // SUPPRIMER UNE NOTIFICATION
    // ADMIN + MANAGER
    // =====================================================
    router.delete(
        "/:id",
        authMiddleware,
        requireRoles(["ADMIN", "MANAGER"]),
        async (req, res) => {
            try {
                const id = Number(req.params.id);

                const [result] = await db.execute(
                    "DELETE FROM notification WHERE id_notification=?",
                    [id]
                );

                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: "Notification introuvable" });
                }

                res.json({ message: "Notification supprimée ✅" });

            } catch (err) {
                console.error(err);
                res.status(500).json({ message: "Erreur serveur" });
            }
        }
    );

    return router;
}