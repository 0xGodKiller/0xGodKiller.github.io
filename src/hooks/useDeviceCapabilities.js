import { useState, useEffect } from 'react';

/**
 * useDeviceCapabilities Hook
 * Evaluates hardware specifications, touch capabilities, and user accessibility preferences.
 *
 * - prefersReducedMotion: Detects system reduced-motion preference (WCAG 2.1 compliant).
 * - isTouch: Identifies touch-first devices (pointer: coarse or touch points).
 * - isLowPower: Flags devices with <= 4 CPU cores or <= 4GB RAM to throttle heavy effects.
 * - canHover: Distinguishes true pointer devices with hover capability.
 */
export const useDeviceCapabilities = () => {
  const [capabilities, setCapabilities] = useState(() => {
    if (typeof window === 'undefined') {
      return {
        prefersReducedMotion: false,
        isTouch: false,
        isLowPower: false,
        canHover: true,
      };
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointerQuery = window.matchMedia('(pointer: coarse)');
    const hoverQuery = window.matchMedia('(hover: hover)');

    const cores = navigator.hardwareConcurrency || 8;
    const memory = navigator.deviceMemory || 8; // in GB (Chromium API)
    const isLowPower = cores <= 4 || memory <= 4;
    const isTouch = pointerQuery.matches || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0);

    return {
      prefersReducedMotion: motionQuery.matches,
      isTouch,
      isLowPower,
      canHover: hoverQuery.matches && !isTouch,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointerQuery = window.matchMedia('(pointer: coarse)');
    const hoverQuery = window.matchMedia('(hover: hover)');

    const evaluateCapabilities = () => {
      const cores = navigator.hardwareConcurrency || 8;
      const memory = navigator.deviceMemory || 8;
      const isLowPower = cores <= 4 || memory <= 4;
      const isTouch = pointerQuery.matches || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0);

      setCapabilities({
        prefersReducedMotion: motionQuery.matches,
        isTouch,
        isLowPower,
        canHover: hoverQuery.matches && !isTouch,
      });
    };

    evaluateCapabilities();

    // Listen for real-time accessibility preference changes
    motionQuery.addEventListener('change', evaluateCapabilities);
    pointerQuery.addEventListener('change', evaluateCapabilities);
    hoverQuery.addEventListener('change', evaluateCapabilities);

    return () => {
      motionQuery.removeEventListener('change', evaluateCapabilities);
      pointerQuery.removeEventListener('change', evaluateCapabilities);
      hoverQuery.removeEventListener('change', evaluateCapabilities);
    };
  }, []);

  return capabilities;
};

export default useDeviceCapabilities;
