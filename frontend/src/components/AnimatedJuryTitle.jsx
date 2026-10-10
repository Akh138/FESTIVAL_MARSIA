import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import "./AnimatedJuryTitle.css";

function AnimatedJuryTitle({ text = "Dashboard Jury" }) {

    const rootRef = useRef(null);

    const letters = text.split("");

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const chars = gsap.utils.toArray(".animated-jury-title__char");
            const particles = gsap.utils.toArray(".animated-jury-title__particle");
            const flash = rootRef.current?.querySelector(".animated-jury-title-flash");

            // état initial lettres
            gsap.set(chars, {
                opacity: 0,
                x: () => gsap.utils.random(-280, 280),
                y: () => gsap.utils.random(-180, 180),
                rotation: () => gsap.utils.random(-220, 220),
                scale: 0
            });

            // état initial particules
            gsap.set(particles, {
                opacity: 0,
                x: 0,
                y: 0,
                scale: 0
            });

            // état initial flash
            if (flash) {
                gsap.set(flash, {
                    opacity: 0,
                    scaleX: 0.7,
                    scaleY: 0.8
                });
            }

            // entrée des lettres
            gsap.to(chars, {
                x: 0,
                y: 0,
                rotation: 0,
                scale: 1,
                opacity: 1,
                duration: 0.9,
                ease: "power4.out",
                stagger: 0.045
            });

            // flash électrique à l'entrée
            if (flash) {
                gsap.to(flash, {
                    opacity: 0.9,
                    scaleX: 1.08,
                    scaleY: 1,
                    duration: 0.12,
                    delay: 0.35,
                    ease: "power2.out",
                    yoyo: true,
                    repeat: 1
                });
            }

            // petites particules au chargement
            gsap.to(particles, {
                opacity: () => gsap.utils.random(0.35, 0.85),
                x: () => gsap.utils.random(-160, 160),
                y: () => gsap.utils.random(-70, 70),
                scale: () => gsap.utils.random(0.7, 1.4),
                duration: () => gsap.utils.random(0.8, 1.4),
                ease: "power2.out",
                stagger: 0.03,
                onComplete: () => {
                    gsap.to(particles, {
                        opacity: 0,
                        duration: 0.45,
                        stagger: 0.015,
                        ease: "power1.out"
                    });
                }
            });

            const node = rootRef.current;

            const hoverIn = () => {
                gsap.to(chars, {
                    y: -3,
                    scale: 1.04,
                    duration: 0.25,
                    stagger: 0.02,
                    ease: "power1.out"
                });
            };

            const hoverOut = () => {
                gsap.to(chars, {
                    y: 0,
                    scale: 1,
                    duration: 0.25,
                    stagger: 0.02,
                    ease: "power1.out"
                });
            };

            node.addEventListener("mouseenter", hoverIn);
            node.addEventListener("mouseleave", hoverOut);

            return () => {
                node.removeEventListener("mouseenter", hoverIn);
                node.removeEventListener("mouseleave", hoverOut);
            };
        }, rootRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={rootRef} className="animated-jury-title-wrap">
            <div className="animated-jury-title-glow" />
            <div className="animated-jury-title-flash" />

            <div className="animated-jury-title-lightning" aria-hidden="true">
                <span className="animated-jury-title__bolt animated-jury-title__bolt--1" />
                <span className="animated-jury-title__bolt animated-jury-title__bolt--2" />
            </div>

            <div className="animated-jury-title-particles" aria-hidden="true">
                {Array.from({ length: 16 }).map((_, index) => (
                    <span
                        key={index}
                        className="animated-jury-title__particle"
                    />
                ))}
            </div>

            <h1 className="animated-jury-title">
                {letters.map((char, index) => (
                    <span
                        key={index}
                        className="animated-jury-title__char"
                    >
                        {char === " " ? "\u00A0" : char}
                    </span>
                ))}
            </h1>
        </div>
    );
}

export default AnimatedJuryTitle;