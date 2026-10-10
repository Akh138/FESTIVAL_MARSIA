import React from "react";

// Logos partenaires
import CNC from "../assets/partners/CNC.png";
import EXTRA from "../assets/partners/EXTRA.png";
import GLOBAL from "../assets/partners/GLOBAL.png";
import LAPLATEFORME from "../assets/partners/LAPLATEFORME.png";
import MFF from "../assets/partners/MFF.png";
import PSL from "../assets/partners/PSL.png";
import SACD from "../assets/partners/SACD.jpg";
import UDNP from "../assets/partners/UDNP.png";
import UNESCO from "../assets/partners/UNESCO.png";

export default function Footer({
                                   onEquipe,
                                   onMentions,
                                   onCookies,
                                   onNewsletter,
                                   onAllPartners,
                               }) {
    const logos = [
        { src: UDNP, alt: "UNDP" },
        { src: GLOBAL, alt: "Global Youth Biodiversity Network" },
        { src: PSL, alt: "PSL Université Paris" },
        { src: CNC, alt: "CNC" },
        { src: MFF, alt: "Mobile Film Festival" },
        { src: EXTRA, alt: "L'Extra Court" },
        { src: UNESCO, alt: "UNESCO" },
        { src: SACD, alt: "SACD" },
        { src: LAPLATEFORME, alt: "La Plateforme" },
    ];

    return (
        <footer className="marsia-footer">
            <div className="marsia-footer__inner">
                {/* Colonne gauche */}
                <div className="marsia-footer__col marsia-footer__col--left">
                    <button type="button" className="marsia-footer__btn" onClick={onEquipe}>
                        Équipe
                    </button>
                    <button type="button" className="marsia-footer__btn" onClick={onMentions}>
                        Mentions légales
                    </button>
                    <button type="button" className="marsia-footer__btn" onClick={onCookies}>
                        Cookies
                    </button>
                </div>

                {/* Centre : logos */}
                <div className="marsia-footer__center">
                    <div className="marsia-footer__logos" aria-label="Partenaires">
                        {logos.map((l) => (
                            <img
                                key={l.alt}
                                className="marsia-footer__logo"
                                src={l.src}
                                alt={l.alt}
                                loading="lazy"
                            />
                        ))}
                    </div>
                </div>

                {/* Colonne droite */}
                <div className="marsia-footer__col marsia-footer__col--right">
                    <button type="button" className="marsia-footer__btn" onClick={onNewsletter}>
                        Newsletter
                    </button>
                    <button type="button" className="marsia-footer__btn" onClick={onAllPartners}>
                        Tous les partenaires
                    </button>
                </div>
            </div>
        </footer>
    );
}