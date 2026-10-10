import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../services/api.js";
import AnimatedJuryTitle from "../components/AnimatedJuryTitle.jsx";

const API_BASE = "http://localhost:8081";

function GalerieFilmsPage({ setPage, user }) {
    // =========================================================
    // STATES
    // =========================================================
    const [films, setFilms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // filtres / tri
    const [q, setQ] = useState("");
    const [pays, setPays] = useState("ALL");
    const [sort, setSort] = useState("RECENT");

    const isAdmin = user?.nom_role === "ADMIN";
    const isPublic = !user;

    // =========================================================
    // FETCH FILMS
    // =========================================================
    const fetchFilms = async () => {
        setError("");
        setLoading(true);

        try {
            const data = await apiFetch("/api/v1/films");
            const approuves = (Array.isArray(data) ? data : []).filter(
                (f) => f.statut_moderation === "approuve"
            );
            setFilms(approuves);
        } catch (e) {
            setError(e.message || "Erreur chargement galerie");
            setFilms([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFilms();
    }, []);

    // =========================================================
    // HELPERS
    // =========================================================
    const youtubeEmbed = (url) => {
        if (!url) return null;

        try {
            const u = new URL(url);
            const v = u.searchParams.get("v");

            if (v) return `https://www.youtube.com/embed/${v}`;

            if (u.hostname.includes("youtu.be")) {
                const id = u.pathname.replace("/", "");
                return id ? `https://www.youtube.com/embed/${id}` : null;
            }
        } catch {
            return null;
        }

        return null;
    };

    const shareFilm = async (film) => {
        const link = film.lien_youtube
            ? film.lien_youtube
            : film.fichier_video
                ? `${API_BASE}/uploads/films/${film.fichier_video}`
                : "";

        if (!link) {
            alert("Aucun lien disponible");
            return;
        }

        try {
            await navigator.clipboard.writeText(link);
            alert("Lien copié !");
        } catch {
            alert(link);
        }
    };

    const deleteFilm = async (film) => {
        if (!isAdmin) return;
        if (!window.confirm(`Supprimer "${film.titre}" ?`)) return;

        try {
            await apiFetch(`/api/v1/films/${film.id_film}`, { method: "DELETE" });
            setFilms((prev) => prev.filter((f) => f.id_film !== film.id_film));
        } catch (e) {
            setError(e.message || "Erreur suppression");
        }
    };

    const resetFilters = () => {
        setQ("");
        setPays("ALL");
        setSort("RECENT");
    };

    // =========================================================
    // LISTE DES PAYS
    // =========================================================
    const allPays = useMemo(() => {
        const s = new Set();

        films.forEach((f) => {
            if (f.pays && String(f.pays).trim()) {
                s.add(String(f.pays).trim());
            }
        });

        return ["ALL", ...Array.from(s).sort((a, b) => a.localeCompare(b))];
    }, [films]);

    // =========================================================
    // FILTRES + TRI
    // =========================================================
    const filtered = useMemo(() => {
        const query = q.trim().toLowerCase();

        let arr = films.filter((f) => {
            if (pays !== "ALL" && (f.pays || "") !== pays) return false;

            if (!query) return true;

            const haystack = [
                f.titre,
                f.description,
                f.realisateur_nom,
                f.realisateur_prenom,
                f.pays,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return haystack.includes(query);
        });

        arr = [...arr].sort((a, b) => {
            if (sort === "TITLE_ASC") {
                return String(a.titre || "").localeCompare(String(b.titre || ""));
            }

            if (sort === "TITLE_DESC") {
                return String(b.titre || "").localeCompare(String(a.titre || ""));
            }

            if (sort === "DURATION_ASC") {
                return (Number(a.duree_secondes) || 0) - (Number(b.duree_secondes) || 0);
            }

            if (sort === "DURATION_DESC") {
                return (Number(b.duree_secondes) || 0) - (Number(a.duree_secondes) || 0);
            }

            // RECENT
            return (Number(b.id_film) || 0) - (Number(a.id_film) || 0);
        });

        return arr;
    }, [films, q, pays, sort]);

    // =========================================================
    // RENDER
    // =========================================================
    return (
        <div className="admin-content galerie-page">
            {/* HEADER */}
            <div className="page-header galerie-header">
                <div className="galerie-titleArea">
                    <AnimatedJuryTitle text="Galerie des films" />
                </div>

                <div className="page-actions galerie-actions">
                    <button className="btn-secondary" onClick={() => setPage("home")}>
                        ← Accueil
                    </button>

                    <button className="btn-primary" onClick={fetchFilms}>
                        🔄 Rafraîchir
                    </button>
                </div>
            </div>

            {/* FILTRES */}
            <div className="table-section galerie-filters">
                <div className="galerie-filters-row">
                    <div className="galerie-filterField galerie-filterField-search">
                        <label>🔎 Recherche</label>
                        <input
                            placeholder="Titre, description, réalisateur..."
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />
                    </div>

                    <div className="galerie-filterField">
                        <label>🌍 Pays</label>
                        <select value={pays} onChange={(e) => setPays(e.target.value)}>
                            {allPays.map((p) => (
                                <option key={p} value={p}>
                                    {p === "ALL" ? "Tous" : p}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="galerie-filterField">
                        <label>↕️ Tri</label>
                        <select value={sort} onChange={(e) => setSort(e.target.value)}>
                            <option value="RECENT">Plus récents</option>
                            <option value="TITLE_ASC">Titre A → Z</option>
                            <option value="TITLE_DESC">Titre Z → A</option>
                            <option value="DURATION_ASC">Durée courte → longue</option>
                            <option value="DURATION_DESC">Durée longue → courte</option>
                        </select>
                    </div>

                    <div className="galerie-filterMeta">
                        <div className="galerie-filterCount">🎬 {filtered.length} film(s)</div>

                        <button className="btn-secondary galerie-resetBtn" onClick={resetFilters}>
                            Réinitialiser
                        </button>
                    </div>
                </div>
            </div>

            {/* ERREUR */}
            {error && <div className="error-banner">{error}</div>}

            {/* GRID */}
            {loading ? (
                <div className="loading">Chargement...</div>
            ) : (
                <div className="galerie-grid">
                    {filtered.map((f) => {
                        const embed = youtubeEmbed(f.lien_youtube);

                        return (
                            <div key={f.id_film} className="card galerie-card">
                                <div className="galerie-card-header">
                                    <h3>{f.titre}</h3>
                                </div>

                                <div className="galerie-media">
                                    {embed ? (
                                        <iframe
                                            src={embed}
                                            title={f.titre}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <video
                                            src={`${API_BASE}/uploads/films/${f.fichier_video}`}
                                            controls
                                        />
                                    )}
                                </div>

                                <div className="galerie-actions-row">
                                    <button className="btn-secondary" onClick={() => shareFilm(f)}>
                                        🔗 Partager
                                    </button>

                                    {!isPublic && (
                                        <button className="btn-secondary">
                                            🗳️ Voter
                                        </button>
                                    )}

                                    {isAdmin && (
                                        <button className="btn-delete" onClick={() => deleteFilm(f)}>
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default GalerieFilmsPage;