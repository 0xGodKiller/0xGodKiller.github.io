import React, { useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import useTurnstileMeter from '../hooks/useTurnstileMeter';
import useDeviceCapabilities from '../hooks/useDeviceCapabilities';
import { 
  ShieldCheck, 
  Gamepad2, 
  CheckCircle2, 
  Terminal, 
  Cpu, 
  Activity, 
  Zap, 
  Layers, 
  Radio, 
  Workflow 
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const SkillsSection = () => {
  const { prefersReducedMotion } = useDeviceCapabilities();
  const sectionRef = useRef(null);
  const col1Ref = useRef(null);
  const col2Ref = useRef(null);

  // Skill Items Configuration
  const testingSkills = useMemo(() => [
    {
      id: 'skill_playwright',
      name: 'Playwright',
      target: 94,
      spec: 'E2E Cross-Browser Automation & Trace Analysis',
      status: 'PRIMARY'
    },
    {
      id: 'skill_cypress',
      name: 'Cypress',
      target: 88,
      spec: 'Integration & Component Boundary Verification',
      status: 'CORE'
    },
    {
      id: 'skill_jest',
      name: 'Jest & Unit Runtimes',
      target: 92,
      spec: 'Deterministic Micro-Mocking & Snapshot Regression',
      status: 'VERIFIED'
    },
    {
      id: 'skill_cicd',
      name: 'CI/CD Automation',
      target: 96,
      spec: 'Ephemeral GitHub Actions & Parallel Test Sharding',
      status: 'PIPELINE'
    },
    {
      id: 'skill_chaos',
      name: 'Chaos Engineering',
      target: 85,
      spec: 'Fault Injection, Latency Spikes & Partition Drills',
      status: 'RESILIENCE'
    },
  ], []);

  const gamingSkills = useMemo(() => [
    {
      id: 'skill_statesync',
      name: 'State Synchronization',
      target: 92,
      spec: 'Delta Compression, Rollback & Lockstep Ticks',
      status: '128 HZ'
    },
    {
      id: 'skill_websockets',
      name: 'WebSockets & Streaming',
      target: 95,
      spec: 'Binary Buffers, Heartbeat & Reconnection Loops',
      status: 'SUB-MS'
    },
    {
      id: 'skill_canvas',
      name: 'Canvas 2D & Rasterization',
      target: 90,
      spec: 'Subpixel Coordinate Snapping & Buffer Flipping',
      status: '60/120 FPS'
    },
    {
      id: 'skill_physics',
      name: 'Physics & Collision',
      target: 86,
      spec: 'AABB Spatial Hashing, SAT & Kinematic Verlet',
      status: 'DETERMINISTIC'
    },
    {
      id: 'skill_matchmaking',
      name: 'Matchmaking Logic',
      target: 89,
      spec: 'Glicko/ELO Rating & Geographic Latency Clustering',
      status: 'ALGORITHMIC'
    },
  ], []);

  // Combined skills array for the turnstile telemetry hook
  const allSkills = useMemo(() => [...testingSkills, ...gamingSkills], [testingSkills, gamingSkills]);

  // Turnstile stepped mechanical meter hook
  const { metrics, hasTriggered } = useTurnstileMeter(allSkills, sectionRef, 14);

  useEffect(() => {
    const col1 = col1Ref.current;
    const col2 = col2Ref.current;
    const section = sectionRef.current;
    if (!col1 || !col2 || !section) return;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Entry Animation:
      // Column 1 slides in subtly from top-left (x: -35, y: -35)
      // Column 2 slides up subtly from bottom-right (x: 35, y: 35)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          once: true,
        },
      });

      tl.from(col1, {
        x: -35,
        y: -35,
        opacity: 0,
        force3D: true,
        duration: 0.85,
        ease: 'power2.out',
        clearProps: 'transform,willChange',
      }, 0);

      tl.from(col2, {
        x: 35,
        y: 35,
        opacity: 0,
        force3D: true,
        duration: 0.85,
        ease: 'power2.out',
        clearProps: 'transform,willChange',
      }, 0.1);
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, [prefersReducedMotion]);

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="relative space-y-10 scroll-mt-24"
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border-gray pb-4 gap-4">
        <div>
          <div className="font-mono text-xs text-neutral-500 mb-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-pure-white inline-block animate-pulse" />
            <span>[04] // CAPABILITY_MATRIX</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">TECHNICAL SKILLS</h2>
        </div>

        <div className="font-mono text-xs text-neutral-400 flex items-center gap-3">
          <span className="text-neutral-500">METER_ENGINE:</span>
          <span className="px-2 py-0.5 border border-border-gray text-pure-white bg-subtle-gray text-[10px]">
            {hasTriggered ? 'TURNSTILE // ACTIVE' : 'AWAITING_ENGAGE'}
          </span>
        </div>
      </div>

      {/* Two-Column Grid with Central Vertical Divider */}
      <div className="border border-border-gray bg-pure-black/90 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

          {/* COLUMN 1: Testing & Reliability (Slides from top-left) */}
          <div
            ref={col1Ref}
            className="p-6 md:p-8 lg:p-10 lg:border-r border-border-gray flex flex-col justify-between space-y-8 will-change-transform"
          >
            {/* Column Header */}
            <div className="space-y-3 pb-4 border-b border-border-gray">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <div className="flex items-center gap-2 text-pure-white font-bold">
                  <ShieldCheck size={16} className="text-pure-white" />
                  <span>TESTING & RELIABILITY</span>
                </div>
                <span className="text-neutral-500 text-[10px]">SUBSYSTEM_A</span>
              </div>
              <p className="font-mono text-xs text-neutral-400 leading-relaxed">
                Deterministic test suites, browser automation harnesses, and chaotic fault injection protocols for bulletproof production resilience.
              </p>
            </div>

            {/* Column 1 Skill Rows */}
            <div className="space-y-3">
              {testingSkills.map((skill) => {
                const metric = metrics[skill.id] || { percent: 0, bar: '[░░░░░░░░░░░░░░] 0%' };

                return (
                  <div
                    key={skill.id}
                    data-cursor="interactive"
                    data-cursor-text="LEVEL_LOCK"
                    className="group border border-border-gray/70 bg-pure-black/60 hover:bg-pure-white hover:text-pure-black hover:border-pure-white p-3.5 transition-colors duration-150 cursor-pointer flex flex-col justify-between gap-2"
                  >
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="font-bold tracking-tight group-hover:text-pure-black text-pure-white transition-colors">
                        {skill.name}
                      </span>
                      <span className="text-[10px] tracking-widest px-1.5 py-0.5 border border-border-gray group-hover:border-neutral-400 text-neutral-400 group-hover:text-pure-black transition-colors">
                        {skill.status}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-neutral-400 group-hover:text-neutral-700 transition-colors">
                      {skill.spec}
                    </div>

                    {/* Monospace Turnstile Telemetry Gauge */}
                    <div className="pt-1.5 flex items-center justify-between font-mono text-xs tracking-wider">
                      <span className="text-pure-white group-hover:text-pure-black transition-colors select-none font-mono">
                        {metric.bar}
                      </span>
                      <span className="text-[10px] text-neutral-500 group-hover:text-neutral-600">
                        TARGET: {skill.target}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Column 1 Footer */}
            <div className="pt-4 border-t border-border-gray flex items-center justify-between font-mono text-[10px] text-neutral-500">
              <span>AUTOMATION COVERAGE: 94.2%</span>
              <span>ZERO-REGRESSION GUARANTEE</span>
            </div>
          </div>

          {/* COLUMN 2: Game & Low-Latency Tech (Slides up from bottom-right) */}
          <div
            ref={col2Ref}
            className="p-6 md:p-8 lg:p-10 pt-10 lg:pt-10 flex flex-col justify-between space-y-8 will-change-transform border-t lg:border-t-0 border-border-gray"
          >
            {/* Column Header */}
            <div className="space-y-3 pb-4 border-b border-border-gray">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <div className="flex items-center gap-2 text-pure-white font-bold">
                  <Gamepad2 size={16} className="text-pure-white" />
                  <span>GAME & LOW-LATENCY TECH</span>
                </div>
                <span className="text-neutral-500 text-[10px]">SUBSYSTEM_B</span>
              </div>
              <p className="font-mono text-xs text-neutral-400 leading-relaxed">
                Deterministic tick simulation, binary networking protocols, high-frequency canvas rasterization, and spatial kinematic mathematics.
              </p>
            </div>

            {/* Column 2 Skill Rows */}
            <div className="space-y-3">
              {gamingSkills.map((skill) => {
                const metric = metrics[skill.id] || { percent: 0, bar: '[░░░░░░░░░░░░░░] 0%' };

                return (
                  <div
                    key={skill.id}
                    data-cursor="interactive"
                    data-cursor-text="LEVEL_LOCK"
                    className="group border border-border-gray/70 bg-pure-black/60 hover:bg-pure-white hover:text-pure-black hover:border-pure-white p-3.5 transition-colors duration-150 cursor-pointer flex flex-col justify-between gap-2"
                  >
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="font-bold tracking-tight group-hover:text-pure-black text-pure-white transition-colors">
                        {skill.name}
                      </span>
                      <span className="text-[10px] tracking-widest px-1.5 py-0.5 border border-border-gray group-hover:border-neutral-400 text-neutral-400 group-hover:text-pure-black transition-colors">
                        {skill.status}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-neutral-400 group-hover:text-neutral-700 transition-colors">
                      {skill.spec}
                    </div>

                    {/* Monospace Turnstile Telemetry Gauge */}
                    <div className="pt-1.5 flex items-center justify-between font-mono text-xs tracking-wider">
                      <span className="text-pure-white group-hover:text-pure-black transition-colors select-none font-mono">
                        {metric.bar}
                      </span>
                      <span className="text-[10px] text-neutral-500 group-hover:text-neutral-600">
                        TARGET: {skill.target}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Column 2 Footer */}
            <div className="pt-4 border-t border-border-gray flex items-center justify-between font-mono text-[10px] text-neutral-500">
              <span>FRAME ACCURACY: 99.8%</span>
              <span>128 HZ SIMULATION CLUSTER</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
