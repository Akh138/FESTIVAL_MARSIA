// src/routes/films.js
import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import requireRoles from "../middlewares/requireRoles.middleware.js";
import optionalAuth from "../middlewares/optionalAuth.middleware.js";

export default function createFilmRoutes(db) {
    const router = express.Router();

    // ✅ GET tous les films
    router.get("/", optionalAuth, async (req, res) => {
        try {
            const { statut } = req.query;

            let query = `
                SELECT f.*, u.nom as realisateur_nom, u.prenom as realisateur_prenom
                FROM film f
                         JOIN utilisateur u ON f.id_realisateur = u.id_utilisateur
            `;
            const params = [];

            const role = req.user?.role;
            const userId = req.user?.id;

            if (!role) {
                query += ` WHERE f.statut_moderation = 'approuve'`;
            } else if (role === "REALISATEUR") {
                query += ` WHERE (f.id_realisateur = ? OR f.statut_moderation = 'approuve')`;
                params.push(userId);
            } else if (role === "ADMIN" || role === "JURY") {
                // rien
            } else {
                query += ` WHERE f.statut_moderation = 'approuve'`;
            }

            if (statut) {
                if (role === "ADMIN" || role === "JURY") {
                    if (query.includes(" WHERE ")) {
                        query += ` AND f.statut_moderation = ?`;
                    } else {
                        query += ` WHERE f.statut_moderation = ?`;
                    }
                    params.push(statut);
                }
            }

            const [results] = await db.execute(query, params);
            res.json(results);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Erreur serveur" });
        }
    });

    // 🔒 ADMIN : films en attente de modération
    // ⚠️ doit être AVANT "/:id"
    router.get(
        "/en-attente",
        authMiddleware,
        requireRoles(["ADMIN"]),
        async (req, res) => {
            try {
                const [rows] = await db.execute(
                    `
                        SELECT f.*, u.nom as realisateur_nom, u.prenom as realisateur_prenom, u.email as realisateur_email
                        FROM film f
                                 JOIN utilisateur u ON f.id_realisateur = u.id_utilisateur
                        WHERE f.statut_moderation = 'en attente'
                        ORDER BY f.id_film DESC
                    `
                );

                res.json(rows);
            } catch (err) {
                console.error(err);
                res.status(500).json({ message: "Erreur serveur" });
            }
        }
    );

    // 🔒 ADMIN : classement des films approuvés (moyenne + nb votes)
    // ⚠️ doit être AVANT "/:id"
    router.get(
        "/classement",
        authMiddleware,
        requireRoles(["ADMIN"]),
        async (req, res) => {
            try {
                const [rows] = await db.execute(
                    `
                        SELECT
                            f.id_film,
                            f.titre,
                            f.pays,
                            f.lien_youtube,
                            f.statut_moderation,
                            u.nom AS realisateur_nom,
                            u.prenom AS realisateur_prenom,
                            COUNT(v.id_vote) AS nb_votes,
                            ROUND(AVG(v.note), 2) AS moyenne
                        FROM film f
                                 JOIN utilisateur u ON u.id_utilisateur = f.id_realisateur
                                 LEFT JOIN vote v ON v.id_film = f.id_film
                        WHERE f.statut_moderation = 'approuve'
                        GROUP BY f.id_film
                        ORDER BY moyenne DESC, nb_votes DESC, f.id_film DESC
                    `
                );

                res.json(rows);
            } catch (err) {
                console.error(err);
                res.status(500).json({ message: "Erreur serveur" });
            }
        }
    );

    // ✅ PUBLIC : position d’un film dans le classement (uniquement si approuvé)
    // GET /api/v1/films/:id/classement-position
    router.get("/:id/classement-position", async (req, res) => {
        try {
            const id_film = Number(req.params.id);

            if (!Number.isInteger(id_film)) {
                return res.status(400).json({ message: "id_film invalide" });
            }

            // On utilise un classement basé sur la même logique que /classement (moyenne desc, nb_votes desc, id desc)
            // MySQL 8+ : window functions OK
            const [rows] = await db.execute(
                `
                    WITH classement AS (
                        SELECT
                            f.id_film,
                            f.titre,
                            COUNT(v.id_vote) AS nb_votes,
                            ROUND(AVG(v.note), 2) AS moyenne,
                            RANK() OVER (
                            ORDER BY
                                ROUND(AVG(v.note), 2) DESC,
                                COUNT(v.id_vote) DESC,
                                f.id_film DESC
                        ) AS position
                    FROM film f
                        LEFT JOIN vote v ON v.id_film = f.id_film
                    WHERE f.statut_moderation = 'approuve'
                    GROUP BY f.id_film
                        )
                    SELECT id_film, titre, nb_votes, moyenne, position
                    FROM classement
                    WHERE id_film = ?
                        LIMIT 1
                `,
                [id_film]
            );

            if (rows.length === 0) {
                // soit film inexistant, soit pas approuvé => pas visible public
                return res.status(404).json({ message: "Film non trouvé (ou non approuvé)" });
            }

            return res.json(rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Erreur serveur" });
        }
    });

    // 🔒 REALISATEUR : stats d’un de ses films (nb votes, moyenne, min/max)
    // GET /api/v1/films/:id/mes-stats
    router.get(
        "/:id/mes-stats",
        authMiddleware,
        requireRoles(["REALISATEUR"]),
        async (req, res) => {
            try {
                const id_film = Number(req.params.id);
                const userId = req.user.id;

                if (!Number.isInteger(id_film)) {
                    return res.status(400).json({ message: "id_film invalide" });
                }

                // 1) Vérifier que le film existe + appartient au realisateur connecté
                const [films] = await db.execute(
                    `
                        SELECT id_film, id_realisateur, titre, statut_moderation
                        FROM film
                        WHERE id_film = ?
                            LIMIT 1
                    `,
                    [id_film]
                );

                if (films.length === 0) {
                    return res.status(404).json({ message: "Film non trouvé" });
                }

                const film = films[0];

                if (film.id_realisateur !== userId) {
                    return res.status(403).json({ message: "Accès refusé : ce film ne vous appartient pas" });
                }

                // 2) Stats votes
                const [statsRows] = await db.execute(
                    `
                        SELECT
                            COUNT(id_vote) AS nb_votes,
                            ROUND(AVG(note), 2) AS moyenne,
                            MAX(note) AS meilleure_note,
                            MIN(note) AS pire_note
                        FROM vote
                        WHERE id_film = ?
                    `,
                    [id_film]
                );

                const stats = statsRows[0] || {
                    nb_votes: 0,
                    moyenne: null,
                    meilleure_note: null,
                    pire_note: null
                };

                return res.json({
                    id_film: film.id_film,
                    titre: film.titre,
                    statut_moderation: film.statut_moderation,
                    nb_votes: Number(stats.nb_votes) || 0,
                    moyenne: stats.moyenne !== null ? Number(stats.moyenne) : null,
                    meilleure_note: stats.meilleure_note !== null ? Number(stats.meilleure_note) : null,
                    pire_note: stats.pire_note !== null ? Number(stats.pire_note) : null
                });
            } catch (err) {
                console.error(err);
                res.status(500).json({ message: "Erreur serveur" });
            }
        }
    );

    // ✅ GET film par ID
    router.get("/:id", optionalAuth, async (req, res) => {
        try {
            const { id } = req.params;

            const [results] = await db.execute(
                `
                    SELECT f.*, u.nom as realisateur_nom, u.prenom as realisateur_prenom
                    FROM film f
                             JOIN utilisateur u ON f.id_realisateur = u.id_utilisateur
                    WHERE f.id_film = ?
                `,
                [id]
            );

            if (results.length === 0) {
                return res.status(404).json({ message: "Film non trouvé" });
            }

            const film = results[0];
            const role = req.user?.role;
            const userId = req.user?.id;

            if (!role) {
                if (film.statut_moderation !== "approuve") {
                    return res.status(403).json({ message: "Accès refusé" });
                }
                return res.json(film);
            }

            if (role === "ADMIN" || role === "JURY") {
                return res.json(film);
            }

            if (role === "REALISATEUR") {
                if (film.id_realisateur === userId || film.statut_moderation === "approuve") {
                    return res.json(film);
                }
                return res.status(403).json({ message: "Accès refusé" });
            }

            if (film.statut_moderation !== "approuve") {
                return res.status(403).json({ message: "Accès refusé" });
            }
            return res.json(film);

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Erreur serveur" });
        }
    });

    // 🔒 POST nouveau film
    router.post(
        "/",
        authMiddleware,
        requireRoles(["REALISATEUR"]),
        async (req, res) => {
            try {
                const id_realisateur = req.user.id;
                const titre = req.body?.titre ?? null;
                const description = req.body?.description ?? null;
                const lien_youtube = req.body?.lien_youtube ?? null;
                const duree_secondes = req.body?.duree_secondes ?? null;
                const pays = req.body?.pays ?? null;

                if (!titre) {
                    return res.status(400).json({ message: "titre requis" });
                }

                const [result] = await db.execute(
                    `INSERT INTO film (id_realisateur, titre, description, lien_youtube, duree_secondes, pays, statut_moderation)
                     VALUES (?, ?, ?, ?, ?, ?, 'en attente')`,
                    [
                        id_realisateur,
                        titre,
                        description || null,
                        lien_youtube || null,
                        duree_secondes || null,
                        pays || null
                    ]
                );

                res.status(201).json({
                    success: true,
                    id_film: result.insertId,
                    message: "Film soumis en attente de modération !"
                });
            } catch (err) {
                console.error(err);
                res.status(500).json({ message: "Erreur serveur" });
            }
        }
    );

    // 🔒 PATCH modération
    router.patch(
        "/:id/moderation",
        authMiddleware,
        requireRoles(["ADMIN"]),
        async (req, res) => {
            try {
                const { id } = req.params;
                const { statut_moderation } = req.body;

                const allowed = ["en attente", "approuve", "rejete"];
                if (!allowed.includes(statut_moderation)) {
                    return res.status(400).json({ message: "statut_moderation invalide" });
                }

                const [result] = await db.execute(
                    "UPDATE film SET statut_moderation = ? WHERE id_film = ?",
                    [statut_moderation, id]
                );

                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: "Film non trouvé" });
                }

                res.json({ message: `Statut mis à jour ✅ (${statut_moderation})` });
            } catch (err) {
                console.error(err);
                res.status(500).json({ message: "Erreur serveur" });
            }
        }
    );

    // 🔒 JURY : voter
    router.post(
        "/:id/vote",
        authMiddleware,
        requireRoles(["JURY"]),
        async (req, res) => {
            try {
                const id_film = Number(req.params.id);
                const id_jury = req.user.id;
                const noteRaw = req.body?.note;
                const commentaire = req.body?.commentaire ?? null;

                if (!Number.isInteger(id_film)) {
                    return res.status(400).json({ message: "id_film invalide" });
                }

                if (noteRaw === undefined || noteRaw === null || noteRaw === "") {
                    return res.status(400).json({ message: "note requise (1 à 10)" });
                }

                const noteNum = Number(noteRaw);

                if (Number.isNaN(noteNum)) {
                    return res.status(400).json({ message: "note invalide : doit être un nombre" });
                }

                if (noteNum < 1 || noteNum > 10) {
                    return res.status(400).json({ message: "note invalide : doit être entre 1 et 10" });
                }

                const note = Math.round(noteNum * 100) / 100;

                const [films] = await db.execute(
                    "SELECT statut_moderation FROM film WHERE id_film = ?",
                    [id_film]
                );

                if (films.length === 0) {
                    return res.status(404).json({ message: "Film non trouvé" });
                }

                if (films[0].statut_moderation !== "approuve") {
                    return res.status(403).json({ message: "Vote interdit : film non approuvé" });
                }

                const [existingVotes] = await db.execute(
                    "SELECT id_vote FROM vote WHERE id_film = ? AND id_jury = ? LIMIT 1",
                    [id_film, id_jury]
                );

                if (existingVotes.length > 0) {
                    return res.status(409).json({
                        message: "Vous avez déjà voté pour ce film (vote unique, non modifiable)"
                    });
                }

                await db.execute(
                    `INSERT INTO vote (id_film, id_jury, note, commentaire)
                     VALUES (?, ?, ?, ?)`,
                    [id_film, id_jury, note, commentaire]
                );

                res.status(201).json({
                    message: "Vote enregistré ✅",
                    vote: { id_film, id_jury, note }
                });

            } catch (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({ message: "Vous avez déjà voté pour ce film" });
                }
                console.error(err);
                res.status(500).json({ error: err.message });
            }
        }
    );

    // 🔒 Voir les votes d'un film
    router.get(
        "/:id/votes",
        authMiddleware,
        requireRoles(["ADMIN", "JURY"]),
        async (req, res) => {
            try {
                const id_film = Number(req.params.id);

                if (!Number.isInteger(id_film)) {
                    return res.status(400).json({ message: "id_film invalide" });
                }

                const role = req.user?.role;
                const userId = req.user?.id;

                const [films] = await db.execute(
                    "SELECT id_film FROM film WHERE id_film = ?",
                    [id_film]
                );

                if (films.length === 0) {
                    return res.status(404).json({ message: "Film non trouvé" });
                }

                let query = `
                    SELECT v.id_vote, v.id_film, v.id_jury, v.note, v.commentaire,
                           u.nom, u.prenom, u.email
                    FROM vote v
                             JOIN utilisateur u ON u.id_utilisateur = v.id_jury
                    WHERE v.id_film = ?
                `;
                const params = [id_film];

                if (role === "JURY") {
                    query += " AND v.id_jury = ?";
                    params.push(userId);
                }

                query += " ORDER BY v.id_vote ASC";

                const [votes] = await db.execute(query, params);
                return res.json(votes);

            } catch (err) {
                console.error(err);
                res.status(500).json({ message: "Erreur serveur" });
            }
        }
    );

    return router;
}
