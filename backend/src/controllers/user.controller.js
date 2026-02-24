import db from "../config/db.js";
import bcrypt from "bcrypt";

// GET tous les utilisateurs
export const getAllUsers = async (req, res) => {
    try {
        const [results] = await db.execute(
            "SELECT * FROM utilisateur ORDER BY nom, prenom"
        );
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET utilisateur par ID
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const [results] = await db.execute(
            "SELECT * FROM utilisateur WHERE id_utilisateur = ?",
            [id]
        );

        if (results.length === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// REGISTER
export const register = async (req, res) => {
    try {
        const { nom, prenom, email, mot_de_passe } = req.body;

        // 1️⃣ Vérification des champs
        if (!nom || !prenom || !email || !mot_de_passe) {
            return res.status(400).json({
                message: "Tous les champs sont obligatoires"
            });
        }

        // 2️⃣ Vérifier si l’email existe déjà
        const [existingUser] = await db.execute(
            "SELECT id_utilisateur FROM utilisateur WHERE email = ?",
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                message: "Cet email est déjà utilisé"
            });
        }

        // 3️⃣ Hash du mot de passe
        const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

        // 4️⃣ Insertion en base
        await db.execute(
            `INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, date_inscription)
             VALUES (?, ?, ?, ?, NOW())`,
            [nom, prenom, email, hashedPassword]
        );

        // 5️⃣ Réponse OK
        res.status(201).json({
            success: true,
            message: "Utilisateur créé avec succès"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur serveur"
        });
    }
};
