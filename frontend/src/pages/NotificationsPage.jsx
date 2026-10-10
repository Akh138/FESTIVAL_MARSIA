import React, { useEffect, useState } from "react";
import { apiFetch } from "../services/api.js";
import AnimatedJuryTitle from "../components/AnimatedJuryTitle.jsx";

function NotificationsPage({ setPage }) {
    // =========================================================
    // États principaux
    // =========================================================
    const [notifications, setNotifications] = useState([]);
    const [form, setForm] = useState({
        id_utilisateur: "",
        type_notification: "",
        contenu: "",
        lu: false,
    });
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // =========================================================
    // Charge les notifications
    // =========================================================
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await apiFetch("/api/v1/notifications");
            setNotifications(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || "Impossible de charger les notifications");
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // =========================================================
    // Mise à jour des champs du formulaire
    // Compatible input / select / textarea / checkbox
    // =========================================================
    const handleChange = (e) => {
        const { name, type, value, checked } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // =========================================================
    // Création / modification d'une notification
    // =========================================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const payload = {
            ...form,
            id_utilisateur: form.id_utilisateur ? Number(form.id_utilisateur) : null,
        };

        try {
            setLoading(true);

            if (editingId) {
                await apiFetch(`/api/v1/notifications/${editingId}`, {
                    method: "PUT",
                    body: JSON.stringify(payload),
                });
            } else {
                await apiFetch("/api/v1/notifications", {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
            }

            setForm({
                id_utilisateur: "",
                type_notification: "",
                contenu: "",
                lu: false,
            });
            setEditingId(null);
            setShowForm(false);

            await fetchNotifications();
        } catch (err) {
            setError(err.message || "Erreur enregistrement");
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
            id_utilisateur: "",
            type_notification: "",
            contenu: "",
            lu: false,
        });
        setShowForm(true);
        setError("");
    };

    // =========================================================
    // Ouvre le formulaire en mode édition
    // =========================================================
    const handleEdit = (notif) => {
        setEditingId(notif.id_notification);
        setForm({
            id_utilisateur: notif.id_utilisateur ?? "",
            type_notification: notif.type_notification ?? "",
            contenu: notif.contenu ?? "",
            lu: !!notif.lu,
        });
        setShowForm(true);
        setError("");
    };

    // =========================================================
    // Suppression d'une notification
    // =========================================================
    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer cette notification ?")) return;

        try {
            setLoading(true);
            setError("");

            await apiFetch(`/api/v1/notifications/${id}`, {
                method: "DELETE",
            });

            await fetchNotifications();
        } catch (err) {
            setError(err.message || "Erreur suppression");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-content admin-notifications-page">
            {/* =========================================================
                Header de page
                - titre animé centré
                - actions à droite
               ========================================================= */}
            <div className="page-header admin-notifications-header">
                <div className="admin-notifications-titleArea">
                    <AnimatedJuryTitle text="Gestion Notifications" />
                </div>

                <div className="page-actions admin-notifications-actions">
                    <button className="btn-primary" onClick={openCreateForm}>
                        ➕ Nouvelle notification
                    </button>

                    <button className="btn-secondary" onClick={() => setPage("home")}>
                        ← Accueil
                    </button>
                </div>
            </div>

            {/* =========================================================
                Erreur globale
               ========================================================= */}
            {error && <div className="error-banner">{error}</div>}

            {/* =========================================================
                Bloc principal : liste des notifications
               ========================================================= */}
            <div className="table-section admin-notifications-tableSection">
                <div className="admin-notifications-tableTop">
                    <h3>Liste des notifications</h3>

                    <p className="admin-notifications-subtitle admin-notifications-subtitle-inline">
                        {notifications.length} notification{notifications.length > 1 ? "s" : ""}
                    </p>
                </div>

                {loading ? (
                    <div className="loading">Chargement...</div>
                ) : notifications.length === 0 ? (
                    <div className="empty-state">
                        <p>Aucune notification</p>

                        <button className="btn-primary" onClick={openCreateForm}>
                            ➕ Créer la première
                        </button>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Utilisateur</th>
                                <th>Type</th>
                                <th>Contenu</th>
                                <th>Lu</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                            </thead>

                            <tbody>
                            {notifications.map((n) => (
                                <tr key={n.id_notification}>
                                    <td>#{n.id_notification}</td>
                                    <td>{n.id_utilisateur || "Tous"}</td>

                                    <td>
                                            <span
                                                className={`type-badge type-${String(
                                                    n.type_notification || "general"
                                                ).toLowerCase()}`}
                                            >
                                                {n.type_notification || "GENERAL"}
                                            </span>
                                    </td>

                                    <td>
                                        {n.contenu?.substring(0, 50)}
                                        {n.contenu?.length > 50 ? "..." : ""}
                                    </td>

                                    <td>{n.lu ? "✅ Oui" : "📩 Non"}</td>

                                    <td>
                                        {n.date_envoi
                                            ? new Date(n.date_envoi).toLocaleString("fr-FR")
                                            : "-"}
                                    </td>

                                    <td>
                                        <div className="admin-notifications-actionGroup">
                                            <button
                                                className="btn-edit"
                                                onClick={() => handleEdit(n)}
                                                title="Modifier"
                                            >
                                                ✏️
                                            </button>

                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDelete(n.id_notification)}
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
                Modal création / modification notification
               ========================================================= */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingId ? "✏️ Modifier notification" : "➕ Nouvelle notification"}</h3>

                            <button className="modal-close" onClick={() => setShowForm(false)}>
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {error && <div className="error-banner">{error}</div>}

                            <div className="form-row">
                                <label>ID Utilisateur (optionnel)</label>
                                <input
                                    name="id_utilisateur"
                                    type="number"
                                    value={form.id_utilisateur}
                                    onChange={handleChange}
                                    placeholder="Laisser vide pour tous les utilisateurs"
                                />
                            </div>

                            <div className="form-row">
                                <label>Type *</label>
                                <select
                                    name="type_notification"
                                    value={form.type_notification}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Choisir un type</option>
                                    <option value="FILM_VALIDE">Film Validé</option>
                                    <option value="FILM_REJETE">Film Rejeté</option>
                                    <option value="VOTE_OUVERT">Votes Ouverts</option>
                                    <option value="RESULTATS">Résultats</option>
                                    <option value="GENERAL">Général</option>
                                </select>
                            </div>

                            <div className="form-row">
                                <label>Contenu *</label>
                                <textarea
                                    name="contenu"
                                    value={form.contenu}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Votre message..."
                                    required
                                />
                            </div>

                            <div className="form-row checkbox-row">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="lu"
                                        checked={form.lu}
                                        onChange={handleChange}
                                    />
                                    Marquée comme lue
                                </label>
                            </div>

                            <div className="form-actions">
                                <button type="submit" disabled={loading} className="btn-primary">
                                    {loading ? "..." : editingId ? "Mettre à jour" : "Créer notification"}
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

export default NotificationsPage;