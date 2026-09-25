import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * useTurnstileMeter Hook
 * Animates text-based monospace telemetry gauges like electromechanical turnstiles.
 * - Increments in discrete clacking steps from left to right.
 * - Format: [██████████░░░░] 85%
 * - Synchronized numeric counter ticking up from 0% to target.
 *
 * @param {Array} skillsList - Array of items with { id, target }
 * @param {React.RefObject} triggerRef - DOM element ref triggering the rollout on scroll
 * @param {number} totalBlocks - Number of block units in the gauge (default 14)
 */
export const useTurnstileMeter = (skillsList, triggerRef, totalBlocks = 14) => {
  // Initialize all skills at 0%
  const [metrics, setMetrics] = useState(() => {
    const initial = {};
    skillsList.forEach((s) => {
      initial[s.id] = {
        percent: 0,
        bar: `[${'░'.repeat(totalBlocks)}] 0%`,
      };
    });
    return initial;
  });

  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const triggerEl = triggerRef?.current;
    if (!triggerEl) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Instant target values for reduced motion
      const finalMetrics = {};
      skillsList.forEach((s) => {
        const filled = Math.round((s.target / 100) * totalBlocks);
        const barStr = `[${'█'.repeat(filled)}${'░'.repeat(totalBlocks - filled)}] ${s.target}%`;
        finalMetrics[s.id] = { percent: s.target, bar: barStr };
      });
      setMetrics(finalMetrics);
      setHasTriggered(true);
      return;
    }

    const state = { progress: 0 };

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: triggerEl,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          setHasTriggered(true);
          // Animate progress with discrete mechanical steps
          gsap.to(state, {
            progress: 1,
            duration: 1.4,
            ease: 'steps(24)', // Discrete clacking turnstile step increments
            onUpdate: () => {
              const updated = {};
              skillsList.forEach((s) => {
                const currentPct = Math.round(state.progress * s.target);
                const filled = Math.min(totalBlocks, Math.floor((currentPct / 100) * totalBlocks));
                const empty = Math.max(0, totalBlocks - filled);
                const barStr = `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${currentPct}%`;
                updated[s.id] = {
                  percent: currentPct,
                  bar: barStr,
                };
              });
              setMetrics(updated);
            },
            onComplete: () => {
              // Ensure exact target values upon completion
              const finalMap = {};
              skillsList.forEach((s) => {
                const filled = Math.round((s.target / 100) * totalBlocks);
                const empty = totalBlocks - filled;
                finalMap[s.id] = {
                  percent: s.target,
                  bar: `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${s.target}%`,
                };
              });
              setMetrics(finalMap);
            },
          });
        },
      });
    }, triggerRef);

    return () => {
      ctx.revert();
    };
  }, [skillsList, triggerRef, totalBlocks]);

  return { metrics, hasTriggered };
};

export default useTurnstileMeter;
