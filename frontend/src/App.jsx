import React, { useEffect, useState } from "react";
import "./styles/tokens.css";
import "./styles/background.css";
import "./App.css";

import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";

import FilmsPage from "./pages/FilmsPage.jsx";
import VotesPage from "./pages/VotesPage.jsx";
import NewsletterPage from "./pages/NewsletterPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import OutilsIAPage from "./pages/OutilsIAPage.jsx";
import BiographiePage from "./pages/BiographiePage.jsx";

import AdminUsersPage from "./admin/AdminUsersPage.jsx";
import AdminStatsPage from "./admin/AdminStatsPage.jsx";
import SoumissionFilmPage from "./pages/SoumissionFilmPage.jsx";
import JuryDashboardPage from "./pages/JuryDashboardPage.jsx";

import { apiFetch, clearToken, getToken } from "./services/api.js";
import AppHeader from "./components/AppHeader.jsx";
import HeaderPortal from "./components/HeaderPortal.jsx";

function App() {
    const [page, setPage] = useState("home");
    const [user, setUser] = useState(null);
    const [isBackoffice, setIsBackoffice] = useState(false);

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
            case "soumission-film":
                return <SoumissionFilmPage setPage={setPage} />;
            case "jury-dashboard":
                return <JuryDashboardPage setPage={setPage} user={user} />;

            case "films":
                return <FilmsPage setPage={setPage} />;
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
        <>
            <HeaderPortal>
                <AppHeader
                    isBackoffice={isBackoffice}
                    setIsBackoffice={setIsBackoffice}
                    page={page}
                    setPage={setPage}
                    user={user}
                    onLogout={handleLogout}
                />
            </HeaderPortal>

            <div className="app">
                <main className={isBackoffice ? "main-backoffice" : "main-public"}>
                    {renderPage()}
                </main>
            </div>
        </>
    );
}

export default App;