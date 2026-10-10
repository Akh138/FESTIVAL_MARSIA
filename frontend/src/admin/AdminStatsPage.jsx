import React, { useEffect, useState } from "react";
import { apiFetch } from "../services/api.js";
import AnimatedJuryTitle from "../components/AnimatedJuryTitle.jsx";

function AdminStatsPage({ setPage }) {
    // =========================================================
    // États principaux
    // =========================================================
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // =========================================================
    // Charge les statistiques admin
    // =========================================================
    const fetchStats = async () => {
        setError("");
        setLoading(true);

        try {
            const data = await apiFetch("/api/v1/admin/stats");
            setStats(data);
        } catch (e) {
            setError(e.message || "Erreur serveur");
            setStats(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <div className="admin-content admin-stats-page">
            {/* =========================================================
                Header de page
                - titre animé centré
                - actions à droite
               ========================================================= */}
            <div className="page-header admin-stats-header">
                <div className="admin-stats-titleArea">
                    <AnimatedJuryTitle text="Stats Admin" />
                </div>

                <div className="page-actions admin-stats-actions">
                    <button className="btn-secondary" onClick={() => setPage?.("home")}>
                        ← Accueil
                    </button>

                    <button className="btn-primary" onClick={fetchStats} disabled={loading}>
                        {loading ? "⏳ Rafraîchir..." : "🔄 Rafraîchir"}
                    </button>
                </div>
            </div>

            {/* =========================================================
                Message d’erreur
               ========================================================= */}
            {error && <div className="error-banner">❌ {error}</div>}

            {/* =========================================================
                Sous-titre de page
               ========================================================= */}
            <div className="admin-stats-intro">
                <p>Vue d’ensemble (films, votes, utilisateurs)</p>
            </div>

            {/* =========================================================
                Contenu principal
               ========================================================= */}
            <div className="admin-stats-content">
                {loading ? (
                    <div className="table-section admin-stats-stateBox">
                        <div className="loading">Chargement...</div>
                    </div>
                ) : !stats ? (
                    <div className="table-section admin-stats-stateBox">
                        <div className="admin-stats-empty">
                            Aucune donnée à afficher.
                        </div>
                    </div>
                ) : (
                    <div className="admin-stats-grid">
                        <StatsCard title="🎬 Films">
                            <StatsRow label="Total" value={stats?.films?.total} />
                            <StatsRow label="En attente" value={stats?.films?.en_attente} />
                            <StatsRow label="Approuvés" value={stats?.films?.approuves} />
                            <StatsRow label="Rejetés" value={stats?.films?.rejetes} />
                        </StatsCard>

                        <StatsCard title="🗳️ Votes">
                            <StatsRow label="Total" value={stats?.votes?.total} />
                        </StatsCard>

                        <StatsCard title="👥 Utilisateurs">
                            <StatsRow label="Réalisateurs" value={stats?.utilisateurs?.realisateurs} />
                            <StatsRow label="Jury" value={stats?.utilisateurs?.jury} />
                            <StatsRow label="Admin" value={stats?.utilisateurs?.admin} />
                        </StatsCard>
                    </div>
                )}
            </div>
        </div>
    );
}

/* =========================================================
   Carte statistique
   Bloc visuel pour chaque famille de stats
   ========================================================= */
function StatsCard({ title, children }) {
    return (
        <div className="admin-stats-card">
            <div className="admin-stats-cardTitle">{title}</div>
            <div className="admin-stats-cardBody">{children}</div>
        </div>
    );
}

/* =========================================================
   Ligne de statistique
   Affiche un libellé à gauche et une valeur à droite
   ========================================================= */
function StatsRow({ label, value }) {
    return (
        <div className="admin-stats-row">
            <span>{label}</span>
            <strong>{value ?? 0}</strong>
        </div>
    );
}

export default AdminStatsPage;