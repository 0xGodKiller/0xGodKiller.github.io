import React, { useEffect, useRef, useState, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, CornerDownRight, Terminal } from 'lucide-react';
import useDeviceCapabilities from '../hooks/useDeviceCapabilities';

gsap.registerPlugin(ScrollTrigger);

/**
 * Optimized HeroSection Component
 * - Hardware-accelerated canvas particle pool for disintegration (zero DOM node pollution).
 * - Enforces anticipatePin: 1 and fastScrollEnd: true for jitter-free high-velocity scrolling.
 * - Compositor-isolated transforms: translate3d and opacity only.
 * - Dynamic will-change lifecycle cleanup.
 */
export const HeroSection = ({
  name = "NEIL SHAH",
  subtitle = "Software Engineer // Systems & Reliability // Interactive Mechanics",
  onContactClick,
}) => {
  const { prefersReducedMotion, isLowPower } = useDeviceCapabilities();
  const heroContainerRef = useRef(null);
  const heroContentRef = useRef(null);
  const gridTiltRef = useRef(null);
  const headlineRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonsRef = useRef(null);
  const particleCanvasRef = useRef(null);

  // Dynamic telemetry states
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [scrollPct, setScrollPct] = useState(0);

  // Pre-allocated particle pool for zero-allocation canvas disintegration
  const particlePool = useMemo(() => {
    if (prefersReducedMotion) return [];
    const pool = [];
    const count = 90;
    for (let i = 0; i < count; i++) {
      pool.push({
        relX: 0.05 + Math.random() * 0.90, // Relative X inside headline bounding area
        relY: 0.15 + Math.random() * 0.70, // Relative Y
        size: Math.random() > 0.6 ? (Math.random() > 0.85 ? 8 : 6) : 4,
        driftY: 220 + Math.random() * 380,
        driftX: (Math.random() - 0.5) * 260,
        rot: (Math.random() - 0.5) * 3.14,
        delay: Math.random() * 0.35,
      });
    }
    return pool;
  }, [prefersReducedMotion]);

  useEffect(() => {
    // 1. Mouse telemetry & 2D perspective grid tilt (Disabled in low-power or reduced-motion)
    const handleMouseMove = (e) => {
      setCoords({ x: e.clientX, y: e.clientY });

      if (gridTiltRef.current && !isLowPower && !prefersReducedMotion) {
        const normX = (e.clientX / window.innerWidth - 0.5) * 2;
        const normY = (e.clientY / window.innerHeight - 0.5) * 2;

        gsap.to(gridTiltRef.current, {
          rotateY: normX * 4,
          rotateX: -normY * 4,
          x: normX * 12,
          y: normY * 12,
          force3D: true,
          duration: 0.75,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }
    };

    // 2. Scroll percentage telemetry
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        const pct = Math.min(100, Math.max(0, Math.round((window.scrollY / maxScroll) * 100)));
        setScrollPct(pct);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isLowPower, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const container = heroContainerRef.current;
    const canvas = particleCanvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Manage canvas HiDPI scaling
    const resizeCanvas = () => {
      const rect = headlineRef.current?.getBoundingClientRect();
      if (!rect) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * 1.5 * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height * 1.5}px`;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle pool rendering function based on scrub progress (0 to 1)
    const renderParticles = (scrubProgress) => {
      const rect = headlineRef.current?.getBoundingClientRect();
      if (!rect) return;

      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      // If scrub is near 0 or 1, don't draw
      if (scrubProgress <= 0.01 || scrubProgress >= 0.95) return;

      ctx.fillStyle = '#f5f5f5';

      particlePool.forEach((p) => {
        // Individual particle timeline progression
        const t = Math.max(0, Math.min(1, (scrubProgress - p.delay * 0.4) / (0.85 - p.delay * 0.4)));
        if (t <= 0 || t >= 1) return;

        const currentX = p.relX * rect.width + p.driftX * t;
        const currentY = p.relY * rect.height + p.driftY * t;
        const currentScale = Math.max(0, 1 - t);
        const alpha = Math.max(0, (1 - t) * 0.95);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(currentX, currentY);
        ctx.rotate(p.rot * t);
        const s = p.size * currentScale;
        ctx.fillRect(-s / 2, -s / 2, s, s);
        ctx.restore();
      });
    };

    const ctxGsap = gsap.context(() => {
      const charElements = headlineRef.current?.querySelectorAll('.headline-char');

      // State object for particle scrubbing
      const particleState = { progress: 0 };

      // Main disintegration timeline scrubbed to scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: '+=100%',
          pin: true,
          scrub: 0.75,
          anticipatePin: 1, // Pinning stabilization
          fastScrollEnd: true, // Prevents lag & layout shifts during high-velocity flings
          onUpdate: (self) => {
            particleState.progress = self.progress;
            renderParticles(self.progress);
          },
          onLeave: () => {
            // Clean up canvas on leave to free GPU resources
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          },
        },
      });

      // Phase 1: Solid headline characters shatter & drop (Compositor-isolated translate3d & opacity)
      if (charElements && charElements.length > 0) {
        tl.to(
          charElements,
          {
            y: (i) => 120 + ((i % 4) * 45),
            x: (i) => ((i % 2 === 0 ? 1 : -1) * (20 + (i * 4))),
            scale: 0.4,
            rotation: (i) => (i % 2 === 0 ? 15 : -15),
            opacity: 0,
            force3D: true,
            stagger: {
              each: 0.015,
              from: 'random',
            },
            ease: 'power2.in',
            duration: 0.65,
          },
          0
        );
      }

      // Phase 2: Subtitle, buttons, and telemetry fade and slide down
      if (subtitleRef.current) {
        tl.to(
          subtitleRef.current,
          {
            y: 40,
            opacity: 0,
            force3D: true,
            duration: 0.45,
            ease: 'power2.in',
          },
          0.1
        );
      }

      if (buttonsRef.current) {
        tl.to(
          buttonsRef.current,
          {
            y: 50,
            opacity: 0,
            force3D: true,
            duration: 0.45,
            ease: 'power2.in',
          },
          0.15
        );
      }

      // Phase 3: Final hero content fade out to 0 opacity for seamless handoff
      if (heroContentRef.current) {
        tl.to(
          heroContentRef.current,
          {
            opacity: 0,
            duration: 0.3,
            ease: 'power1.inOut',
          },
          0.65
        );
      }
    }, heroContainerRef);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      ctxGsap.revert();
    };
  }, [particlePool]);

  const handleStartExploring = () => {
    const target = document.getElementById('about');
    if (target && window.lenis) {
      window.lenis.scrollTo(target, { duration: 1.4, offset: 0 });
    } else if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContact = () => {
    if (onContactClick) {
      onContactClick();
      return;
    }
    const target = document.getElementById('contact');
    if (target && window.lenis) {
      window.lenis.scrollTo(target, { duration: 1.4, offset: -40 });
    } else if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      ref={heroContainerRef}
      className="relative w-full h-screen bg-pure-black overflow-hidden flex flex-col justify-between select-none gpu-accelerate"
    >
      {/* 2D Perspective Grid Tilt Plane */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ perspective: '1000px' }}
      >
        <div
          ref={gridTiltRef}
          className="absolute -inset-[20%] opacity-25 gpu-accelerate"
          style={{
            backgroundImage: `
              linear-gradient(to right, #1f1f1f 1px, transparent 1px),
              linear-gradient(to bottom, #1f1f1f 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            transformStyle: 'preserve-3d',
          }}
        />
      </div>

      {/* Top Corners: Persistent Monospace Coordinate Readouts */}
      <div className="relative z-30 w-full px-6 md:px-12 pt-8 flex items-center justify-between font-mono text-[11px] text-neutral-400 pointer-events-none">
        {/* Top-Left: Mouse X/Y Telemetry */}
        <div className="flex items-center gap-2 border border-border-gray/80 bg-pure-black/90 px-3 py-1.5 backdrop-blur-sm pointer-events-auto">
          <span className="w-1.5 h-1.5 bg-pure-white inline-block animate-ping" />
          <span className="text-neutral-500">COORD //</span>
          <span className="text-pure-white font-semibold tracking-wider">
            X: {coords.x.toString().padStart(4, '0')} | Y: {coords.y.toString().padStart(4, '0')}
          </span>
        </div>

        {/* Top-Right: Dynamic Scroll Percentage Telemetry */}
        <div className="flex items-center gap-2 border border-border-gray/80 bg-pure-black/90 px-3 py-1.5 backdrop-blur-sm pointer-events-auto">
          <span className="text-neutral-500">SCR_TELEMETRY //</span>
          <span className="text-pure-white font-semibold tracking-wider">
            {scrollPct.toString().padStart(3, '0')}%
          </span>
          <span className="text-neutral-500 hidden sm:inline">[MOMENTUM_SYNC]</span>
        </div>
      </div>

      {/* Main Center Content: Headline, Canvas Particle Pool & Subtitle */}
      <div
        ref={heroContentRef}
        className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 max-w-6xl mx-auto w-full text-center gpu-accelerate"
      >
        {/* Tactical Status Tag */}
        <div className="mb-4 inline-flex items-center gap-2 font-mono text-[10px] tracking-widest text-neutral-400 uppercase border border-border-gray bg-pure-black/80 px-2.5 py-1">
          <Terminal size={11} className="text-pure-white" />
          <span>ORIGIN_MATRIX // LEVEL_00</span>
          <span className="text-subtle-gray">::</span>
          <span className="text-pure-white">ENGAGED</span>
        </div>

        {/* Oversized Ultra-Bold Headline with Hardware-Accelerated Particle Canvas Layer */}
        <div
          ref={headlineRef}
          className="relative inline-block my-2 max-w-full"
        >
          {/* Hardware-Accelerated Canvas Particle Pool (Zero DOM overhead) */}
          <canvas
            ref={particleCanvasRef}
            aria-hidden="true"
            className="absolute top-0 left-0 pointer-events-none z-10 gpu-accelerate"
          />

          {/* Primary Split Character Headline Text */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter uppercase text-pure-white leading-none flex flex-wrap justify-center gap-x-4 sm:gap-x-6 gap-y-2">
            {name.trim().split(/\s+/).map((word, wordIndex) => (
              <span
                key={wordIndex}
                className="inline-block whitespace-nowrap"
              >
                {word.split('').map((char, charIndex) => (
                  <span
                    key={charIndex}
                    className="headline-char inline-block gpu-accelerate"
                  >
                    {char}
                  </span>
                ))}
              </span>
            ))}
          </h1>
        </div>

        {/* Clean Subtitle */}
        <p
          ref={subtitleRef}
          className="font-mono text-xs sm:text-sm md:text-base text-neutral-400 max-w-2xl mt-5 tracking-wide leading-relaxed gpu-accelerate"
        >
          {subtitle}
        </p>
      </div>

      {/* Bottom Area: Outline Inverting Action Buttons & Scroll Hint */}
      <div
        ref={buttonsRef}
        className="relative z-30 w-full px-6 md:px-12 pb-10 flex flex-col sm:flex-row items-center justify-between gap-6 gpu-accelerate"
      >
        <div className="flex items-center gap-4">
          {/* Button 1: [START EXPLORING] */}
          <button
            data-cursor="interactive"
            data-cursor-text="EXPLORE"
            onClick={handleStartExploring}
            className="group relative inline-flex items-center gap-2.5 px-6 py-3 border border-border-gray bg-transparent text-pure-white font-mono text-xs tracking-wider uppercase transition-all duration-200 hover:border-pure-white hover:bg-pure-white hover:text-pure-black focus:outline-none"
          >
            <span className="font-bold">[START EXPLORING]</span>
            <CornerDownRight size={14} className="group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
          </button>

          {/* Button 2: [CONTACT] */}
          <button
            data-cursor="interactive"
            data-cursor-text="TRANSMIT"
            onClick={handleContact}
            className="group relative inline-flex items-center gap-2 px-6 py-3 border border-border-gray bg-transparent text-pure-white font-mono text-xs tracking-wider uppercase transition-all duration-200 hover:border-pure-white hover:bg-pure-white hover:text-pure-black focus:outline-none"
          >
            <span className="font-bold">[CONTACT]</span>
          </button>
        </div>

        {/* Scroll Indicator Prompt */}
        <div className="flex items-center gap-3 font-mono text-[11px] text-neutral-500">
          <span>SCROLL TO DISINTEGRATE</span>
          <ArrowDown size={13} className="text-pure-white animate-bounce" />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
