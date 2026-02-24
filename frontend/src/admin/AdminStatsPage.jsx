// src/admin/AdminStatsPage.jsx
import React, { useEffect, useState } from "react";
import { apiFetch } from "../services/api.js";

function AdminStatsPage({ setPage }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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
        <div style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div>
                    <h1 style={{ margin: 0 }}>📊 Stats Admin</h1>
                    <p style={{ marginTop: 6, opacity: 0.8 }}>
                        Vue d’ensemble (films, votes, utilisateurs)
                    </p>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setPage?.("home")} style={btnSecondary}>
                        ← Accueil
                    </button>
                    <button onClick={fetchStats} disabled={loading} style={btnPrimary}>
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
                ) : !stats ? (
                    <div style={{ padding: 12, border: "1px dashed #bbb", borderRadius: 10 }}>
                        Aucune donnée à afficher.
                    </div>
                ) : (
                    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
                        <Card title="🎬 Films">
                            <Row label="Total" value={stats?.films?.total} />
                            <Row label="En attente" value={stats?.films?.en_attente} />
                            <Row label="Approuvés" value={stats?.films?.approuves} />
                            <Row label="Rejetés" value={stats?.films?.rejetes} />
                        </Card>

                        <Card title="🗳️ Votes">
                            <Row label="Total" value={stats?.votes?.total} />
                        </Card>

                        <Card title="👥 Utilisateurs">
                            <Row label="Réalisateurs" value={stats?.utilisateurs?.realisateurs} />
                            <Row label="Jury" value={stats?.utilisateurs?.jury} />
                            <Row label="Admin" value={stats?.utilisateurs?.admin} />
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}

function Card({ title, children }) {
    return (
        <div style={card}>
            <div style={{ fontWeight: 800, fontSize: 16 }}>{title}</div>
            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>{children}</div>
        </div>
    );
}

function Row({ label, value }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, opacity: 0.95 }}>
            <span>{label}</span>
            <strong>{value ?? 0}</strong>
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

export default AdminStatsPage;