import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  ArrowUpRight, 
  Terminal, 
  Cpu, 
  GitBranch, 
  Activity, 
  Radio, 
  CheckCircle2, 
  Zap, 
  Sliders, 
  Layers 
} from 'lucide-react';

import useDeviceCapabilities from '../hooks/useDeviceCapabilities';

gsap.registerPlugin(ScrollTrigger);

/**
 * Optimized ProjectsSection Component
 * - Vertical-to-horizontal scroll hijack (horizontal dolly).
 * - Enforces anticipatePin: 1 and fastScrollEnd: true to eliminate layout shifts.
 * - Zero-allocation inertia skew using gsap.quickSetter.
 * - Zero-reflow mathematical centering snap detection.
 * - Explicit dimension reservations (h-[520px] shrink-0).
 * - Dynamic will-change GPU memory lifecycle management.
 * - Accessibility & Hardware-Aware Fallbacks:
 *   * prefersReducedMotion / isTouch: Native horizontal snap-slider without scroll hijack.
 *   * isLowPower: Zero inertia skew to eliminate vertex transform budget.
 */
export const ProjectsSection = () => {
  const { prefersReducedMotion, isTouch, isLowPower } = useDeviceCapabilities();
  const isFallback = prefersReducedMotion || isTouch;

  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const cardsRef = useRef([]);
  const [centeredCardIdx, setCenteredCardIdx] = useState(0);
  const [flickeringIdx, setFlickeringIdx] = useState(null);
  const [dollyProgress, setDollyProgress] = useState(0);

  // Projects Data
  const projects = [
    {
      id: 'PROJECT_01',
      title: 'Core Platform Engine',
      category: 'Distributed Systems & Runtime',
      tags: ['TypeScript', 'Distributed Systems', 'Raft Consensus', 'Zero-Copy'],
      summary: 'High-throughput distributed consensus engine with Raft replication, deterministic state machines, and zero-copy binary serialization capable of sustained peak load.',
      metricLabel: 'PEAK THROUGHPUT',
      metricValue: '1.42M REQ/S',
      subMetric: 'p99 latency < 1.15ms',
      status: 'PRODUCTION // NOMINAL',
      codeBranch: 'engine/raft-core',
      release: 'v3.8.2-GA'
    },
    {
      id: 'PROJECT_02',
      title: 'Networked Game Prototype',
      category: 'Real-Time Physics & Simulation',
      tags: ['WebSockets', 'HTML5 Canvas', 'State Sync', 'Client Prediction'],
      summary: 'Authoritative multiplayer physics testbed featuring lockstep tick synchronization, delta state compression, client-side dead reckoning, and lag compensation.',
      metricLabel: 'TICK SYNCHRONIZATION',
      metricValue: '128 HZ LOCKSTEP',
      subMetric: 'packet loss: 0.00%',
      status: 'STABLE // DEPLOYED',
      codeBranch: 'sim/net-canvas',
      release: 'v2.1.0-RC'
    },
    {
      id: 'PROJECT_03',
      title: 'Automated Test Harness',
      category: 'Reliability & Chaos Automation',
      tags: ['Playwright', 'Jest', 'CI/CD Pipelines', 'Chaos Engine'],
      summary: 'Autonomous distributed reliability framework simulating split-brain network partitions, memory leaks, and cascading upstream failures across ephemeral test clusters.',
      metricLabel: 'EXECUTION VELOCITY',
      metricValue: '1,420 RUNS/DAY',
      subMetric: 'pass rate: 99.982%',
      status: 'CONTINUOUS INTEGRATION',
      codeBranch: 'ci/chaos-harness',
      release: 'v4.0.1-PROD'
    },
    {
      id: 'PROJECT_04',
      title: 'Kinematic Compute Matrix',
      category: 'GPU Shaders & Mathematical Models',
      tags: ['WebGL', 'GLSL', 'Spring Physics', 'Compute Shaders'],
      summary: 'Low-level hardware-accelerated graphical pipeline for real-time particle kinematics, procedural phosphor scanlines, and vector reticle spring interpolations.',
      metricLabel: 'FRAME RENDER BUDGET',
      metricValue: '120 FPS NATIVE',
      subMetric: 'frame time: 8.33ms',
      status: 'HARDWARE ACCELERATED',
      codeBranch: 'gfx/kinematic-mat',
      release: 'v1.4.0-DEV'
    }
  ];

  // Handle native horizontal scroll updates in touch/reduced-motion fallback mode
  const handleFallbackScroll = (e) => {
    const el = e.currentTarget;
    const scrollLeft = el.scrollLeft;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll > 0) {
      setDollyProgress(Math.round((scrollLeft / maxScroll) * 100));
      const cardWidth = el.firstElementChild?.firstElementChild?.offsetWidth || 340;
      const gap = 24;
      const idx = Math.min(projects.length - 1, Math.max(0, Math.round(scrollLeft / (cardWidth + gap))));
      setCenteredCardIdx(idx);
    }
  };

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    if (isFallback) {
      track.style.transform = 'none';
      track.style.willChange = 'auto';
      return;
    }

    let prevCentered = 0;
    let cardOffsets = [];

    // Precompute card center offsets to eliminate layout reflows during scroll
    const updateCardOffsets = () => {
      cardOffsets = cardsRef.current.map((el) => (el ? el.offsetLeft + el.offsetWidth / 2 : 0));
    };

    updateCardOffsets();
    window.addEventListener('resize', updateCardOffsets);

    const ctx = gsap.context(() => {
      // Create quickSetters for zero-allocation high-velocity card skewing
      const skewSetters = cardsRef.current.map((el) => (el ? gsap.quickSetter(el, 'skewX', 'deg') : null));

      // Calculate dynamic horizontal scroll distance based on track width
      const getScrollDistance = () => track.scrollWidth - window.innerWidth + 160;

      let currentSkew = 0;

      // Primary Horizontal Dolly Timeline
      const dollyTween = gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${getScrollDistance()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1, // Pinning stabilization to eliminate layout hitching
          fastScrollEnd: true, // Prevents layout snapping during high-velocity fling scrolls
          invalidateOnRefresh: true,
          onEnter: () => {
            track.style.willChange = 'transform';
          },
          onEnterBack: () => {
            track.style.willChange = 'transform';
          },
          onLeave: () => {
            track.style.willChange = 'auto'; // Free GPU memory on exit
          },
          onLeaveBack: () => {
            track.style.willChange = 'auto'; // Free GPU memory on exit
          },
          onUpdate: (self) => {
            setDollyProgress(Math.round(self.progress * 100));

            // 1. Velocity Throttling & Clamping (Disabled if isLowPower to conserve GPU vertex transforms)
            if (!isLowPower) {
              const lenisVelocity = typeof window !== 'undefined' && window.lenis ? window.lenis.velocity : 0;
              // Strictly clamp horizontal card skew between -4deg and +4deg limit
              const targetSkew = Math.max(-4, Math.min(4, -lenisVelocity * 0.18));
              currentSkew = targetSkew;

              skewSetters.forEach((setter) => {
                if (setter) setter(targetSkew);
              });
            } else {
              currentSkew = 0;
              skewSetters.forEach((setter) => {
                if (setter) setter(0);
              });
            }

            // 2. Zero-Reflow Mathematical Centering Snap Detection
            const totalDist = getScrollDistance();
            const currentTranslateX = -self.progress * totalDist;
            const viewCenter = window.innerWidth / 2;
            const threshold = window.innerWidth * 0.20;
            let currentCenterIndex = -1;

            for (let i = 0; i < cardOffsets.length; i++) {
              const cardCenterOnScreen = cardOffsets[i] + currentTranslateX;
              const dist = Math.abs(viewCenter - cardCenterOnScreen);
              if (dist < threshold) {
                currentCenterIndex = i;
                break;
              }
            }

            if (currentCenterIndex !== -1 && currentCenterIndex !== prevCentered) {
              prevCentered = currentCenterIndex;
              setCenteredCardIdx(currentCenterIndex);
              setFlickeringIdx(currentCenterIndex);
              setTimeout(() => {
                setFlickeringIdx(null);
              }, 280);
            }
          },
        },
      });

      // Ticker to smoothly dampen skew back to 0deg when scrolling halts
      const tickerReset = () => {
        if (isLowPower) return;
        const lenisVel = typeof window !== 'undefined' && window.lenis ? Math.abs(window.lenis.velocity) : 0;
        if (lenisVel < 0.05 && Math.abs(currentSkew) > 0.01) {
          currentSkew += (0 - currentSkew) * 0.2;
          skewSetters.forEach((setter) => {
            if (setter) setter(currentSkew);
          });
        }
      };

      gsap.ticker.add(tickerReset);

      return () => {
        gsap.ticker.remove(tickerReset);
        dollyTween.kill();
      };
    }, sectionRef);

    return () => {
      window.removeEventListener('resize', updateCardOffsets);
      ctx.revert();
    };
  }, [isFallback, isLowPower]);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className={`relative w-full ${isFallback ? 'min-h-[640px] md:h-screen' : 'h-screen'} bg-pure-black overflow-hidden flex flex-col justify-between select-none py-10 gpu-accelerate`}
    >
      {/* Top Section Header & Horizontal Telemetry HUD */}
      <div className="relative z-30 px-6 md:px-12 w-full flex items-center justify-between border-b border-border-gray/80 pb-4 font-mono text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-pure-white inline-block animate-pulse" />
            <span className="font-bold text-pure-white tracking-wider">[03] // PROJECTS_MATRIX</span>
          </div>
          <span className="text-neutral-500 hidden sm:inline">|</span>
          <span className="text-neutral-400 hidden sm:inline">
            {isFallback ? 'NATIVE SNAP TRACK' : 'HORIZONTAL DOLLY SCROLL'}
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-neutral-400 text-[11px]">
            <span>SNAP_STATUS:</span>
            <span className="text-pure-white font-bold">CARD_0{centeredCardIdx + 1} [ACTIVE_CENTER]</span>
          </div>

          <div className="flex items-center gap-2 border border-border-gray bg-pure-black px-2.5 py-1 text-[11px]">
            <span className="text-neutral-500">DOLLY:</span>
            <span className="text-pure-white font-bold">{dollyProgress.toString().padStart(3, '0')}%</span>
          </div>
        </div>
      </div>

      {/* Center Horizontal Dolly Track / Native Snap-Slider */}
      <div
        ref={scrollContainerRef}
        onScroll={isFallback ? handleFallbackScroll : undefined}
        className={`relative z-20 flex-1 flex items-center ${
          isFallback
            ? 'overflow-x-auto snap-x snap-mandatory py-4 px-6 md:px-12 w-full touch-pan-x'
            : 'overflow-visible'
        }`}
      >
        <div
          ref={trackRef}
          className={`flex items-center ${
            isFallback
              ? 'gap-6 md:gap-8 w-max'
              : 'gap-8 md:gap-12 px-8 md:px-24 w-max gpu-accelerate'
          }`}
        >
          {projects.map((proj, idx) => {
            const isCentered = centeredCardIdx === idx;
            const isFlickering = flickeringIdx === idx;

            return (
              <div
                key={proj.id}
                ref={(el) => (cardsRef.current[idx] = el)}
                data-cursor="interactive"
                data-cursor-text="INSPECT_SPEC"
                className={`group relative ${
                  isFallback ? 'w-[300px] sm:w-[400px] md:w-[460px] snap-center' : 'w-[320px] sm:w-[420px] md:w-[480px]'
                } h-[520px] shrink-0 border p-6 md:p-8 flex flex-col justify-between transition-colors duration-200 cursor-pointer gpu-accelerate ${
                  isFallback
                    ? (isCentered
                        ? 'border-neutral-300 bg-pure-black/95 opacity-100 shadow-[0_0_30px_rgba(0,0,0,0.8)]'
                        : 'border-border-gray/80 bg-pure-black/80 opacity-85 hover:opacity-100')
                    : (isCentered
                        ? 'border-neutral-400 bg-pure-black/95 opacity-100 shadow-[0_0_30px_rgba(0,0,0,0.8)]'
                        : 'border-border-gray/70 bg-pure-black/60 opacity-40 hover:opacity-75')
                } hover:bg-pure-white hover:text-pure-black hover:border-pure-white`}
              >
                {/* CRT White Flash Flare Overlay on Centering Snap */}
                {isFlickering && !prefersReducedMotion && (
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-pure-white pointer-events-none z-50 animate-ping opacity-40 mix-blend-overlay"
                  />
                )}

                {/* Top Card Metadata & Header */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between font-mono text-[11px] pb-3 border-b border-border-gray group-hover:border-neutral-300 transition-colors">
                    <span className="text-neutral-500 group-hover:text-neutral-600 font-bold">
                      {proj.id}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-pure-white group-hover:bg-pure-black inline-block rounded-none" />
                      <span className="text-[10px] tracking-widest text-neutral-400 group-hover:text-pure-black font-semibold">
                        {proj.release}
                      </span>
                    </div>
                  </div>

                  {/* Title & Category */}
                  <div className="space-y-1.5">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 group-hover:text-neutral-600 transition-colors">
                      {proj.category}
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight font-sans text-pure-white group-hover:text-pure-black transition-colors">
                        {proj.title}
                      </h3>
                      {/* External Link Arrow (revealed on hover) */}
                      <div className="opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all duration-200 p-1 border border-pure-black">
                        <ArrowUpRight size={18} className="text-pure-black" />
                      </div>
                    </div>
                  </div>

                  {/* Concise Project Summary */}
                  <p className="font-mono text-xs md:text-sm text-neutral-400 group-hover:text-neutral-800 leading-relaxed transition-colors line-clamp-4">
                    {proj.summary}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {proj.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 border border-border-gray group-hover:border-neutral-400 font-mono text-[10px] text-neutral-300 group-hover:text-pure-black bg-subtle-gray/40 group-hover:bg-neutral-200 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Card Telemetry & Live Metric */}
                <div className="pt-5 border-t border-border-gray group-hover:border-neutral-300 transition-colors space-y-3 font-mono">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-[10px] text-neutral-500 group-hover:text-neutral-600">
                        {proj.metricLabel}
                      </div>
                      <div className="text-lg md:text-xl font-bold tracking-tight text-pure-white group-hover:text-pure-black transition-colors">
                        {proj.metricValue}
                      </div>
                    </div>
                    <div className="text-right text-[10px] text-neutral-400 group-hover:text-neutral-700">
                      {proj.subMetric}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] pt-1 text-neutral-500 group-hover:text-neutral-600 border-t border-border-gray/40 group-hover:border-neutral-200">
                    <span className="flex items-center gap-1.5">
                      <GitBranch size={11} />
                      {proj.codeBranch}
                    </span>
                    <span className="font-semibold text-neutral-400 group-hover:text-pure-black">
                      {proj.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Track Controls & Guidance */}
      <div className="relative z-30 px-6 md:px-12 w-full flex items-center justify-between font-mono text-[11px] text-neutral-500 border-t border-border-gray/80 pt-4">
        <div className="flex items-center gap-3">
          <span className="inline-block w-1.5 h-1.5 bg-pure-white" />
          <span>
            {isFallback
              ? 'SWIPE OR SCROLL HORIZONTALLY TO BROWSE'
              : 'SCROLL DOWN TO ADVANCE DOLLY TRACK'}
          </span>
          <span className="text-neutral-600 hidden sm:inline">
            {isFallback ? '// NATIVE MOMENTUM ACTIVE' : '// INERTIAL MOMENTUM ACTIVE'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {projects.map((_, i) => (
            <span
              key={i}
              className={`inline-block transition-all duration-300 ${
                centeredCardIdx === i
                  ? 'w-6 h-1 bg-pure-white'
                  : 'w-2 h-1 bg-neutral-700'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
