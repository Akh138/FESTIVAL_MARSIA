import React, { useEffect, useRef, useState } from "react";
import "./AppHeader.css";

export default function AppHeader({
                                      isBackoffice,
                                      setIsBackoffice,
                                      page,
                                      setPage,
                                      user,
                                      onLogout,
                                  }) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const wrapRef = useRef(null);

    const isAdmin = user?.nom_role === "ADMIN";
    const isManager = user?.nom_role === "MANAGER";
    const isJury = user?.nom_role === "JURY";

    // ferme le menu mobile quand on change de page ou de mode
    useEffect(() => {
        setIsMobileOpen(false);
    }, [page, isBackoffice]);

    // ferme le menu si clic en dehors
    useEffect(() => {
        const onDown = (e) => {
            if (!isMobileOpen) return;
            if (!wrapRef.current) return;
            if (!wrapRef.current.contains(e.target)) setIsMobileOpen(false);
        };

        window.addEventListener("mousedown", onDown);
        return () => window.removeEventListener("mousedown", onDown);
    }, [isMobileOpen]);

    return (
        <header className={isBackoffice ? "app-header header-backoffice" : "app-header header-public"}>
            <nav className="main-nav">
                {isBackoffice ? (
                    <>
                        <div className="nav-left">
                            <h1>🔧</h1>
                            <button className="btn-back" onClick={() => setIsBackoffice(false)}>
                                ← Site Public
                            </button>
                        </div>

                        <div className="nav-backoffice">
                            <div className="nav-group">
                                <h4>🔐 Gestion Admin</h4>

                                {/* utilisateurs = admin seulement */}
                                {isAdmin && (
                                    <button
                                        className={page === "admin-users" ? "active" : ""}
                                        onClick={() => setPage("admin-users")}
                                    >
                                        👥 Utilisateurs
                                    </button>
                                )}

                                {/* manager + admin */}
                                <button
                                    className={page === "films-moderation" ? "active" : ""}
                                    onClick={() => setPage("films-moderation")}
                                >
                                    🎬 Films (Modération)
                                </button>

                                <button
                                    className={page === "galerie" ? "active" : ""}
                                    onClick={() => setPage("galerie")}
                                >
                                    🖼️ Galerie (Public)
                                </button>


                                <button
                                    className={page === "admin-newsletter" ? "active" : ""}
                                    onClick={() => setPage("admin-newsletter")}
                                >
                                    📧 Newsletter (Admin)
                                </button>

                                <button
                                    className={page === "admin-stats" ? "active" : ""}
                                    onClick={() => setPage("admin-stats")}
                                >
                                    📊 Stats
                                </button>

                                <button
                                    className={page === "notifications" ? "active" : ""}
                                    onClick={() => setPage("notifications")}
                                >
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
                    <div className="mh-wrap" ref={wrapRef}>
                        <div className="mh-row">
                            <button className="mh-brand" type="button" onClick={() => setPage("home")}>
                                <span className="mh-logo" aria-hidden="true">🌐</span>
                                <span className="mh-brandText">
                                    <span className="mh-title">MARSIA FESTIVAL</span>
                                    <span className="mh-sub">IA Short Movies</span>
                                </span>
                            </button>

                            <div className="mh-links">
                                <button
                                    type="button"
                                    className={`mh-link ${page === "home" ? "is-active" : ""}`}
                                    onClick={() => setPage("home")}
                                >
                                    Accueil
                                </button>

                                <button
                                    type="button"
                                    className={`mh-link ${page === "galerie" ? "is-active" : ""}`}
                                    onClick={() => setPage("galerie")}
                                >
                                    Films
                                </button>

                                <button
                                    type="button"
                                    className={`mh-link ${page === "soumission-film" ? "is-active" : ""}`}
                                    onClick={() => setPage("soumission-film")}
                                >
                                    Participer
                                </button>
                            </div>

                            <div className="mh-actions">
                                {user ? (
                                    <>
                                        <span className="mh-hello">👋 {user.prenom}</span>

                                        {/* bouton jury */}
                                        {isJury && (
                                            <button
                                                className="mh-btn mh-btn-ghost"
                                                type="button"
                                                onClick={() => setPage("jury-dashboard")}
                                            >
                                                ⚖️ Dashboard Jury
                                            </button>
                                        )}

                                        {/* backoffice = admin + manager */}
                                        {(isAdmin || isManager) && (
                                            <button
                                                className="mh-btn mh-btn-ghost"
                                                type="button"
                                                onClick={() => {
                                                    setIsBackoffice(true);

                                                    if (isAdmin) {
                                                        setPage("admin-users");
                                                    } else if (isManager) {
                                                        setPage("films-moderation");
                                                    }
                                                }}
                                            >
                                                🔧 Backoffice
                                            </button>
                                        )}

                                        <button
                                            className="mh-btn mh-btn-danger"
                                            type="button"
                                            onClick={onLogout}
                                        >
                                            Déconnexion
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className="mh-btn mh-btn-ghost"
                                            type="button"
                                            onClick={() => setPage("login")}
                                        >
                                            Connexion
                                        </button>

                                        <button
                                            className="mh-btn mh-btn-primary"
                                            type="button"
                                            onClick={() => setPage("newsletter")}
                                        >
                                            Newsletter
                                        </button>
                                    </>
                                )}
                            </div>

                            <button
                                className="mh-mobileToggle"
                                type="button"
                                aria-label="Ouvrir le menu"
                                aria-expanded={isMobileOpen}
                                onClick={() => setIsMobileOpen((v) => !v)}
                            >
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                    <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}