import React, { useState } from "react";
import { apiFetch, setToken } from "../services/api.js";
import "./LoginPage.css";
import AnimatedJuryTitle from "../components/AnimatedJuryTitle.jsx";


function LoginPage({ setUser, setPage }) {
    const [form, setForm] = useState({
        email: "",
        mot_de_passe: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // ✅ On utilise le VRAI endpoint backend
            const data = await apiFetch("/api/v1/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    email: form.email,
                    mot_de_passe: form.mot_de_passe,
                }),
            });

            // data attendu: { message, token, user }
            setToken(data.token);

            // 🔁 Ton App.jsx attend user.nom_role, mais le backend renvoie le rôle dans le JWT.
            // On garde "nom_role" côté front pour rester compatible avec ton App actuel.
            const role = data?.user?.nom_role || data?.user?.role || "PUBLIC";

            const user = {
                ...data.user,
                nom_role: role,
            };

            setUser(user);

            // 🔑 REDIRECTION SELON RÔLE
            switch (user.nom_role) {
                case "ADMIN":
                    setPage("admin-users");
                    break;
                case "MANAGER":
                    setPage("films-moderation");
                    break;
                case "REALISATEUR":
                    setPage("soumission-film");
                    break;
                case "JURY":
                    setPage("jury-dashboard");
                    break;
                default:
                    setPage("home");
            }
        } catch (err) {
            setError(err.message || "Email ou mot de passe incorrect");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <AnimatedJuryTitle text="Connexion" />
                    <p>Accédez à votre espace MARSIA</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <div className="error">{error}</div>}

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
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary btn-large" disabled={loading}>
                        {loading ? "Connexion..." : "Se connecter"}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Pas de compte ?{" "}
                        <button onClick={() => setPage("register")} className="link-btn">
                            S'inscrire
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
