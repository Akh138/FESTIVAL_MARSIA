import React, { useRef, useState } from "react";
import AnimatedJuryTitle from "../components/AnimatedJuryTitle.jsx";

const API_URL = "http://localhost:8081/api/v1";

function SoumissionFilmPage({ setPage }) {
    // =========================================================
    // État du formulaire
    // =========================================================
    const [form, setForm] = useState({
        nom: "",
        prenom: "",
        email: "",
        titre: "",
        description: "",
        lien_youtube: "",
        fichier_video: null,
        duree_secondes: "",
        pays: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const fileInputRef = useRef(null);

    // =========================================================
    // Mise à jour des champs
    // =========================================================
    const handleChange = (e) => {
        setError("");
        setSuccess("");

        if (e.target.name === "fichier_video") {
            const file = e.target.files?.[0];

            if (file && file.size > 500 * 1024 * 1024) {
                setError("Fichier trop volumineux (max 500MB)");
                return;
            }

            setForm((prev) => ({
                ...prev,
                fichier_video: file || null,
            }));
            return;
        }

        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    // =========================================================
    // Envoi du formulaire
    // =========================================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // validations simples côté front
        if (!form.nom || !form.prenom || !form.email || !form.titre || !form.fichier_video) {
            setError("Merci de remplir nom, prénom, email, titre et de joindre une vidéo.");
            return;
        }

        const formData = new FormData();
        formData.append("nom", form.nom);
        formData.append("prenom", form.prenom);
        formData.append("email", form.email);
        formData.append("titre", form.titre);
        formData.append("description", form.description);
        formData.append("lien_youtube", form.lien_youtube);
        formData.append("duree_secondes", Number(form.duree_secondes) || "");
        formData.append("pays", form.pays);

        if (form.fichier_video) {
            formData.append("fichier_video", form.fichier_video);
        }

        try {
            setLoading(true);

            const res = await fetch(`${API_URL}/films/soumettre`, {
                method: "POST",
                body: formData,
            });

            const text = await res.text();
            let data = null;

            try {
                data = text ? JSON.parse(text) : null;
            } catch {
                data = text;
            }

            if (!res.ok) {
                throw new Error(data?.message || data?.error || "Erreur soumission");
            }

            // reset du formulaire
            setForm({
                nom: "",
                prenom: "",
                email: "",
                titre: "",
                description: "",
                lien_youtube: "",
                fichier_video: null,
                duree_secondes: "",
                pays: "",
            });

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            setSuccess("✅ Film soumis ! Il passera en modération (admin) avant publication.");
        } catch (err) {
            setError(err.message || "Erreur lors de la soumission");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-content submit-film-page">
            {/* =========================================================
                Header de page
                - titre animé centré
                - bouton retour à droite
               ========================================================= */}
            <div className="page-header submit-film-header">
                <div className="submit-film-titleArea">
                    <AnimatedJuryTitle text="Soumission Film" />
                </div>

                <div className="page-actions submit-film-actions">
                    <button className="btn-secondary" onClick={() => setPage("home")}>
                        ← Accueil
                    </button>
                </div>
            </div>

            {/* =========================================================
                Intro
               ========================================================= */}
            <div className="submit-film-intro">
                <p>Soumettez votre court-métrage IA sans créer de compte.</p>
            </div>

            {/* =========================================================
                Formulaire principal
               ========================================================= */}
            <form className="table-section submit-film-form" onSubmit={handleSubmit}>
                <div className="submit-film-formTop">
                    <h3>➕ Nouveau film</h3>
                    <p className="submit-film-formHint">Tous les champs marqués * sont obligatoires.</p>
                </div>

                {error && <div className="error-banner">{error}</div>}
                {success && <div className="success-banner">{success}</div>}

                {/* Coordonnées réalisateur */}
                <div className="form-row two-cols submit-film-twoCols">
                    <div>
                        <label>Nom *</label>
                        <input
                            name="nom"
                            value={form.nom}
                            onChange={handleChange}
                            required
                            placeholder="Nom"
                        />
                    </div>

                    <div>
                        <label>Prénom *</label>
                        <input
                            name="prenom"
                            value={form.prenom}
                            onChange={handleChange}
                            required
                            placeholder="Prénom"
                        />
                    </div>
                </div>

                <div className="form-row">
                    <label>Email *</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="email@exemple.com"
                    />
                </div>

                <div className="form-row">
                    <label>Titre *</label>
                    <input
                        name="titre"
                        value={form.titre}
                        onChange={handleChange}
                        required
                        placeholder="Ex : IA Dreamscapes"
                    />
                </div>

                <div className="form-row">
                    <label>Description</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Décrivez votre court-métrage..."
                    />
                </div>

                <div className="form-row submit-film-uploadRow">
                    <label>Fichier vidéo (MP4, max 500MB) *</label>

                    <input
                        ref={fileInputRef}
                        name="fichier_video"
                        type="file"
                        accept="video/*,.mp4,.avi,.mov,.mkv"
                        onChange={handleChange}
                        required
                    />

                    {form.fichier_video && (
                        <p className="file-info submit-film-fileInfo">
                            📁 {form.fichier_video.name} ({(form.fichier_video.size / 1024 / 1024).toFixed(1)} MB)
                        </p>
                    )}
                </div>

                <div className="form-row">
                    <label>Lien YouTube (optionnel)</label>
                    <input
                        name="lien_youtube"
                        value={form.lien_youtube}
                        onChange={handleChange}
                        placeholder="https://youtube.com/watch?v=..."
                    />
                </div>

                <div className="form-row two-cols submit-film-twoCols">
                    <div>
                        <label>Durée (secondes)</label>
                        <input
                            name="duree_secondes"
                            type="number"
                            min="1"
                            max="1800"
                            value={form.duree_secondes}
                            onChange={handleChange}
                            placeholder="Ex : 180"
                        />
                    </div>

                    <div>
                        <label>Pays</label>
                        <input
                            name="pays"
                            value={form.pays}
                            onChange={handleChange}
                            placeholder="France"
                        />
                    </div>
                </div>

                <div className="submit-film-submitWrap">
                    <button type="submit" disabled={loading} className="btn-primary btn-large submit-film-submitBtn">
                        {loading ? "📤 Soumission en cours..." : "📤 Soumettre mon film"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default SoumissionFilmPage;