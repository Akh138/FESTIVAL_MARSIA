import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../services/api.js";
import "./JuryDashboardPage.css";
import AnimatedJuryTitle from "../components/AnimatedJuryTitle.jsx";

const API_BASE = "http://localhost:8081";

function JuryDashboardPage({ setPage, user }) {
    const [aVoter, setAVoter] = useState([]);
    const [dejaVotes, setDejaVotes] = useState([]);
    const [stats, setStats] = useState({ nb_a_voter: 0, nb_deja_votes: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // =========================================
    // État de la modal de vote
    // =========================================
    const [isVoteOpen, setIsVoteOpen] = useState(false);
    const [voteFilm, setVoteFilm] = useState(null);
    const [note, setNote] = useState("8");
    const [commentaire, setCommentaire] = useState("");

    const isJury = user?.nom_role === "JURY";

    // =========================================
    // Convertit une URL YouTube en URL embed
    // =========================================
    const youtubeEmbed = (url) => {
        if (!url) return null;

        try {
            const u = new URL(url);
            const videoId = u.searchParams.get("v");

            if (videoId) {
                return `https://www.youtube.com/embed/${videoId}`;
            }

            if (u.hostname.includes("youtu.be")) {
                const shortId = u.pathname.replace("/", "");
                return shortId ? `https://www.youtube.com/embed/${shortId}` : null;
            }

            return null;
        } catch {
            return null;
        }
    };

    // =========================================
    // Chargement du dashboard jury
    // =========================================
    const fetchDashboard = async () => {
        setError("");
        setLoading(true);

        try {
            const data = await apiFetch("/api/v1/films/jury/dashboard");

            setAVoter(Array.isArray(data?.a_voter) ? data.a_voter : []);
            setDejaVotes(Array.isArray(data?.deja_votes) ? data.deja_votes : []);
            setStats(data?.stats || { nb_a_voter: 0, nb_deja_votes: 0 });
        } catch (e) {
            setError(e.message || "Erreur chargement dashboard jury");
            setAVoter([]);
            setDejaVotes([]);
            setStats({ nb_a_voter: 0, nb_deja_votes: 0 });
        } finally {
            setLoading(false);
        }
    };

    // =========================================
    // Chargement initial si l'utilisateur est jury
    // =========================================
    useEffect(() => {
        if (!isJury) return;
        fetchDashboard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.nom_role]);

    // =========================================
    // Total approuvés
    // =========================================
    const totalApprouves = useMemo(() => {
        return (Number(stats?.nb_a_voter) || 0) + (Number(stats?.nb_deja_votes) || 0);
    }, [stats]);

    // =========================================
    // Ouverture / fermeture modal vote
    // =========================================
    const openVoteModal = (film) => {
        setVoteFilm(film);
        setNote("8");
        setCommentaire("");
        setIsVoteOpen(true);
    };

    const closeVoteModal = () => {
        setIsVoteOpen(false);
        setVoteFilm(null);
    };

    // =========================================
    // Envoi du vote
    // =========================================
    const submitVote = async (e) => {
        e.preventDefault();
        if (!voteFilm) return;

        try {
            setError("");
            const n = Number(note);

            if (Number.isNaN(n) || n < 1 || n > 10) {
                setError("La note doit être entre 1 et 10.");
                return;
            }

            await apiFetch(`/api/v1/films/${voteFilm.id_film}/vote`, {
                method: "POST",
                body: JSON.stringify({
                    note: n,
                    commentaire: commentaire || null,
                }),
            });

            closeVoteModal();
            await fetchDashboard();
        } catch (e2) {
            setError(e2.message || "Erreur vote");
        }
    };

    // =========================================
    // Carte film réutilisable
    // - À voter
    // - Déjà votés
    // =========================================
    const CardFilm = ({ film, rightActions }) => {
        const embed = youtubeEmbed(film.lien_youtube);
        const videoUrl = film.fichier_video
            ? `${API_BASE}/uploads/films/${film.fichier_video}`
            : null;

        return (
            <div className="jd-filmCard">
                <div className="jd-filmTop">
                    <div className="jd-filmInfo">
                        <div className="jd-filmTitle">
                            #{film.id_film} — {film.titre}
                        </div>

                        <div className="jd-filmMeta">
                            <div>
                                👤 {film.realisateur_prenom} {film.realisateur_nom}
                            </div>

                            <div>
                                🌍 {film.pays || "N/A"} • ⏱️ {film.duree_secondes ?? "N/A"} sec • 🗳️{" "}
                                {Number(film.nb_votes || 0)} vote(s)
                            </div>
                        </div>

                        {film.description ? (
                            <div className="jd-filmDescription">
                                <strong>Description :</strong> {film.description}
                            </div>
                        ) : null}

                        {rightActions ? <div className="jd-actions">{rightActions}</div> : null}
                    </div>
                </div>

                <div className="jd-media">
                    {embed ? (
                        <iframe
                            src={embed}
                            title={film.titre}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : videoUrl ? (
                        <video src={videoUrl} controls />
                    ) : (
                        <div className="jd-noMedia">
                            Aucun média disponible (ni YouTube, ni fichier upload).
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // =========================================
    // Sécurité accès jury
    // =========================================
    if (!isJury) {
        return (
            <div className="page-container">
                <div className="error-banner">Accès refusé : réservé au Jury.</div>
            </div>
        );
    }

    return (
        <div className="page-container juryDash">
            {/* =========================================
                Header
               ========================================= */}
            <div className="page-header">
                <div>
                    <AnimatedJuryTitle />
                </div>

                <div className="page-actions">
                    <button className="btn-secondary" onClick={() => setPage("home")}>
                        ← Accueil
                    </button>

                    <button className="btn-secondary" onClick={fetchDashboard} disabled={loading}>
                        {loading ? "⏳ ..." : "🔄 Rafraîchir"}
                    </button>
                </div>
            </div>

            {/* =========================================
                Erreur API
               ========================================= */}
            {error && <div className="error-banner">{error}</div>}

            {/* =========================================
                Résumé du haut
               ========================================= */}
            <div className="jd-summary">
                <div className="card">
                    <h3>🗳️ Films à voter</h3>
                    <div className="jd-kpi">{aVoter.length}</div>
                    <div className="jd-kpiSub">Approuvés, pas encore votés par vous</div>
                </div>

                <div className="card">
                    <h3>📌 Films déjà votés</h3>
                    <div className="jd-kpi">{dejaVotes.length}</div>
                    <div className="jd-kpiSub">Historique de vos votes</div>
                </div>

                <div className="card">
                    <h3>📦 Total approuvés</h3>
                    <div className="jd-kpi">{totalApprouves}</div>
                    <div className="jd-kpiSub">Films approuvés (votés + à voter)</div>
                </div>
            </div>

            {/* =========================================
                Sections principales
               ========================================= */}
            <div className="jd-layout">
                {/* =========================================
                    À voter
                   ========================================= */}
                <div className="card jd-block jd-block-small">
                    <div className="jd-sectionTitle">
                        <div>
                            <h2>✅ À voter</h2>
                            <div className="jd-sectionSub">Films approuvés, non votés par vous</div>
                        </div>
                        <div className="jd-count">{aVoter.length}</div>
                    </div>

                    {aVoter.length === 0 ? (
                        <div className="jd-empty">🎉 Vous avez voté pour tous les films approuvés !</div>
                    ) : (
                        <div className="jd-filmGrid">
                            {aVoter.map((film) => (
                                <div key={film.id_film} className="jd-filmGridItem">
                                    <CardFilm
                                        film={film}
                                        rightActions={
                                            <button
                                                className="btn-primary jd-voteActionBtn"
                                                onClick={() => openVoteModal(film)}
                                            >
                                                🗳️ Voter
                                            </button>
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* =========================================
                    Déjà votés
                   ========================================= */}
                <div className="card jd-block">
                    <div className="jd-sectionTitle">
                        <div>
                            <h2>📌 Déjà votés</h2>
                            <div className="jd-sectionSub">Historique de vos votes</div>
                        </div>
                        <div className="jd-count">{dejaVotes.length}</div>
                    </div>

                    {dejaVotes.length === 0 ? (
                        <div className="jd-empty">Aucun vote pour l’instant.</div>
                    ) : (
                        <div className="jd-filmGrid">
                            {dejaVotes.map((v) => (
                                <div key={v.id_vote} className="jd-filmGridItem">
                                    <CardFilm
                                        film={v}
                                        rightActions={
                                            <div className="jd-voteBadge">
                                                ✅ Mon vote : {Number(v.note).toFixed(2)} / 10
                                            </div>
                                        }
                                    />

                                    {v.commentaire ? (
                                        <div className="jd-comment">
                                            <strong>Mon commentaire :</strong> {v.commentaire}
                                        </div>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* =========================================
                Modal de vote
               ========================================= */}
            {isVoteOpen && voteFilm && (
                <div className="modal-overlay" onMouseDown={closeVoteModal}>
                    <div className="modal-content" onMouseDown={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <strong>🗳️ Voter</strong>
                                <div className="jd-modalSubTitle">
                                    #{voteFilm.id_film} — {voteFilm.titre}
                                </div>
                            </div>

                            <button className="modal-close" onClick={closeVoteModal}>
                                ✕
                            </button>
                        </div>

                        <form onSubmit={submitVote}>
                            <div className="form-row">
                                <label>Note (1 à 10)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    step="0.1"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <label>Commentaire (optionnel)</label>
                                <textarea
                                    value={commentaire}
                                    onChange={(e) => setCommentaire(e.target.value)}
                                    rows={4}
                                />
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={closeVoteModal}
                                >
                                    Annuler
                                </button>

                                <button type="submit" className="btn-primary">
                                    Enregistrer mon vote
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default JuryDashboardPage;