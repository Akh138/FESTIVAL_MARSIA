// src/pages/FilmsPage.jsx
import React, { useEffect, useState } from "react";
import { apiFetch } from "../services/api.js";

function FilmsPage({ setPage }) {
    const [films, setFilms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [error, setError] = useState("");

    const fetchEnAttente = async () => {
        setError("");
        setLoading(true);
        try {
            const data = await apiFetch("/api/v1/films/en-attente");
            setFilms(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e.message || "Erreur serveur");
            setFilms([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnAttente();
    }, []);

    const moderer = async (idFilm, statut) => {
        setError("");
        setActionLoadingId(idFilm);

        try {
            await apiFetch(`/api/v1/films/${idFilm}/moderation`, {
                method: "PATCH",
                body: JSON.stringify({ statut_moderation: statut }),
            });

            // ✅ On retire le film de la liste (car plus "en attente")
            setFilms((prev) => prev.filter((f) => f.id_film !== idFilm));
        } catch (e) {
            setError(e.message || "Erreur serveur");
        } finally {
            setActionLoadingId(null);
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div>
                    <h1 style={{ margin: 0 }}>🎬 Modération des films</h1>
                    <p style={{ marginTop: 6, opacity: 0.8 }}>
                        Films en attente : <strong>{films.length}</strong>
                    </p>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setPage?.("home")} style={btnSecondary}>
                        ← Accueil
                    </button>
                    <button onClick={fetchEnAttente} disabled={loading} style={btnPrimary}>
                        {loading ? "⏳ Rafraîchir..." : "🔄 Rafraîchir"}
                    </button>
                </div>
            </div>

            {error && (
                <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: "#ffe9e9", color: "#8a1f1f" }}>
                    ❌ {error}
                </div>
            )}

            <div style={{ marginTop: 16 }}>
                {loading ? (
                    <div style={{ padding: 12 }}>Chargement...</div>
                ) : films.length === 0 ? (
                    <div style={{ padding: 12, border: "1px dashed #bbb", borderRadius: 10 }}>✅ Aucun film en attente.</div>
                ) : (
                    <div style={{ display: "grid", gap: 12 }}>
                        {films.map((f) => (
                            <div key={f.id_film} style={card}>
                                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                                    <div>
                                        <div style={{ fontSize: 18, fontWeight: 700 }}>
                                            #{f.id_film} — {f.titre}
                                        </div>
                                        <div style={{ marginTop: 6, opacity: 0.85 }}>
                                            👤 {f.realisateur_prenom} {f.realisateur_nom}{" "}
                                            {f.realisateur_email ? <span style={{ opacity: 0.7 }}>({f.realisateur_email})</span> : null}
                                        </div>
                                        <div style={{ marginTop: 6, opacity: 0.85 }}>
                                            🌍 {f.pays || "N/A"} • ⏱️ {f.duree_secondes ?? "N/A"} sec
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", gap: 8, alignItems: "start" }}>
                                        <button
                                            style={btnApprove}
                                            disabled={actionLoadingId === f.id_film}
                                            onClick={() => moderer(f.id_film, "approuve")}
                                        >
                                            {actionLoadingId === f.id_film ? "⏳" : "✅ Approuver"}
                                        </button>
                                        <button
                                            style={btnReject}
                                            disabled={actionLoadingId === f.id_film}
                                            onClick={() => moderer(f.id_film, "rejete")}
                                        >
                                            {actionLoadingId === f.id_film ? "⏳" : "❌ Rejeter"}
                                        </button>
                                    </div>
                                </div>

                                {f.description ? (
                                    <div style={{ marginTop: 10, opacity: 0.9 }}>
                                        <strong>Description :</strong> {f.description}
                                    </div>
                                ) : null}

                                {f.lien_youtube ? (
                                    <div style={{ marginTop: 10 }}>
                                        <a href={f.lien_youtube} target="_blank" rel="noreferrer">
                                            🔗 Voir lien YouTube
                                        </a>
                                    </div>
                                ) : null}

                                <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
                                    Statut actuel : <strong>{f.statut_moderation}</strong>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const card = {
    padding: 14,
    borderRadius: 12,
    border: "1px solid #e3e3e3",
    background: "white",
};

const btnPrimary = {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #111",
    background: "#111",
    color: "white",
    cursor: "pointer",
};

const btnSecondary = {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #bbb",
    background: "white",
    cursor: "pointer",
};

const btnApprove = {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #1f7a1f",
    background: "#1f7a1f",
    color: "white",
    cursor: "pointer",
};

const btnReject = {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #b52a2a",
    background: "#b52a2a",
    color: "white",
    cursor: "pointer",
};

export default FilmsPage;