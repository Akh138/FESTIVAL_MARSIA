import React, { useEffect, useRef, useState } from "react";
import "./styles/tokens.css";
import "./styles/background.css";
import "./App.css";
import "./styles/footer.css";

import bgVideo from "./assets/background/bg.mp4";

import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";

import FilmsPage from "./pages/FilmsPage.jsx"; // ✅ = MODÉRATION ADMIN (en attente)
import GalerieFilmsPage from "./pages/GalerieFilmsPage.jsx"; // ✅ AJOUT (galerie publique)
import VotesPage from "./pages/VotesPage.jsx";
import NewsletterPage from "./pages/NewsletterPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import OutilsIAPage from "./pages/OutilsIAPage.jsx";
import BiographiePage from "./pages/BiographiePage.jsx";

import AdminUsersPage from "./admin/AdminUsersPage.jsx";
import AdminStatsPage from "./admin/AdminStatsPage.jsx";
import AdminNewsletterPage from "./admin/AdminNewsletterPage.jsx";
import SoumissionFilmPage from "./pages/SoumissionFilmPage.jsx";
import JuryDashboardPage from "./pages/JuryDashboardPage.jsx";

import { apiFetch, clearToken, getToken } from "./services/api.js";
import AppHeader from "./components/AppHeader.jsx";
import Footer from "./components/Footer.jsx";

function App() {
    const [page, setPage] = useState("home");
    const [user, setUser] = useState(null);
    const [isBackoffice, setIsBackoffice] = useState(false);

    const bgVideoRef = useRef(null);

    useEffect(() => {
        const token = getToken();
        if (!token) return;

        (async () => {
            try {
                const data = await apiFetch("/api/v1/auth/me");
                const role = data?.user?.nom_role || data?.user?.role || "PUBLIC";

                setUser({
                    ...data.user,
                    nom_role: role,
                });
            } catch (e) {
                clearToken();
                setUser(null);
                setIsBackoffice(false);
                setPage("home");
            }
        })();
    }, []);

    useEffect(() => {
        const v = bgVideoRef.current;
        if (!v) return;

        const onMeta = () => {
            const duration = v.duration || 0;
            if (!duration) return;
            const max = Math.max(0, duration - 0.25);
            v.currentTime = Math.random() * max;
        };

        v.addEventListener("loadedmetadata", onMeta);
        return () => v.removeEventListener("loadedmetadata", onMeta);
    }, []);

    const handleLogout = () => {
        clearToken();
        setUser(null);
        setIsBackoffice(false);
        setPage("home");
    };

    const renderPage = () => {
        switch (page) {
            case "home":
                return <HomePage setPage={setPage} setUser={setUser} />;

            case "login":
                return <LoginPage setUser={setUser} setPage={setPage} />;

            case "register":
                return <RegisterPage setUser={setUser} setPage={setPage} />;

            case "admin-users":
                return <AdminUsersPage setPage={setPage} />;

            case "admin-stats":
                return <AdminStatsPage setPage={setPage} />;

            case "admin-newsletter":
                return <AdminNewsletterPage setPage={setPage} />;

            // ✅ MODÉRATION (admin)
            case "films-moderation":
                return <FilmsPage setPage={setPage} />;

            // ✅ GALERIE (public / jury / admin)
            case "galerie":
                return <GalerieFilmsPage setPage={setPage} user={user} />;

            case "soumission-film":
                return <SoumissionFilmPage setPage={setPage} />;

            case "jury-dashboard":
                return <JuryDashboardPage setPage={setPage} user={user} />;

            case "votes":
                return <VotesPage setPage={setPage} />;

            case "newsletter":
                return <NewsletterPage setPage={setPage} />;

            case "notifications":
                return <NotificationsPage setPage={setPage} />;

            case "outils":
                return <OutilsIAPage setPage={setPage} />;

            case "biographie":
                return <BiographiePage setPage={setPage} />;

            default:
                return <HomePage setPage={setPage} setUser={setUser} />;
        }
    };

    return (
        <div className="app">
            <video
                ref={bgVideoRef}
                className="app-bgVideo"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
            >
                <source src={bgVideo} type="video/mp4" />
            </video>

            <AppHeader
                isBackoffice={isBackoffice}
                setIsBackoffice={setIsBackoffice}
                page={page}
                setPage={setPage}
                user={user}
                onLogout={handleLogout}
            />

            <main className={isBackoffice ? "main-backoffice" : "main-public"}>
                {renderPage()}
            </main>

            <Footer
                onEquipe={() => {}}
                onMentions={() => {}}
                onCookies={() => {}}
                onNewsletter={() => {}}
                onAllPartners={() => {}}
            />
        </div>
    );
}

export default App;