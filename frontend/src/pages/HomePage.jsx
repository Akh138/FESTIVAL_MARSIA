import React, { useState } from "react";
import AnimatedJuryTitle from "../components/AnimatedJuryTitle.jsx";
import bannerImg from "../assets/banniere/nouvelle-banniere.png";
import "../styles/pages/home.css";

function HomePage({ setPage }) {
    return (
        <div className="homepage">
            {/* =========================================================
                Bannière principale
                - image vivante
                - titre animé MarsIA 2026
               ========================================================= */}
            <section className="marsia-banner" aria-label="Bannière MarsIA 2026">
                <img className="marsia-banner__img" src={bannerImg} alt="MarsIA 2026" />
                <div className="marsia-banner__fx" aria-hidden="true" />
                <div className="marsia-banner__overlay" aria-hidden="true" />

                <div className="marsia-banner__content">
                    <AnimatedJuryTitle text="MarsIA 2026" />
                </div>
            </section>

            {/* =========================================================
                CTA placée AVANT le carrousel
                - plus pro
                - plus logique pour pousser à l’action
               ========================================================= */}
            <section className="cta-section">
                <div className="cta-card">
                    <h2>Participez à MARSIA 2026</h2>
                    <p>Déposez votre court-métrage IA avant le 31 mars.</p>

                    <div className="cta-actions">
                        <button
                            className="home-gold-btn"
                            onClick={() => setPage?.("soumission-film")}
                        >
                            S'inscrire gratuitement
                        </button>
                    </div>
                </div>
            </section>

            {/* =========================================================
                Section coverflow
               ========================================================= */}
            <section className="films-section">
                <div className="films-titleWrap">
                    <div className="films-titlePill">
                        <h2>Meilleures Sélections</h2>
                    </div>
                </div>

                <Coverflow />
            </section>
        </div>
    );
}

function Coverflow() {
    // =========================================================
    // Données temporaires mockées
    // À remplacer plus tard si tu relies avec l’API
    // =========================================================
    const films = Array.from({ length: 6 }).map((_, i) => ({
        id: i + 1,
        title: `Film ${i + 1}`,
        posterUrl: null,
    }));

    const [active, setActive] = useState(2);
    const total = films.length;

    // =========================================================
    // Navigation circulaire
    // =========================================================
    const prev = () => {
        setActive((v) => (v - 1 + total) % total);
    };

    const next = () => {
        setActive((v) => (v + 1) % total);
    };

    // =========================================================
    // Position de chaque carte
    // =========================================================
    const getClass = (idx) => {
        if (idx === active) return "coverflow-card is-active";
        if (idx === (active - 1 + total) % total) return "coverflow-card is-left";
        if (idx === (active + 1) % total) return "coverflow-card is-right";
        return "coverflow-card is-far";
    };

    return (
        <div className="coverflow">
            <div className="coverflow-shell">
                <div className="coverflow-stage">
                    <button
                        type="button"
                        className="coverflow-btn left"
                        onClick={prev}
                        aria-label="Précédent"
                    >
                        ‹
                    </button>

                    {films.map((f, idx) => (
                        <article
                            key={f.id}
                            className={getClass(idx)}
                            onClick={() => setActive(idx)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    setActive(idx);
                                }
                            }}
                            role="button"
                            tabIndex={0}
                            aria-label={f.title}
                        >
                            <div className="coverflow-cardInner">
                                <div
                                    className="coverflow-poster"
                                    style={f.posterUrl ? { backgroundImage: `url(${f.posterUrl})` } : undefined}
                                />

                                <div className="coverflow-overlay">
                                    <div className="coverflow-filmTitle">{f.title}</div>
                                </div>
                            </div>
                        </article>
                    ))}

                    <button
                        type="button"
                        className="coverflow-btn right"
                        onClick={next}
                        aria-label="Suivant"
                    >
                        ›
                    </button>
                </div>

                <div className="coverflow-dots">
                    {films.map((f, idx) => (
                        <button
                            key={f.id}
                            type="button"
                            className={`coverflow-dot ${idx === active ? "active" : ""}`}
                            onClick={() => setActive(idx)}
                            aria-label={`Aller au ${f.title}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default HomePage;