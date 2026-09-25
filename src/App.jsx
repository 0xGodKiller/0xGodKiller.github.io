import React, { useState, useEffect } from 'react';
import GridCanvas from './components/GridCanvas';
import CustomCursor from './components/CustomCursor';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import ProjectsSection from './components/ProjectsSection';
import SkillsSection from './components/SkillsSection';
import ContactSection from './components/ContactSection';
import useSmoothScroll from './hooks/useSmoothScroll';

/**
 * Master App Architecture & Pipeline
 * - Global 2D Coordinate Grid Canvas (#1f1f1f / 60px)
 * - Fixed 2px scanline overlay (mix-blend-mode: overlay, 3% opacity)
 * - Spring-lerped Custom Reticle Cursor (+ to [ ])
 * - Persistent Top Tactical HUD Bar with smooth section jumps
 * - Complete 5-Section Assembly:
 *   1. HeroSection (100vh pinned disintegration & telemetry)
 *   2. AboutSection (Two-column character sheet & sweep decrypt VFX)
 *   3. ProjectsSection (100vh horizontal dolly with card momentum)
 *   4. SkillsSection (Turnstile gauges & diagonal entry VFX)
 *   5. ContactSection (Terminal message buffer & cathode collapse)
 * - Tactical Master Footer
 */
export function App() {
  const DEVELOPER_NAME = "AVINASH CHOWDARY";

  // Initialize unified Lenis smooth scroll engine driven directly through GSAP ticker
  useSmoothScroll();

  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleMove = (e) => {
      setMouseCoords({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) {
        setScrollProgress(Math.min(100, Math.max(0, Math.round((window.scrollY / total) * 100))));
      }
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el && window.lenis) {
      window.lenis.scrollTo(el, { offset: -40, duration: 1.4 });
    } else if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-pure-black text-pure-white font-sans selection:bg-pure-white selection:text-pure-black overflow-x-hidden">
      {/* Global Canvas Layer: 2D Coordinate Grid (60px in #1f1f1f on #0a0a0a) */}
      <GridCanvas />

      {/* Fixed Scanline & Vignette Overlays: 2px repeating pattern, mix-blend: overlay, 3% opacity */}
      <div className="scanline-overlay" />
      <div className="vignette-overlay" />

      {/* Custom Spring-Lerped Reticle Cursor (12px crosshair to bracketed box [ ]) */}
      <CustomCursor />

      {/* Fixed Top Tactical HUD Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-pure-black/85 backdrop-blur-md border-b border-border-gray px-6 py-3 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-pure-white animate-pulse" />
            <span className="font-bold tracking-wider text-pure-white">{DEVELOPER_NAME.replace(/\s+/g, '_')} // CORE_SYS</span>
          </div>
          <span className="text-neutral-600 hidden sm:inline">::</span>
          <span className="text-neutral-400 hidden sm:inline text-[11px]">STATUS: OPERATIONAL</span>
        </div>

        {/* Section Navigation Shortcuts */}
        <nav className="flex items-center gap-1 sm:gap-3" aria-label="Section Navigation">
          {[
            { label: 'ABOUT', id: 'about' },
            { label: 'PROJECTS', id: 'projects' },
            { label: 'SKILLS', id: 'skills' },
            { label: 'CONTACT', id: 'contact' },
          ].map((item, idx) => (
            <button
              key={item.id}
              data-cursor="interactive"
              data-cursor-text={`GOTO_${item.label}`}
              onClick={() => scrollToSection(item.id)}
              className="px-2 sm:px-3 py-1 text-[11px] tracking-wider text-neutral-400 hover:text-pure-white hover:bg-subtle-gray/70 border border-transparent hover:border-border-gray transition-colors"
            >
              [{`0${idx + 1}`}] {item.label}
            </button>
          ))}
        </nav>

        {/* Real-Time Telemetry Readouts */}
        <div className="hidden lg:flex items-center gap-4 font-mono text-[10px] text-neutral-400">
          <span>X: {mouseCoords.x.toString().padStart(4, '0')} | Y: {mouseCoords.y.toString().padStart(4, '0')}</span>
          <span className="text-neutral-600">/</span>
          <span>SCR: {scrollProgress.toString().padStart(3, '0')}%</span>
        </div>
      </header>

      {/* 1. Hero Section (100vh Pinned Disintegration & Telemetry) */}
      <HeroSection 
        name={DEVELOPER_NAME}
        subtitle="Software Engineer // Systems & Reliability // Interactive Mechanics"
        onContactClick={() => scrollToSection('contact')}
      />

      {/* 2. About Section: Two-Column Character Sheet & Sweep VFX */}
      <div className="relative z-10 px-6 max-w-7xl mx-auto py-24">
        <AboutSection />
      </div>

      {/* 3. Projects Section: Vertical-to-Horizontal Scroll Hijack (100vh Pinned Dolly) */}
      <ProjectsSection />

      {/* Subsequent Sections: Skills & Contact */}
      <main className="relative z-10 px-6 max-w-7xl mx-auto space-y-36 pb-36 pt-24">
        {/* 4. Skills Section: Turnstile Telemetry Gauges & Diagonal Slide Entry */}
        <SkillsSection />

        {/* 5. Contact Section: Terminal Message Buffer & Cathode Collapse VFX */}
        <ContactSection />
      </main>

      {/* Tactical Master Footer */}
      <footer className="relative z-10 border-t border-border-gray bg-pure-black/95 py-12 px-6 font-mono text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-pure-white inline-block" />
            <span className="text-pure-white font-bold tracking-wider">TACTICAL MONOCHROME SYSTEM</span>
            <span className="text-neutral-600 hidden sm:inline">//</span>
            <span className="text-neutral-400 hidden sm:inline">VITE + REACT + GSAP + LENIS</span>
          </div>

          <div className="flex items-center gap-6 text-neutral-400 text-[11px]">
            <span className="hidden md:inline">RENDER: CANVAS_2D_60PX</span>
            <span className="text-neutral-600 hidden md:inline">|</span>
            <button
              data-cursor="interactive"
              data-cursor-text="SCROLL_TOP"
              onClick={() => {
                if (window.lenis) window.lenis.scrollTo(0, { duration: 1.2 });
              }}
              className="text-neutral-400 hover:text-pure-white border border-border-gray px-3 py-1 hover:border-pure-white transition-colors"
            >
              [▲ RETURN TO ORIGIN]
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
