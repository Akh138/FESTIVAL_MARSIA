import React, { useEffect, useState } from "react";
import { apiFetch } from "../services/api.js";

function AdminUsersPage({ setPage }) {
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({
        nom: "",
        prenom: "",
        email: "",
        mot_de_passe: "",
        nom_role: "PUBLIC",
        actif: true,
    });
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // 🔄 Fetch users (actifs seulement par défaut)
    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await apiFetch("/api/v1/admin/users?actif=1");
            setUsers(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e.message || "Impossible de charger les utilisateurs");
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const handleToggleActif = (e) => {
        setForm((f) => ({ ...f, actif: e.target.checked }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            setLoading(true);

            if (editingId) {
                // UPDATE (ADMIN)
                // ⚠️ mot_de_passe: si vide -> ne pas envoyer
                const body = {
                    nom: form.nom,
                    prenom: form.prenom,
                    email: form.email,
                    nom_role: form.nom_role,
                    actif: form.actif,
                };

                if (form.mot_de_passe && form.mot_de_passe.trim() !== "") {
                    body.mot_de_passe = form.mot_de_passe;
                }

                await apiFetch(`/api/v1/admin/users/${editingId}`, {
                    method: "PUT",
                    body: JSON.stringify(body),
                });
            } else {
                // CREATE (ADMIN)
                if (!form.mot_de_passe || form.mot_de_passe.trim() === "") {
                    throw new Error("Mot de passe requis pour créer un utilisateur");
                }

                await apiFetch("/api/v1/admin/users", {
                    method: "POST",
                    body: JSON.stringify({
                        nom: form.nom,
                        prenom: form.prenom,
                        email: form.email,
                        mot_de_passe: form.mot_de_passe,
                        nom_role: form.nom_role,
                        actif: form.actif,
                    }),
                });
            }

            // Reset
            setForm({
                nom: "",
                prenom: "",
                email: "",
                mot_de_passe: "",
                nom_role: "PUBLIC",
                actif: true,
            });
            setEditingId(null);
            setShowForm(false);

            await fetchUsers();
        } catch (e) {
            setError(e.message || "Erreur lors de l'enregistrement");
        } finally {
            setLoading(false);
        }
    };

    const openCreateForm = () => {
        setEditingId(null);
        setForm({
            nom: "",
            prenom: "",
            email: "",
            mot_de_passe: "",
            nom_role: "PUBLIC",
            actif: true,
        });
        setShowForm(true);
        setError("");
    };

    const handleEdit = (user) => {
        setEditingId(user.id_utilisateur);
        setForm({
            nom: user.nom || "",
            prenom: user.prenom || "",
            email: user.email || "",
            mot_de_passe: "",
            nom_role: user.nom_role || "PUBLIC",
            actif: user.actif !== 0, // 1 => true, 0 => false
        });
        setShowForm(true);
        setError("");
    };

    // ✅ “Supprimer” = désactiver (backend)
    const handleDelete = async (id) => {
        if (!window.confirm("Désactiver cet utilisateur ?")) return;

        try {
            setLoading(true);
            setError("");

            await apiFetch(`/api/v1/admin/users/${id}`, { method: "DELETE" });

            // rechargement (actifs seulement)
            await fetchUsers();
        } catch (e) {
            setError(e.message || "Erreur lors de la désactivation");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-content">
            <div className="page-header">
                <div>
                    <h1>👥 Gestion Utilisateurs</h1>
                    <p>{users.length} utilisateurs actifs</p>
                </div>
                <div className="page-actions">
                    <button className="btn-primary" onClick={openCreateForm}>
                        ➕ Ajouter utilisateur
                    </button>
                    <button className="btn-home" onClick={() => setPage("home")}>
                        ← Accueil
                    </button>
                </div>
            </div>

            {error && <div className="error-banner">{error}</div>}

            <div className="table-section">
                <h3>Liste des utilisateurs (actifs)</h3>

                {loading ? (
                    <div className="loading">Chargement...</div>
                ) : users.length === 0 ? (
                    <div className="empty-state">
                        <p>Aucun utilisateur actif</p>
                        <button className="btn-primary" onClick={openCreateForm}>
                            ➕ Ajouter le premier
                        </button>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nom complet</th>
                                <th>Email</th>
                                <th>Rôle</th>
                                <th>Actif</th>
                                <th>Date création</th>
                                <th>Actions</th>
                            </tr>
                            </thead>

                            <tbody>
                            {users.map((u) => (
                                <tr key={u.id_utilisateur}>
                                    <td>#{u.id_utilisateur}</td>
                                    <td>
                                        <strong>
                                            {u.nom} {u.prenom}
                                        </strong>
                                    </td>
                                    <td>{u.email}</td>
                                    <td>
                      <span className={`role-badge role-${u.nom_role?.toLowerCase()}`}>
                        {u.nom_role}
                      </span>
                                    </td>
                                    <td>{u.actif ? "✅" : "❌"}</td>
                                    <td>{u.date_inscription ? new Date(u.date_inscription).toLocaleDateString("fr-FR") : "-"}</td>
                                    <td>
                                        <button className="btn-edit" onClick={() => handleEdit(u)} title="Modifier">
                                            ✏️
                                        </button>
                                        <button className="btn-delete" onClick={() => handleDelete(u.id_utilisateur)} title="Désactiver">
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingId ? "✏️ Modifier utilisateur" : "➕ Créer utilisateur"}</h3>
                            <button className="modal-close" onClick={() => setShowForm(false)}>
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {error && <div className="error">{error}</div>}

                            <div className="form-row">
                                <label>Nom *</label>
                                <input name="nom" value={form.nom} onChange={handleChange} required />
                            </div>

                            <div className="form-row">
                                <label>Prénom *</label>
                                <input name="prenom" value={form.prenom} onChange={handleChange} required />
                            </div>

                            <div className="form-row">
                                <label>Email *</label>
                                <input name="email" type="email" value={form.email} onChange={handleChange} required />
                            </div>

                            <div className="form-row">
                                <label>Mot de passe</label>
                                <input
                                    name="mot_de_passe"
                                    type="password"
                                    value={form.mot_de_passe}
                                    onChange={handleChange}
                                    placeholder={editingId ? "Laisser vide pour ne pas changer" : "Requis pour création"}
                                />
                            </div>

                            <div className="form-row">
                                <label>Rôle *</label>
                                <select name="nom_role" value={form.nom_role} onChange={handleChange}>
                                    <option value="PUBLIC">PUBLIC</option>
                                    <option value="JURY">JURY</option>
                                    <option value="REALISATEUR">REALISATEUR</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </div>

                            <div className="form-row checkbox-row">
                                <label>
                                    <input type="checkbox" name="actif" checked={form.actif} onChange={handleToggleActif} />
                                    Actif
                                </label>
                            </div>

                            <div className="form-actions">
                                <button type="submit" disabled={loading} className="btn-primary">
                                    {loading ? "..." : editingId ? "Mettre à jour" : "Créer utilisateur"}
                                </button>
                                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
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

export default AdminUsersPage;