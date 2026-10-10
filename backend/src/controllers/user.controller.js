import db from "../config/db.js";
import bcrypt from "bcrypt";

// rôles autorisés depuis le formulaire public
const ALLOWED_REGISTER_ROLES = ["JURY", "MANAGER"];


// =============================
// GET tous les utilisateurs
// =============================
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


// =============================
// GET utilisateur par ID
// =============================
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


// =============================
// INSCRIPTION PUBLIQUE
// Ici on autorise seulement Jury et Manager
// Le compte est créé en attente de validation admin
// =============================
export const register = async (req, res) => {
    try {
        const { nom, prenom, email, mot_de_passe, nom_role } = req.body;

        // on vérifie que tout est rempli
        if (!nom || !prenom || !email || !mot_de_passe || !nom_role) {
            return res.status(400).json({
                message: "Tous les champs sont obligatoires"
            });
        }

        // on limite les rôles disponibles depuis le front
        if (!ALLOWED_REGISTER_ROLES.includes(nom_role)) {
            return res.status(400).json({
                message: "Rôle non autorisé pour l'inscription"
            });
        }

        // on vérifie que l'email n'existe pas déjà
        const [existingUser] = await db.execute(
            "SELECT id_utilisateur FROM utilisateur WHERE email = ?",
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                message: "Cet email est déjà utilisé"
            });
        }

        // hash du mot de passe
        const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

        // insertion en base
        // actif = 0 => compte en attente de validation admin
        await db.execute(
            `INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, nom_role, actif, date_inscription)
             VALUES (?, ?, ?, ?, ?, 0, NOW())`,
            [nom, prenom, email, hashedPassword, nom_role]
        );

        res.status(201).json({
            success: true,
            message: "Inscription envoyée. Votre compte doit être validé par un administrateur."
        });

    } catch (error) {
        console.error("Erreur register utilisateur :", error);
        res.status(500).json({
            message: "Erreur serveur"
        });
    }
};