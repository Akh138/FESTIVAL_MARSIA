import db from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// REGISTER
export const register = async (req, res) => {
    try {
        const { nom, prenom, email, mot_de_passe } = req.body;

        const [existing] = await db.execute(
            "SELECT * FROM utilisateur WHERE email = ?",
            [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: "Email déjà utilisé" });
        }

        const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

        // ✅ inscription = REALISATEUR (pas besoin de validation admin)
        await db.execute(
            `INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, nom_role)
             VALUES (?, ?, ?, ?, 'REALISATEUR')`,
            [nom, prenom, email, hashedPassword]
        );

        res.status(201).json({ message: "Utilisateur créé avec succès ✅" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// LOGIN + JWT
export const login = async (req, res) => {
    try {
        const { email, mot_de_passe } = req.body;

        const [users] = await db.execute(
            "SELECT * FROM utilisateur WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);

        if (!isMatch) {
            return res.status(401).json({ message: "Mot de passe incorrect" });
        }

        const token = jwt.sign(
            {
                id: user.id_utilisateur,
                email: user.email,
                role: user.nom_role || "PUBLIC"
            },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.json({
            message: "Connexion réussie ✅",
            token,
            user: {
                id: user.id_utilisateur,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                nom_role: user.nom_role || "PUBLIC"
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
