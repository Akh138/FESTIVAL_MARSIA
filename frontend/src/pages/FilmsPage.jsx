import React, { useEffect, useState } from "react";
import { apiFetch } from "../services/api.js";
import AnimatedJuryTitle from "../components/AnimatedJuryTitle.jsx";

function FilmsPage({ setPage }) {
    const [films, setFilms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [error, setError] = useState("");

    const BACKEND_ORIGIN = "http://localhost:8081";

    const getVideoUrl = (fichier_video) => {
        if (!fichier_video) return null;

        if (String(fichier_video).startsWith("/uploads/")) {
            return `${BACKEND_ORIGIN}${fichier_video}`;
        }

        return `${BACKEND_ORIGIN}/uploads/films/${fichier_video}`;
    };

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

            setFilms((prev) => prev.filter((f) => f.id_film !== idFilm));
        } catch (e) {
            setError(e.message || "Erreur serveur");
        } finally {
            setActionLoadingId(null);
        }
    };

    return (
        <div className="admin-content admin-films-page">
            {/* HEADER */}
            <div className="page-header admin-films-header">
                <div className="admin-films-titleArea">
                    <AnimatedJuryTitle text="Modération des films" />
                </div>

                <div className="page-actions admin-films-actions">
                    <button className="btn-secondary" onClick={() => setPage?.("home")}>
                        ← Accueil
                    </button>

                    <button className="btn-primary" onClick={fetchEnAttente} disabled={loading}>
                        {loading ? "⏳ ..." : "🔄 Rafraîchir"}
                    </button>
                </div>
            </div>

            {/* compteur */}
            <div className="admin-films-intro">
                <p>Films en attente : <strong>{films.length}</strong></p>
            </div>

            {error && <div className="error-banner">❌ {error}</div>}

            {/* CONTENU */}
            <div className="admin-films-content">
                {loading ? (
                    <div className="table-section">
                        <div className="loading">Chargement...</div>
                    </div>
                ) : films.length === 0 ? (
                    <div className="table-section">
                        <div className="admin-films-empty">
                            ✅ Aucun film en attente.
                        </div>
                    </div>
                ) : (
                    <div className="admin-films-grid">
                        {films.map((f) => {
                            const videoUrl = getVideoUrl(f.fichier_video);

                            return (
                                <div key={f.id_film} className="admin-films-card">
                                    {/* HEADER CARD */}
                                    <div className="admin-films-cardHeader">
                                        <div>
                                            <div className="admin-films-title">
                                                #{f.id_film} — {f.titre}
                                            </div>

                                            <div className="admin-films-meta">
                                                👤 {f.realisateur_prenom} {f.realisateur_nom}
                                            </div>

                                            <div className="admin-films-meta">
                                                🌍 {f.pays || "N/A"} • ⏱️ {f.duree_secondes ?? "N/A"} sec
                                            </div>
                                        </div>

                                        {/* ACTIONS */}
                                        <div className="admin-films-actionsButtons">
                                            <button
                                                className="btn-vote-approve"
                                                disabled={actionLoadingId === f.id_film}
                                                onClick={() => moderer(f.id_film, "approuve")}
                                            >
                                                {actionLoadingId === f.id_film ? "⏳" : "✅"}
                                            </button>

                                            <button
                                                className="btn-vote-reject"
                                                disabled={actionLoadingId === f.id_film}
                                                onClick={() => moderer(f.id_film, "rejete")}
                                            >
                                                {actionLoadingId === f.id_film ? "⏳" : "❌"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* DESCRIPTION */}
                                    {f.description && (
                                        <div className="admin-films-description">
                                            <strong>Description :</strong> {f.description}
                                        </div>
                                    )}

                                    {/* VIDEO */}
                                    {videoUrl && (
                                        <div className="admin-films-video">
                                            <video src={videoUrl} controls />
                                        </div>
                                    )}

                                    {/* YOUTUBE */}
                                    {f.lien_youtube && (
                                        <div className="admin-films-link">
                                            <a href={f.lien_youtube} target="_blank" rel="noreferrer">
                                                🔗 Voir YouTube
                                            </a>
                                        </div>
                                    )}

                                    <div className="admin-films-status">
                                        Statut : <strong>{f.statut_moderation}</strong>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default FilmsPage;