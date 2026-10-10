-- ====================================================================
-- SCRIPT DE CRÉATION DE LA BASE DE DONNÉES - FESTIVAL MARS.IA 2026
-- ====================================================================

-- 1. INITIALISATION DE LA BASE
DROP DATABASE IF EXISTS marsia;
CREATE DATABASE IF NOT EXISTS marsia;
USE marsia;

-- ====================================================================
-- 2. TABLES MÉTIER
-- ====================================================================

-- TABLE UTILISATEUR
CREATE TABLE utilisateur (
                             id_utilisateur INT AUTO_INCREMENT PRIMARY KEY,
                             nom VARCHAR(100) NOT NULL,
                             prenom VARCHAR(100) NOT NULL,
                             email VARCHAR(255) UNIQUE NOT NULL,
                             mot_de_passe VARCHAR(255) NOT NULL,
                             nom_role VARCHAR(50) DEFAULT 'PUBLIC',
                             date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP,
                             actif BOOLEAN DEFAULT TRUE
);

-- TABLE FILM
CREATE TABLE film (
                      id_film INT AUTO_INCREMENT PRIMARY KEY,
                      id_realisateur INT NOT NULL,
                      titre VARCHAR(255) NOT NULL,
                      description TEXT,
                      lien_youtube VARCHAR(500),
                      duree_secondes INT,
                      pays VARCHAR(100),
                      statut_moderation ENUM('en attente', 'approuve', 'rejete') DEFAULT 'en attente',
                      FOREIGN KEY (id_realisateur) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE
);

-- TABLE VOTE (Jury)
CREATE TABLE vote (
                      id_vote INT AUTO_INCREMENT PRIMARY KEY,
                      id_film INT NOT NULL,
                      id_jury INT NOT NULL,
                      note DECIMAL(3,2) CHECK (note >= 0 AND note <= 10),
                      commentaire TEXT,
                      FOREIGN KEY (id_film) REFERENCES film(id_film) ON DELETE CASCADE,
                      FOREIGN KEY (id_jury) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE
);

-- TABLE OUTILS IA
CREATE TABLE outil_ia (
                          id_outil INT AUTO_INCREMENT PRIMARY KEY,
                          nom_outil VARCHAR(255) NOT NULL,
                          type_outil VARCHAR(100) NOT NULL
);

-- TABLE D'ASSOCIATION FILM <-> OUTILS IA
CREATE TABLE film_outil_ia (
                               id_film INT,
                               id_outil INT,
                               version VARCHAR(50),
                               commentaire TEXT,
                               PRIMARY KEY (id_film, id_outil),
                               FOREIGN KEY (id_film) REFERENCES film(id_film) ON DELETE CASCADE,
                               FOREIGN KEY (id_outil) REFERENCES outil_ia(id_outil) ON DELETE CASCADE
);

-- TABLE NEWSLETTER
CREATE TABLE newsletter (
                            id_news INT AUTO_INCREMENT PRIMARY KEY,
                            email VARCHAR(255) UNIQUE NOT NULL,
                            langue VARCHAR(10) DEFAULT 'FR',
                            confirme BOOLEAN DEFAULT FALSE,
                            date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- TABLE NOTIFICATION
CREATE TABLE notification (
                              id_notification INT AUTO_INCREMENT PRIMARY KEY,
                              id_utilisateur INT,
                              type_notification VARCHAR(100),
                              contenu TEXT NOT NULL,
                              lu BOOLEAN DEFAULT FALSE,
                              date_envoi DATETIME DEFAULT CURRENT_TIMESTAMP,
                              FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE
);

-- TABLE BIOGRAPHIE
CREATE TABLE biographie (
                            id_biographie INT AUTO_INCREMENT PRIMARY KEY,
                            id_utilisateur INT UNIQUE,
                            texte_biographie TEXT,
                            site_officiel VARCHAR(500),
                            pays_origine VARCHAR(100),
                            FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE
);

-- ====================================================================
-- 3. INDEX D'OPTIMISATION DES REQUÊTES
-- ====================================================================
CREATE INDEX idx_utilisateur_email ON utilisateur(email);
CREATE INDEX idx_film_realisateur ON film(id_realisateur);
CREATE INDEX idx_vote_jury ON vote(id_jury);
CREATE INDEX idx_notification_utilisateur ON notification(id_utilisateur);

-- ====================================================================
-- 4. DONNÉES DE DÉPART (TEST & DÉMONSTRATION)
-- ====================================================================

-- Comptes utilisateurs (Mot de passe pour admin : admin123)
INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, nom_role, actif) VALUES
                                                                                ('Martin', 'Alice', 'alice@martin.fr', '$2a$10$rcV.wphTsQkv8g1e3Yc9i.nRLfr5i7FfShRq1jVXrYA07EiCwRNwO', 'REALISATEUR', 1),
                                                                                ('Dupont', 'Jean', 'jean@dupont.com', '$2a$10$rcV.wphTsQkv8g1e3Yc9i.nRLfr5i7FfShRq1jVXrYA07EiCwRNwO', 'JURY', 1),
                                                                                ('Leroy', 'Sophie', 'sophie@leroy.fr', '$2a$10$rcV.wphTsQkv8g1e3Yc9i.nRLfr5i7FfShRq1jVXrYA07EiCwRNwO', 'ADMIN', 1);

-- Catalogue des outils IA générative
INSERT INTO outil_ia (nom_outil, type_outil) VALUES
                                                 ('Midjourney v6', 'Génération d''images'),
                                                 ('ChatGPT / Claude', 'Scénario & Narration'),
                                                 ('Runway Gen-2', 'Génération Vidéo'),
                                                 ('Sora', 'Génération Vidéo Haute Définition'),
                                                 ('ElevenLabs', 'Synthèse Vocale & Doublage');