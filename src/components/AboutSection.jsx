import React, { useEffect, useRef, useState, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  ShieldCheck, 
  Terminal, 
  Cpu, 
  Binary, 
  Activity, 
  Radio, 
  FileText, 
  Key, 
  Layers 
} from 'lucide-react';
import useDeviceCapabilities from '../hooks/useDeviceCapabilities';

gsap.registerPlugin(ScrollTrigger);

/**
 * AboutSection Component
 * - Two-column responsive desktop layout ("Character Dossier" + "Background Log")
 *   divided by thin border-gray (#1a1a1a).
 * - Downward-sweeping horizontal 1px line reveal VFX with white bloom.
 * - Text above line is crisp pure-white (#f5f5f5); text below line is scrambled
 *   hexadecimal noise with low-opacity blur, snapping into plain text on sweep.
 * - Triggers once per downward scroll pass with prefers-reduced-motion fallback.
 */
export const AboutSection = () => {
  const { prefersReducedMotion } = useDeviceCapabilities();
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const [sweepProgress, setSweepProgress] = useState(prefersReducedMotion ? 100 : 0);
  const [isRevealed, setIsRevealed] = useState(prefersReducedMotion);
  const [hexTick, setHexTick] = useState(0);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (prefersReducedMotion) {
      setSweepProgress(100);
      setIsRevealed(true);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const sweepObj = { progress: 0 };

    const ctx = gsap.context(() => {
      // Trigger a single downward-sweeping line pass once per downward scroll
      ScrollTrigger.create({
        trigger: container,
        start: 'top 75%',
        once: true, // Only triggers once per downward scroll pass
        onEnter: () => {
          gsap.to(sweepObj, {
            progress: 100,
            duration: 1.6,
            ease: 'power2.inOut',
            onUpdate: () => {
              setSweepProgress(sweepObj.progress);
            },
            onComplete: () => {
              setIsRevealed(true);
              setSweepProgress(100);
            },
          });
        },
      });
    }, sectionRef);

    // Subtle cipher shuffle for the encrypted hex noise layer while sweeping
    let intervalId;
    if (sweepProgress > 0 && sweepProgress < 100) {
      intervalId = setInterval(() => {
        setHexTick((prev) => (prev + 1) % 1000);
      }, 90);
    }

    return () => {
      ctx.revert();
      if (intervalId) clearInterval(intervalId);
    };
  }, [sweepProgress > 0 && sweepProgress < 100]);

  // Static character dossier data
  const dossierSpecs = [
    { label: 'ROLE', value: 'Staff Systems & Reliability Engineer' },
    { label: 'FOCUS AREAS', value: 'Distributed Infrastructure, Chaos Engineering, Interactive Kinematics' },
    { label: 'CORE PARADIGM', value: 'Deterministic State, Mechanical Sympathy, Zero-Trust' },
    { label: 'SYSTEM STATUS', value: 'ACTIVE', status: true },
    { label: 'SECURITY CLEARANCE', value: 'LEVEL_05 // UNRESTRICTED' },
    { label: 'OBSERVED UPTIME', value: '99.999% CONTINUOUS' },
    { label: 'LATENCY PROFILE', value: 'p99 < 8.4ms (DETERMINISTIC)' },
  ];

  // Helper to generate dynamic scrambled hex representation of plain text
  const scrambleToHex = (text, seedOffset = 0) => {
    const hexChars = '0123456789ABCDEF';
    return text.split(' ').map((word, wIdx) => {
      if (word.length <= 2) return '0x' + hexChars[(wIdx + hexTick) % 16] + hexChars[(wIdx * 3 + seedOffset) % 16];
      let hexStr = '0x';
      for (let i = 0; i < Math.min(6, word.length); i++) {
        hexStr += hexChars[(wIdx * 7 + i * 3 + hexTick + seedOffset) % 16];
      }
      return hexStr;
    }).join(' ');
  };

  /**
   * Render either the crisp plain text content or the scrambled hexadecimal noise content.
   * Both share the exact same responsive markup and DOM geometry for 1:1 pixel alignment.
   */
  const renderDossierContent = (isHex = false) => {
    return (
      <div className={`p-6 md:p-8 lg:p-10 ${isHex ? 'select-none pointer-events-none' : ''}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          {/* LEFT COLUMN: Character Dossier (lg:col-span-5) */}
          <div className="lg:col-span-5 lg:pr-8 lg:border-r border-border-gray space-y-6">
            {/* Dossier Card Header */}
            <div className="space-y-2 border-b border-border-gray pb-4">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className={isHex ? 'text-neutral-600' : 'text-neutral-500'}>
                  {isHex ? scrambleToHex('SYS_CARD_01', 1) : 'SYS_CARD_01'}
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[10px] text-pure-white px-2 py-0.5 border border-border-gray bg-pure-black">
                  <span className="w-1.5 h-1.5 bg-pure-white rounded-none inline-block animate-pulse" />
                  {isHex ? scrambleToHex('ACTIVE', 2) : 'ACTIVE'}
                </span>
              </div>

              <h3 className={`text-2xl font-bold tracking-tight font-sans ${isHex ? 'text-neutral-600 blur-[0.5px]' : 'text-pure-white'}`}>
                {isHex ? scrambleToHex('CHARACTER DOSSIER', 3) : 'CHARACTER DOSSIER'}
              </h3>
              <p className={`font-mono text-xs ${isHex ? 'text-neutral-700' : 'text-neutral-400'}`}>
                {isHex ? scrambleToHex('OPERATIONAL SPECIFICATION MATRIX', 4) : 'OPERATIONAL SPECIFICATION MATRIX'}
              </p>
            </div>

            {/* Spec Rows */}
            <div className="space-y-4 font-mono text-xs">
              {dossierSpecs.map((spec, idx) => (
                <div 
                  key={idx} 
                  className="border-b border-border-gray/60 pb-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1"
                >
                  <span className={`text-[10px] tracking-wider uppercase ${isHex ? 'text-neutral-700' : 'text-neutral-500'}`}>
                    {isHex ? scrambleToHex(spec.label, idx) : spec.label}
                  </span>
                  <div className="text-right">
                    {spec.status && !isHex ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-border-gray text-pure-white text-[10px] bg-subtle-gray/60 font-bold">
                        <span className="w-1.5 h-1.5 bg-pure-white inline-block animate-ping" />
                        {spec.value}
                      </span>
                    ) : (
                      <span className={`font-medium ${isHex ? 'text-neutral-600 blur-[0.5px]' : 'text-pure-white'}`}>
                        {isHex ? scrambleToHex(spec.value, idx * 5) : spec.value}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Tactical Footer Badge */}
            <div className="pt-2">
              <div 
                data-cursor={isHex ? undefined : "interactive"}
                data-cursor-text="SPEC_VERIFIED"
                className={`p-3 border border-border-gray bg-subtle-gray/30 flex items-center justify-between font-mono text-[10px] ${
                  isHex ? 'text-neutral-700' : 'text-neutral-400 hover:border-pure-white transition-colors'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className={isHex ? 'text-neutral-700' : 'text-pure-white'} />
                  <span>{isHex ? scrambleToHex('ATTESTATION CONFIRMED', 12) : 'ATTESTATION CONFIRMED'}</span>
                </div>
                <span>{isHex ? '0x9F' : 'SHA-256'}</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Background Log (lg:col-span-7) */}
          <div className="lg:col-span-7 lg:pl-8 pt-8 lg:pt-0 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Log Header */}
              <div className="border-b border-border-gray pb-4 flex items-center justify-between">
                <div>
                  <div className={`font-mono text-[10px] tracking-wider ${isHex ? 'text-neutral-700' : 'text-neutral-500'}`}>
                    {isHex ? scrambleToHex('LOG_STREAM // 02_RECORD', 20) : 'LOG_STREAM // 02_RECORD'}
                  </div>
                  <h4 className={`text-xl font-bold font-sans ${isHex ? 'text-neutral-600 blur-[0.5px]' : 'text-pure-white'}`}>
                    {isHex ? scrambleToHex('BACKGROUND LOG & TRAJECTORY', 21) : 'BACKGROUND LOG & TRAJECTORY'}
                  </h4>
                </div>
                <div className={`font-mono text-[10px] border border-border-gray px-2 py-1 ${isHex ? 'text-neutral-700' : 'text-neutral-400'}`}>
                  {isHex ? '0xFE' : 'REV_04.1'}
                </div>
              </div>

              {/* Two-Paragraph Narrative */}
              <div className="space-y-5 font-mono text-xs sm:text-sm leading-relaxed">
                {/* Paragraph 1: Trajectory & Resilient Architectures */}
                <p className={isHex ? 'text-neutral-600 blur-[0.5px]' : 'text-neutral-300'}>
                  {isHex
                    ? scrambleToHex(
                        'Forged across high-throughput distributed infrastructure and real-time backend topologies, I architect resilient computational systems designed to thrive under extreme operational stress. My trajectory began with low-level systems programming and kernel-adjacent memory architectures, expanding into large-scale cloud coordination pipelines handling millions of concurrent events. To me, reliability is not a passive guarantee—it is an active discipline of chaos engineering, deterministic state replication, and ruthless latency eradication.',
                        30
                      )
                    : 'Forged across high-throughput distributed infrastructure and real-time backend topologies, I architect resilient computational systems designed to thrive under extreme operational stress. My trajectory began with low-level systems programming and kernel-adjacent memory architectures, expanding into large-scale cloud coordination pipelines handling millions of concurrent events. To me, reliability is not a passive guarantee—it is an active discipline of chaos engineering, deterministic state replication, and ruthless latency eradication.'}
                </p>

                {/* Paragraph 2: Gaming Systems & Interactive Mechanics */}
                <p className={isHex ? 'text-neutral-600 blur-[0.5px]' : 'text-neutral-300'}>
                  {isHex
                    ? scrambleToHex(
                        'Beyond core distributed infrastructure, I hold a deep obsession with real-time gaming engines, physical kinematics, and low-latency interaction pipelines. The rigorous demands of 60/120Hz frame budgets, deterministic tick loops, spatial math, and sub-millisecond input responsiveness mirror the same engineering discipline found in aerospace systems. Whether optimizing data-oriented memory layouts for GPU shaders or deploying self-healing cluster fabrics, I craft software that feels heavy, deliberate, and mathematically unbreakable.',
                        40
                      )
                    : 'Beyond core distributed infrastructure, I hold a deep obsession with real-time gaming engines, physical kinematics, and low-latency interaction pipelines. The rigorous demands of 60/120Hz frame budgets, deterministic tick loops, spatial math, and sub-millisecond input responsiveness mirror the same engineering discipline found in aerospace systems. Whether optimizing data-oriented memory layouts for GPU shaders or deploying self-healing cluster fabrics, I craft software that feels heavy, deliberate, and mathematically unbreakable.'}
                </p>
              </div>
            </div>

            {/* Narrative Attestation Footer */}
            <div className="pt-6 border-t border-border-gray flex flex-wrap items-center justify-between gap-4 font-mono text-[10px]">
              <div className="flex items-center gap-2">
                <Terminal size={12} className={isHex ? 'text-neutral-700' : 'text-pure-white'} />
                <span className={isHex ? 'text-neutral-700' : 'text-neutral-500'}>
                  {isHex ? scrambleToHex('SOURCE: ARCHIVAL_RECORD_INDEX', 50) : 'SOURCE: ARCHIVAL_RECORD_INDEX'}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className={isHex ? 'text-neutral-700' : 'text-neutral-400'}>
                  {isHex ? '0x4B 0x7E 0x91' : 'STATUS: DECRYPTED_PLAIN'}
                </span>
                <span className={isHex ? 'text-neutral-700' : 'text-pure-white font-bold'}>
                  {isHex ? '0x00' : '[VERIFIED]'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  };

  return (
    <section 
      id="about" 
      ref={sectionRef} 
      className="relative space-y-8 scroll-mt-20"
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border-gray pb-4 gap-4">
        <div>
          <div className="font-mono text-xs text-neutral-500 mb-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-pure-white inline-block" />
            <span>[02] // SYSTEM_PROFILE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">CHARACTER SHEET</h2>
        </div>
        <div className="font-mono text-xs text-neutral-400 max-w-md flex items-center justify-between md:justify-end gap-3">
          <span className="text-neutral-500">DECRYPT_VFX:</span>
          <span className="px-2 py-0.5 border border-border-gray text-pure-white bg-subtle-gray text-[10px]">
            {isRevealed ? 'DECRYPTED // 100%' : `SWEEPING // ${Math.round(sweepProgress)}%`}
          </span>
        </div>
      </div>

      {/* Main Dual-Layer Reveal Container */}
      <div 
        ref={containerRef} 
        className="relative border border-border-gray bg-pure-black/90 overflow-hidden shadow-2xl"
      >
        {/* Layer 1: Decoded / Clear text layer (Clipped to area above the sweep line) */}
        <div 
          className="relative z-10 w-full gpu-accelerate"
          style={{ 
            clipPath: `inset(0% 0% ${Math.max(0, 100 - sweepProgress)}% 0%)`,
            willChange: !isRevealed ? 'clip-path' : 'auto'
          }}
        >
          {renderDossierContent(false)}
        </div>

        {/* Layer 2: Encrypted / Hexadecimal Noise layer (Clipped to area below the sweep line) */}
        <div 
          aria-hidden="true"
          className="absolute inset-0 z-0 pointer-events-none select-none gpu-accelerate"
          style={{ 
            clipPath: `inset(${Math.min(100, sweepProgress)}% 0% 0% 0%)`,
            willChange: !isRevealed ? 'clip-path' : 'auto'
          }}
        >
          {renderDossierContent(true)}
        </div>

        {/* Downward Sweeping Line: 1px solid white with faint bloom (Compositor-isolated translate3d) */}
        {!isRevealed && sweepProgress > 0 && sweepProgress < 100 && (
          <div 
            className="absolute top-0 left-0 right-0 z-20 pointer-events-none gpu-layer"
            style={{ 
              transform: `translate3d(0, ${(sweepProgress / 100) * (containerRef.current?.offsetHeight || 600)}px, 0) translateY(-50%)`
            }}
          >
            {/* 1px solid white line with faint bloom */}
            <div className="w-full h-[1px] bg-pure-white shadow-[0_0_8px_rgba(255,255,255,0.9),0_0_18px_rgba(255,255,255,0.4)]" />

            {/* Sweeping Scanner HUD indicator tag */}
            <div className="absolute right-4 -top-3 font-mono text-[9px] tracking-widest text-pure-white bg-pure-black border border-border-gray px-2 py-0.5 flex items-center gap-1.5 shadow-lg">
              <span className="w-1 h-1 bg-pure-white inline-block animate-ping" />
              <span>DECRYPT // {Math.round(sweepProgress)}%</span>
            </div>

            {/* Left corner scanner tick */}
            <div className="absolute left-4 -top-1.5 font-mono text-[8px] tracking-widest text-neutral-400 bg-pure-black px-1">
              [SWEEP_PASS]
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AboutSection;
