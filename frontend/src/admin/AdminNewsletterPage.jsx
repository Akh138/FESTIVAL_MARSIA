import React, { useEffect, useState } from "react";
import { apiFetch } from "../services/api.js";
import AnimatedJuryTitle from "../components/AnimatedJuryTitle.jsx";

function AdminNewsletterPage({ setPage }) {
    // =========================================================
    // États principaux
    // =========================================================
    const [newsletters, setNewsletters] = useState([]);
    const [form, setForm] = useState({
        email: "",
        langue: "FR",
        confirme: false,
    });
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // =========================================================
    // Charge la liste des inscriptions newsletter
    // =========================================================
    const fetchNewsletters = async () => {
        try {
            setLoading(true);
            setError("");

            // apiFetch ajoute déjà le token automatiquement
            const data = await apiFetch("/api/v1/newsletter");
            setNewsletters(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e.message || "Impossible de charger la newsletter");
            setNewsletters([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNewsletters();
    }, []);

    // =========================================================
    // Gère les champs du formulaire
    // Compatible input / select / checkbox
    // =========================================================
    const handleChange = (e) => {
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        setForm((prev) => ({
            ...prev,
            [e.target.name]: value,
        }));
    };

    // =========================================================
    // Création / modification d’une inscription
    // =========================================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            setLoading(true);

            if (editingId) {
                await apiFetch(`/api/v1/newsletter/${editingId}`, {
                    method: "PUT",
                    body: JSON.stringify(form),
                });
            } else {
                await apiFetch("/api/v1/newsletter", {
                    method: "POST",
                    body: JSON.stringify(form),
                });
            }

            setForm({
                email: "",
                langue: "FR",
                confirme: false,
            });
            setEditingId(null);
            setShowForm(false);

            await fetchNewsletters();
        } catch (e2) {
            setError(e2.message || "Erreur lors de l'enregistrement");
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // Ouvre le formulaire en mode création
    // =========================================================
    const openCreateForm = () => {
        setEditingId(null);
        setForm({
            email: "",
            langue: "FR",
            confirme: false,
        });
        setShowForm(true);
        setError("");
    };

    // =========================================================
    // Ouvre le formulaire en mode édition
    // =========================================================
    const handleEdit = (item) => {
        setEditingId(item.id_news);
        setForm({
            email: item.email || "",
            langue: item.langue || "FR",
            confirme: !!item.confirme,
        });
        setShowForm(true);
        setError("");
    };

    // =========================================================
    // Suppression d’une inscription newsletter
    // =========================================================
    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer cette inscription newsletter ?")) return;

        try {
            setLoading(true);
            setError("");

            await apiFetch(`/api/v1/newsletter/${id}`, { method: "DELETE" });
            await fetchNewsletters();
        } catch (e) {
            setError(e.message || "Erreur suppression");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-content admin-newsletter-page">
            {/* =========================================================
                Header de page
                - titre animé centré
                - boutons d’action à droite
               ========================================================= */}
            <div className="page-header admin-newsletter-header">
                <div className="admin-newsletter-titleArea">
                    <AnimatedJuryTitle text="Gestion Newsletter" />
                </div>

                <div className="page-actions admin-newsletter-actions">
                    <button className="btn-primary" onClick={openCreateForm}>
                        ➕ Nouvelle inscription
                    </button>

                    <button className="btn-secondary" onClick={() => setPage("home")}>
                        ← Accueil
                    </button>
                </div>
            </div>

            {/* =========================================================
                Message d’erreur global
               ========================================================= */}
            {error && <div className="error-banner">{error}</div>}

            {/* =========================================================
                Bloc principal : liste des inscriptions
               ========================================================= */}
            <div className="table-section admin-newsletter-tableSection">
                <div className="admin-newsletter-tableTop">
                    <h3>Inscriptions Newsletter</h3>

                    <p className="admin-newsletter-subtitle admin-newsletter-subtitle-inline">
                        {newsletters.length} inscription{newsletters.length > 1 ? "s" : ""}
                    </p>
                </div>

                {loading ? (
                    <div className="loading">Chargement...</div>
                ) : newsletters.length === 0 ? (
                    <div className="empty-state">
                        <p>Aucune inscription</p>

                        <button className="btn-primary" onClick={openCreateForm}>
                            ➕ Ajouter la première
                        </button>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Email</th>
                                <th>Langue</th>
                                <th>Confirmé</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                            </thead>

                            <tbody>
                            {newsletters.map((n) => (
                                <tr key={n.id_news}>
                                    <td>#{n.id_news}</td>
                                    <td>{n.email}</td>
                                    <td>{n.langue}</td>
                                    <td>{n.confirme ? "✅ Oui" : "⏳ Non"}</td>
                                    <td>
                                        {n.date_inscription
                                            ? new Date(n.date_inscription).toLocaleDateString("fr-FR")
                                            : "-"}
                                    </td>
                                    <td>
                                        <div className="admin-newsletter-actionGroup">
                                            <button
                                                className="btn-edit"
                                                onClick={() => handleEdit(n)}
                                                title="Modifier"
                                            >
                                                ✏️
                                            </button>

                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDelete(n.id_news)}
                                                title="Supprimer"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* =========================================================
                Modal création / modification
               ========================================================= */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingId ? "✏️ Modifier" : "➕ Nouvelle inscription"}</h3>

                            <button className="modal-close" onClick={() => setShowForm(false)}>
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <label>Email *</label>
                                <input
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <label>Langue *</label>
                                <select
                                    name="langue"
                                    value={form.langue}
                                    onChange={handleChange}
                                >
                                    <option value="FR">🇫🇷 Français</option>
                                    <option value="EN">🇺🇸 English</option>
                                </select>
                            </div>

                            <div className="form-row checkbox-row">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="confirme"
                                        checked={form.confirme}
                                        onChange={handleChange}
                                    />
                                    Confirmé
                                </label>
                            </div>

                            <div className="form-actions">
                                <button type="submit" disabled={loading} className="btn-primary">
                                    {loading ? "..." : editingId ? "Mettre à jour" : "Créer"}
                                </button>

                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setShowForm(false)}
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminNewsletterPage;