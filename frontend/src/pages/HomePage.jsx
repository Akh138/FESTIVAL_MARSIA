import React, { useState } from "react";
import circuitBg from "../assets/circuit-bg.jpeg";

function HomePage() {
    return (
        <div className="homepage">
            {/* BACKGROUND LAYERS (image + lightning léger) */}
            <div
                className="home-bgImage"
                style={{ backgroundImage: `url(${circuitBg})` }}
                aria-hidden="true"
            />
            <div className="home-bgLightning" aria-hidden="true" />

            {/* HERO SECTION */}
            <section className="hero">
                <video autoPlay muted loop className="hero-video">
                    <source src="/hero-bg.mp4" type="video/mp4" />
                </video>
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1>MARSIA 2026</h1>
                </div>
            </section>

            {/* FILMS SELECTION (COVERFLOW) */}
            <section className="films-section">
                <div className="films-titleWrap">
                    <div className="films-titlePill">
                        <h2>Meilleures Selections</h2>
                    </div>
                </div>

                <Coverflow />
            </section>

            {/* INSCRIPTION CALL TO ACTION */}
            <section className="cta-section">
                <h2>Participez à MARSIA 2026</h2>
                <p>Déposez votre court-métrage IA avant le 31 mars</p>
                <button className="btn-primary btn-xl">S'inscrire gratuitement</button>
            </section>
        </div>
    );
}

function Coverflow() {
    const films = Array.from({ length: 6 }).map((_, i) => ({
        id: i + 1,
        title: `Film ${i + 1}`,
        posterUrl: null,
    }));

    const [active, setActive] = useState(2);

    const prev = () => setActive((v) => Math.max(0, v - 1));
    const next = () => setActive((v) => Math.min(films.length - 1, v + 1));

    const getClass = (idx) => {
        if (idx === active) return "coverflow-card is-active";
        if (idx === active - 1) return "coverflow-card is-left";
        if (idx === active + 1) return "coverflow-card is-right";
        return "coverflow-card is-far";
    };

    return (
        <div className="coverflow">
            <div className="coverflow-stage">
                <button
                    type="button"
                    className="coverflow-btn left"
                    onClick={prev}
                    disabled={active === 0}
                    aria-label="Précédent"
                >
                    ‹
                </button>

                {films.map((f, idx) => (
                    <article
                        key={f.id}
                        className={getClass(idx)}
                        onClick={() => setActive(idx)}
                        role="button"
                        tabIndex={0}
                    >
                        <div
                            className="coverflow-poster"
                            style={f.posterUrl ? { backgroundImage: `url(${f.posterUrl})` } : undefined}
                            aria-label={f.title}
                        />
                    </article>
                ))}

                <button
                    type="button"
                    className="coverflow-btn right"
                    onClick={next}
                    disabled={active === films.length - 1}
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
    );
}

export default HomePage;