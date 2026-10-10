import React, { useEffect, useState } from "react";
import { apiFetch } from "../services/api.js";
import AnimatedJuryTitle from "../components/AnimatedJuryTitle.jsx";

function AdminUsersPage({ setPage }) {
    // =========================================================
    // États principaux
    // =========================================================
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

    // =========================================================
    // Charge la liste des utilisateurs
    // =========================================================
    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await apiFetch("/api/v1/admin/users");
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

    // =========================================================
    // Met à jour les champs texte / select
    // =========================================================
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =========================================================
    // Met à jour la checkbox actif
    // =========================================================
    const handleToggleActif = (e) => {
        setForm((prev) => ({
            ...prev,
            actif: e.target.checked,
        }));
    };

    // =========================================================
    // Ouvre le formulaire en mode création
    // =========================================================
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

    // =========================================================
    // Ouvre le formulaire en mode édition
    // =========================================================
    const handleEdit = (user) => {
        setEditingId(user.id_utilisateur);
        setForm({
            nom: user.nom || "",
            prenom: user.prenom || "",
            email: user.email || "",
            mot_de_passe: "",
            nom_role: user.nom_role || "PUBLIC",
            actif: user.actif !== 0,
        });
        setShowForm(true);
        setError("");
    };

    // =========================================================
    // Création ou mise à jour d’un utilisateur
    // =========================================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            setLoading(true);

            if (editingId) {
                const body = {
                    nom: form.nom,
                    prenom: form.prenom,
                    email: form.email,
                    nom_role: form.nom_role,
                    actif: form.actif,
                };

                // mot de passe envoyé seulement s’il a été saisi
                if (form.mot_de_passe && form.mot_de_passe.trim() !== "") {
                    body.mot_de_passe = form.mot_de_passe;
                }

                await apiFetch(`/api/v1/admin/users/${editingId}`, {
                    method: "PUT",
                    body: JSON.stringify(body),
                });
            } else {
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

            // reset propre après succès
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
        } catch (e2) {
            setError(e2.message || "Erreur lors de l'enregistrement");
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // Désactive un utilisateur
    // =========================================================
    const handleDelete = async (id) => {
        if (!window.confirm("Désactiver cet utilisateur ?")) return;

        try {
            setLoading(true);
            setError("");

            await apiFetch(`/api/v1/admin/users/${id}`, { method: "DELETE" });
            await fetchUsers();
        } catch (e) {
            setError(e.message || "Erreur lors de la désactivation");
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // Valide un compte en attente
    // =========================================================
    const handleValidate = async (user) => {
        try {
            setLoading(true);
            setError("");

            await apiFetch(`/api/v1/admin/users/${user.id_utilisateur}`, {
                method: "PUT",
                body: JSON.stringify({
                    nom: user.nom,
                    prenom: user.prenom,
                    email: user.email,
                    nom_role: user.nom_role,
                    actif: true,
                }),
            });

            await fetchUsers();
        } catch (e) {
            setError(e.message || "Erreur lors de la validation");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-content admin-users-page">
            {/* =========================================================
                Header de page
                - titre animé centré
                - boutons d’action à droite
               ========================================================= */}
            <div className="page-header admin-users-header">
                <div className="admin-users-titleArea">
                    <AnimatedJuryTitle text="Gestion Utilisateurs" />
                </div>

                <div className="page-actions admin-users-actions">
                    <button className="btn-primary" onClick={openCreateForm}>
                        ➕ Ajouter utilisateur
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
                Bloc principal : liste des utilisateurs
                Le texte "X utilisateurs au total" est maintenant ici
               ========================================================= */}
            <div className="table-section admin-users-tableSection">
                <div className="admin-users-tableTop">
                    <h3>Liste des utilisateurs</h3>

                    <p className="admin-users-subtitle admin-users-subtitle-inline">
                        {users.length} utilisateurs au total
                    </p>
                </div>

                {loading ? (
                    <div className="loading">Chargement...</div>
                ) : users.length === 0 ? (
                    <div className="empty-state">
                        <p>Aucun utilisateur</p>

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
                                <th>Statut</th>
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

                                    <td>{u.actif ? "✅ Actif" : "⏳ En attente"}</td>

                                    <td>
                                        {u.date_inscription
                                            ? new Date(u.date_inscription).toLocaleDateString("fr-FR")
                                            : "-"}
                                    </td>

                                    <td>
                                        <div className="admin-users-actionGroup">
                                            {!u.actif && (
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => handleValidate(u)}
                                                    title="Valider"
                                                >
                                                    ✅
                                                </button>
                                            )}

                                            <button
                                                className="btn-edit"
                                                onClick={() => handleEdit(u)}
                                                title="Modifier"
                                            >
                                                ✏️
                                            </button>

                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDelete(u.id_utilisateur)}
                                                title="Désactiver"
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
                Modal création / modification utilisateur
               ========================================================= */}
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
                            {error && <div className="error-banner">{error}</div>}

                            <div className="form-row">
                                <label>Nom *</label>
                                <input
                                    name="nom"
                                    value={form.nom}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <label>Prénom *</label>
                                <input
                                    name="prenom"
                                    value={form.prenom}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

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
                                <label>Mot de passe</label>
                                <input
                                    name="mot_de_passe"
                                    type="password"
                                    value={form.mot_de_passe}
                                    onChange={handleChange}
                                    placeholder={
                                        editingId
                                            ? "Laisser vide pour ne pas changer"
                                            : "Requis pour création"
                                    }
                                />
                            </div>

                            <div className="form-row">
                                <label>Rôle *</label>
                                <select
                                    name="nom_role"
                                    value={form.nom_role}
                                    onChange={handleChange}
                                >
                                    <option value="PUBLIC">PUBLIC</option>
                                    <option value="JURY">JURY</option>
                                    <option value="REALISATEUR">REALISATEUR</option>
                                    <option value="ADMIN">ADMIN</option>
                                    <option value="MANAGER">MANAGER</option>
                                </select>
                            </div>

                            <div className="form-row checkbox-row">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="actif"
                                        checked={form.actif}
                                        onChange={handleToggleActif}
                                    />
                                    Actif
                                </label>
                            </div>

                            <div className="form-actions">
                                <button type="submit" disabled={loading} className="btn-primary">
                                    {loading ? "..." : editingId ? "Mettre à jour" : "Créer utilisateur"}
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

export default AdminUsersPage;