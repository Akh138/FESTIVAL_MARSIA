import React, { useEffect, useRef } from "react";

export default function AppHeader({
                                      isBackoffice,
                                      setIsBackoffice,
                                      page,
                                      setPage,
                                      user,
                                      onLogout,
                                  }) {
    const [isPublicMenuOpen, setIsPublicMenuOpen] = React.useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        setIsPublicMenuOpen(false);
    }, [page, isBackoffice]);

    useEffect(() => {
        const onDown = (e) => {
            if (!isPublicMenuOpen) return;
            if (!menuRef.current) return;
            if (!menuRef.current.contains(e.target)) setIsPublicMenuOpen(false);
        };
        window.addEventListener("mousedown", onDown);
        return () => window.removeEventListener("mousedown", onDown);
    }, [isPublicMenuOpen]);

    // ✅ anti-bug ultime : même si un CSS externe tente de bouger le header
    const headerStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        width: "100%",
        zIndex: 99999,
        transform: "none",
    };

    return (
        <header
            style={headerStyle}
            className={isBackoffice ? "app-header header-backoffice" : "app-header header-public"}
        >
            <nav className="main-nav">
                {/* (TON CONTENU INCHANGÉ CI-DESSOUS) */}
                {isBackoffice ? (
                    <>
                        <div className="nav-left">
                            <h1>🔧Dashboard Admin</h1>
                            <button className="btn-back" onClick={() => setIsBackoffice(false)}>
                                ← Site Public
                            </button>
                        </div>

                        <div className="nav-backoffice">
                            <div className="nav-group">
                                <h4>🔐 Gestion Admin</h4>

                                <button className={page === "admin-users" ? "active" : ""} onClick={() => setPage("admin-users")}>
                                    👥 Utilisateurs
                                </button>

                                <button className={page === "films" ? "active" : ""} onClick={() => setPage("films")}>
                                    🎬 Films
                                </button>

                                <button className={page === "votes" ? "active" : ""} onClick={() => setPage("votes")}>
                                    🗳️ Votes
                                </button>

                                <button className={page === "newsletter" ? "active" : ""} onClick={() => setPage("newsletter")}>
                                    📧 Newsletter
                                </button>

                                <button className={page === "admin-stats" ? "active" : ""} onClick={() => setPage("admin-stats")}>
                                    📊 Stats
                                </button>

                                <button className={page === "notifications" ? "active" : ""} onClick={() => setPage("notifications")}>
                                    🔔 Notifications
                                </button>
                            </div>
                        </div>

                        <div className="nav-right">
                            <button className="btn-logout" onClick={onLogout}>
                                🚪 Déconnexion
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* GAUCHE */}
                        <div className="hp-left" ref={menuRef}>
                            <div className="hp-brand" onClick={() => setPage("home")} role="button" tabIndex={0}>
                                <div className="hp-logoMark" aria-hidden="true">🌐</div>
                                <div className="hp-brandText">
                                    <div className="hp-brandTitle">MARSIA FESTIVAL</div>
                                    <div className="hp-brandSub">IA Short Movies</div>
                                </div>
                            </div>

                            <button
                                className="hp-burger"
                                type="button"
                                aria-label="Ouvrir le menu"
                                aria-expanded={isPublicMenuOpen}
                                onClick={() => setIsPublicMenuOpen((v) => !v)}
                            >
                                ☰
                            </button>

                            {isPublicMenuOpen && (
                                <div className="hp-menuPanel" role="dialog" aria-label="Menu">
                                    <div className="hp-menuGroup">
                                        <button onClick={() => setPage("home")}>Accueil</button>
                                        <button onClick={() => setPage("films")}>Films</button>
                                        <button onClick={() => setPage("soumission-film")}>Participer</button>
                                    </div>

                                    <div className="hp-menuDivider" />

                                    {user ? (
                                        <div className="hp-menuGroup">
                                            <div className="hp-hello">👋 {user.prenom}</div>

                                            {user.nom_role === "ADMIN" && (
                                                <button className="hp-menuAction" onClick={() => setIsBackoffice(true)}>
                                                    🔧 Backoffice
                                                </button>
                                            )}

                                            <button className="hp-menuDanger" onClick={onLogout}>
                                                🚪 Déconnexion
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="hp-menuGroup">
                                            <button onClick={() => setPage("login")}>Connexion</button>
                                            <button className="hp-menuAction" onClick={() => setPage("register")}>
                                                S'inscrire
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* CENTRE */}
                        <div className="hp-center">
                            <div className="hp-pills">
                                <button className={`hp-pill ${page === "home" ? "active" : ""}`} onClick={() => setPage("home")}>
                                    Accueil
                                </button>
                                <button className={`hp-pill ${page === "films" ? "active" : ""}`} onClick={() => setPage("films")}>
                                    Films
                                </button>
                                <button className={`hp-pill ${page === "soumission-film" ? "active" : ""}`} onClick={() => setPage("soumission-film")}>
                                    Participer
                                </button>
                            </div>
                        </div>

                        {/* DROITE */}
                        <div className="hp-right">
                            <div className="hp-icons">
                                <button className="hp-iconBtn" type="button" aria-label="YouTube">
                                    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                                        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.5 12 3.5 12 3.5s-7.6 0-9.4.6A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.8.6 9.4.6 9.4.6s7.6 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.8 15.5V8.5l6 3.5-6 3.5z" />
                                    </svg>
                                </button>

                                <button className="hp-iconBtn" type="button" aria-label="Rechercher">
                                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2">
                                        <circle cx="11" cy="11" r="7" />
                                        <line x1="16.65" y1="16.65" x2="21" y2="21" />
                                    </svg>
                                </button>
                            </div>

                            <div className="hp-langs" aria-label="Langue">
                                <button className="hp-flag" type="button" aria-label="Français">
                                    <svg viewBox="0 0 3 2" width="24" height="24">
                                        <rect width="1" height="2" fill="#0055A4" />
                                        <rect x="1" width="1" height="2" fill="#FFFFFF" />
                                        <rect x="2" width="1" height="2" fill="#EF4135" />
                                    </svg>
                                </button>

                                <button className="hp-flag" type="button" aria-label="English">
                                    <svg viewBox="0 0 60 30" width="24" height="24">
                                        <clipPath id="t">
                                            <path d="M0,0 v30 h60 v-30 z" />
                                        </clipPath>
                                        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
                                        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFF" strokeWidth="6" />
                                        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" clipPath="url(#t)" />
                                        <path d="M30,0 v30 M0,15 h60" stroke="#FFF" strokeWidth="10" />
                                        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </nav>
        </header>
    );
}