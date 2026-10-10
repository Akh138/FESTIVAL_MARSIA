import React, { useState } from "react";

const API_URL = "http://localhost:8081/api/v1";

function NewsletterPage({ setPage }) {

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");
        setMessage("");

        try {

            const res = await fetch(`${API_URL}/newsletter/subscribe`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    langue: "FR",
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Erreur inscription");
            }

            setMessage("✅ Inscription réussie à la newsletter !");
            setEmail("");

        } catch (err) {
            setError(err.message || "Erreur serveur");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="newsletter-page">

            <div className="newsletter-card">

                <h1>📧 Newsletter MARSIA</h1>

                <p>
                    Recevez les dernières actualités du festival,
                    les résultats et les nouveaux films.
                </p>

                <form onSubmit={handleSubmit} className="newsletter-form">

                    <input
                        type="email"
                        placeholder="Votre adresse email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="newsletter-input"
                    />

                    <button
                        type="submit"
                        className="btn-primary btn-large"
                        disabled={loading}
                    >
                        {loading ? "Inscription..." : "S'inscrire"}
                    </button>

                </form>

                {message && (
                    <div className="success-message">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <button
                    className="btn-secondary"
                    onClick={() => setPage("home")}
                    style={{ marginTop: "20px" }}
                >
                    ← Retour accueil
                </button>

            </div>

        </div>
    );
}

export default NewsletterPage;