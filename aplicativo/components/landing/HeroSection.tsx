"use client";

import React, { useEffect, useRef } from 'react';
import styles from './hero.module.scss';
import { motion } from 'framer-motion';

export const HeroSection = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // The requested phrase
    const phrase = "DIGITALIZANDO EL CORAZÓN DE TU BARRIO";
    const letters = phrase.split("");

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        // Particle system
        const particles: { x: number, y: number, vx: number, vy: number, s: number, alpha: number }[] = [];
        const particleCount = width < 768 ? 40 : 80; // Fewer particles on mobile

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                s: Math.random() * 2 + 0.5,
                alpha: Math.random() * 0.5 + 0.1
            });
        }

        let animationFrameId: number;

        const animate = () => {
            if (!ctx) return;
            // Clear completely instead of trail for crisp visibility first
            ctx.clearRect(0, 0, width, height);

            // Draw background gradient explicitly if needed, but CSS handles it. 
            // Let's just draw particles brighter.

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                // Wrap around screen
                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                ctx.beginPath();
                // Bigger particles
                ctx.arc(p.x, p.y, p.s * 1.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(19, 236, 128, ${p.alpha + 0.2})`; // Brighter Green
                ctx.fill();
            });

            // Connect nearby particles for 3D web effect
            ctx.strokeStyle = 'rgba(19, 236, 128, 0.15)'; // More visible lines
            ctx.lineWidth = 0.8;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resize);
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const handleScrollDown = () => {
        window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
        });
    };

    return (
        <section className={styles.heroContainer}>
            <div className={styles.canvasContainer}>
                <canvas ref={canvasRef} />
            </div>

            <div className={styles.content}>
                {letters.map((char, idx) => (
                    <span key={idx} style={{ "--idx": idx } as React.CSSProperties}>
                        {char === " " ? "\u00A0" : char}
                    </span>
                ))}
            </div>

            <motion.div
                className={styles.scrollIndicator}
                onClick={handleScrollDown}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
            >
                <span>Descubre Más</span>
                <span className="material-symbols-outlined mt-2">keyboard_double_arrow_down</span>
            </motion.div>
        </section>
    );
};
