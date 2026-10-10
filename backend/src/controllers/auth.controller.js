import db from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// rôles autorisés depuis la page d'inscription
const ALLOWED_REGISTER_ROLES = ["JURY", "MANAGER"];


// =============================
// INSCRIPTION
// =============================
export const register = async (req, res) => {
    try {
        const { nom, prenom, email, mot_de_passe, nom_role } = req.body;

        // petite vérification de base
        if (!nom || !prenom || !email || !mot_de_passe || !nom_role) {
            return res.status(400).json({
                message: "Tous les champs sont obligatoires"
            });
        }

        // on limite l'inscription publique à JURY et MANAGER
        if (!ALLOWED_REGISTER_ROLES.includes(nom_role)) {
            return res.status(400).json({
                message: "Rôle non autorisé pour l'inscription"
            });
        }

        // on vérifie que l'email n'existe pas déjà
        const [existing] = await db.execute(
            "SELECT id_utilisateur FROM utilisateur WHERE email = ?",
            [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                message: "Email déjà utilisé"
            });
        }

        // hash du mot de passe
        const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

        // nouvel inscrit = compte en attente de validation admin
        await db.execute(
            `INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, nom_role, actif)
             VALUES (?, ?, ?, ?, ?, 0)`,
            [nom, prenom, email, hashedPassword, nom_role]
        );

        res.status(201).json({
            message: "Inscription envoyée. Votre compte doit être validé par un administrateur."
        });

    } catch (error) {
        console.error("Erreur register :", error);
        res.status(500).json({
            message: "Erreur serveur"
        });
    }
};


// =============================
// CONNEXION + JWT
// =============================
export const login = async (req, res) => {
    try {
        const { email, mot_de_passe } = req.body;

        const [users] = await db.execute(
            "SELECT * FROM utilisateur WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "Utilisateur introuvable"
            });
        }

        const user = users[0];

        // mot de passe incorrect
        const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);

        if (!isMatch) {
            return res.status(401).json({
                message: "Mot de passe incorrect"
            });
        }

        // si le compte n'est pas encore validé par l'admin
        if (Number(user.actif) !== 1) {
            return res.status(403).json({
                message: "Votre compte est en attente de validation par un administrateur"
            });
        }

        // on met les infos utiles dans le token
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
                nom_role: user.nom_role || "PUBLIC",
                actif: user.actif
            }
        });

    } catch (error) {
        console.error("Erreur login :", error);
        res.status(500).json({
            message: "Erreur serveur"
        });
    }
};