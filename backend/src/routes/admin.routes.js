// src/routes/admin.routes.js

import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import requireRoles from "../middlewares/requireRoles.middleware.js";
import bcrypt from "bcrypt";

export default function createAdminRoutes(db) {
    const router = express.Router();

    // ============================================================
    // STATS DU BACKOFFICE
    // ADMIN + MANAGER peuvent voir les statistiques
    // ============================================================
    router.get(
        "/stats",
        authMiddleware,
        requireRoles(["ADMIN", "MANAGER"]),
        async (req, res) => {
            try {
                const [
                    [filmsTotalRows],
                    [filmsAttenteRows],
                    [filmsApprouvesRows],
                    [filmsRejetesRows],
                    [votesTotalRows],
                    [realisateursTotalRows],
                    [juryTotalRows],
                    [adminTotalRows],
                    [managerTotalRows],
                ] = await Promise.all([
                    db.execute("SELECT COUNT(*) AS total FROM film"),
                    db.execute("SELECT COUNT(*) AS total FROM film WHERE statut_moderation = 'en attente'"),
                    db.execute("SELECT COUNT(*) AS total FROM film WHERE statut_moderation = 'approuve'"),
                    db.execute("SELECT COUNT(*) AS total FROM film WHERE statut_moderation = 'rejete'"),
                    db.execute("SELECT COUNT(*) AS total FROM vote"),
                    db.execute("SELECT COUNT(*) AS total FROM utilisateur WHERE nom_role = 'REALISATEUR'"),
                    db.execute("SELECT COUNT(*) AS total FROM utilisateur WHERE nom_role = 'JURY'"),
                    db.execute("SELECT COUNT(*) AS total FROM utilisateur WHERE nom_role = 'ADMIN'"),
                    db.execute("SELECT COUNT(*) AS total FROM utilisateur WHERE nom_role = 'MANAGER'"),
                ]);

                res.json({
                    films: {
                        total: filmsTotalRows[0].total,
                        en_attente: filmsAttenteRows[0].total,
                        approuves: filmsApprouvesRows[0].total,
                        rejetes: filmsRejetesRows[0].total,
                    },
                    votes: {
                        total: votesTotalRows[0].total,
                    },
                    utilisateurs: {
                        realisateurs: realisateursTotalRows[0].total,
                        jury: juryTotalRows[0].total,
                        admin: adminTotalRows[0].total,
                        manager: managerTotalRows[0].total,
                    },
                });
            } catch (err) {
                console.error(err);
                res.status(500).json({ message: "Erreur serveur" });
            }
        }
    );

    // ============================================================
    // GESTION DES UTILISATEURS
    // Tout ce bloc reste ADMIN uniquement
    // Le manager ne peut pas valider ni modifier les comptes
    // ============================================================

    // GET /api/v1/admin/users
    // supporte ?actif=1 ou ?actif=0
    router.get(
        "/users",
        authMiddleware,
        requireRoles(["ADMIN"]),
        async (req, res) => {
            try {
                const { actif } = req.query;

                let sql = "SELECT id_utilisateur, nom, prenom, email, nom_role, date_inscription, actif FROM utilisateur";
                const params = [];

                // si actif est passé dans l'url
                if (actif === "0" || actif === "1") {
                    sql += " WHERE actif = ?";
                    params.push(Number(actif));
                }

                sql += " ORDER BY id_utilisateur DESC";

                const [rows] = await db.execute(sql, params);
                res.json(rows);
            } catch (err) {
                console.error(err);
                res.status(500).json({ message: "Erreur serveur" });
            }
        }
    );

    // POST /api/v1/admin/users
    // création manuelle d'un utilisateur par l'admin
    router.post(
        "/users",
        authMiddleware,
        requireRoles(["ADMIN"]),
        async (req, res) => {
            try {
                const { nom, prenom, email, mot_de_passe, nom_role, actif } = req.body;

                if (!nom || !prenom || !email || !mot_de_passe) {
                    return res.status(400).json({
                        message: "nom, prenom, email, mot_de_passe requis"
                    });
                }

                const allowedRoles = ["PUBLIC", "JURY", "REALISATEUR", "ADMIN", "MANAGER"];
                const roleFinal = allowedRoles.includes(nom_role) ? nom_role : "PUBLIC";

                const hash = await bcrypt.hash(String(mot_de_passe), 10);

                await db.execute(
                    `INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, nom_role, actif)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [nom, prenom, email, hash, roleFinal, actif === false ? 0 : 1]
                );

                res.status(201).json({ message: "Utilisateur créé ✅" });
            } catch (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({ message: "Email déjà utilisé" });
                }
                console.error(err);
                res.status(500).json({ message: "Erreur serveur" });
            }
        }
    );

    // PUT /api/v1/admin/users/:id
    // modification d'un utilisateur
    router.put(
        "/users/:id",
        authMiddleware,
        requireRoles(["ADMIN"]),
        async (req, res) => {
            try {
                const id = Number(req.params.id);

                if (!Number.isInteger(id)) {
                    return res.status(400).json({ message: "id invalide" });
                }

                const { nom, prenom, email, mot_de_passe, nom_role, actif } = req.body;

                const allowedRoles = ["PUBLIC", "JURY", "REALISATEUR", "ADMIN", "MANAGER"];
                const roleFinal = allowedRoles.includes(nom_role) ? nom_role : "PUBLIC";

                // si un nouveau mot de passe est envoyé
                if (mot_de_passe && String(mot_de_passe).trim() !== "") {
                    const hash = await bcrypt.hash(String(mot_de_passe), 10);

                    const [result] = await db.execute(
                        `UPDATE utilisateur
                         SET nom = ?, prenom = ?, email = ?, nom_role = ?, actif = ?, mot_de_passe = ?
                         WHERE id_utilisateur = ?`,
                        [
                            nom ?? null,
                            prenom ?? null,
                            email ?? null,
                            roleFinal,
                            actif === false ? 0 : 1,
                            hash,
                            id,
                        ]
                    );

                    if (result.affectedRows === 0) {
                        return res.status(404).json({ message: "Utilisateur non trouvé" });
                    }

                    return res.json({ message: "Utilisateur mis à jour ✅" });
                }

                // mise à jour sans changer le mot de passe
                const [result] = await db.execute(
                    `UPDATE utilisateur
                     SET nom = ?, prenom = ?, email = ?, nom_role = ?, actif = ?
                     WHERE id_utilisateur = ?`,
                    [
                        nom ?? null,
                        prenom ?? null,
                        email ?? null,
                        roleFinal,
                        actif === false ? 0 : 1,
                        id,
                    ]
                );

                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: "Utilisateur non trouvé" });
                }

                res.json({ message: "Utilisateur mis à jour ✅" });
            } catch (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({ message: "Email déjà utilisé" });
                }
                console.error(err);
                res.status(500).json({ message: "Erreur serveur" });
            }
        }
    );

    // DELETE /api/v1/admin/users/:id
    // on désactive au lieu de supprimer vraiment
    router.delete(
        "/users/:id",
        authMiddleware,
        requireRoles(["ADMIN"]),
        async (req, res) => {
            try {
                const id = Number(req.params.id);

                if (!Number.isInteger(id)) {
                    return res.status(400).json({ message: "id invalide" });
                }

                const [result] = await db.execute(
                    "UPDATE utilisateur SET actif = 0 WHERE id_utilisateur = ?",
                    [id]
                );

                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: "Utilisateur non trouvé" });
                }

                res.json({ message: "Utilisateur désactivé ✅" });
            } catch (err) {
                console.error(err);
                res.status(500).json({ message: "Erreur serveur" });
            }
        }
    );

    return router;
}