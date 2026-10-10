import React, { useState } from "react";
import { apiFetch } from "../services/api.js";
import "./RegisterPage.css";
import AnimatedJuryTitle from "../components/AnimatedJuryTitle.jsx";

function RegisterPage({ setUser, setPage }) {
    const [form, setForm] = useState({
        nom: "",
        prenom: "",
        email: "",
        mot_de_passe: "",
        nom_role: "JURY",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await apiFetch("/api/v1/utilisateurs/register", {
                method: "POST",
                body: JSON.stringify({
                    nom: form.nom,
                    prenom: form.prenom,
                    email: form.email,
                    mot_de_passe: form.mot_de_passe,
                    nom_role: form.nom_role,
                }),
            });

            // après inscription on renvoie vers connexion
            setPage("login");
        } catch (err) {
            setError(err.message || "Erreur lors de l'inscription");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <AnimatedJuryTitle text="S'inscrire" />
                    <p>Rejoignez MARSIA 2026</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <div className="error">{error}</div>}

                    <div className="form-row">
                        <input
                            name="nom"
                            placeholder="Nom *"
                            value={form.nom}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <input
                            name="prenom"
                            placeholder="Prénom *"
                            value={form.prenom}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email *"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <input
                            type="password"
                            name="mot_de_passe"
                            placeholder="Mot de passe *"
                            value={form.mot_de_passe}
                            onChange={handleChange}
                            minLength={6}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <select
                            name="nom_role"
                            value={form.nom_role}
                            onChange={handleChange}
                            required
                        >
                            <option value="JURY">Jury</option>
                            <option value="MANAGER">Manager du site</option>
                        </select>
                    </div>

                    <button type="submit" className="btn-primary btn-large" disabled={loading}>
                        {loading ? "Inscription..." : "S'inscrire"}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Déjà inscrit ?{" "}
                        <button onClick={() => setPage("login")} className="link-btn">
                            Se connecter
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;