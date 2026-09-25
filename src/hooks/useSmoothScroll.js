import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import useDeviceCapabilities from './useDeviceCapabilities';

gsap.registerPlugin(ScrollTrigger);

/**
 * useSmoothScroll: Production-ready unified animation loop connecting Lenis
 * smooth scroll with GSAP ScrollTrigger, featuring touch & accessibility bypass.
 *
 * - On touch devices or reduced-motion environments, bypasses Lenis to leverage
 *   native hardware-accelerated momentum scrolling and avoid virtual scroll jitter.
 * - Single source of truth for requestAnimationFrame on desktop pointer devices.
 * - lagSmoothing(0) ensures virtual scroll and native scroll pins never desync.
 * - Debounced resize listener ignores mobile address bar vertical height changes.
 * - Comprehensive React lifecycle teardown on unmount.
 *
 * @param {Object} options - Lenis configuration overrides
 * @returns {React.MutableRefObject} Ref to active Lenis instance or null
 */
export const useSmoothScroll = (options = {}) => {
  const lenisRef = useRef(null);
  const { prefersReducedMotion, isTouch } = useDeviceCapabilities();

  useEffect(() => {
    // Accessibility & Touch Screen Bypass:
    // If user prefers reduced motion or is using a touch device, disable Lenis
    // and rely on browser-native momentum scrolling.
    if (prefersReducedMotion || isTouch) {
      if (window.lenis) {
        delete window.lenis;
      }
      ScrollTrigger.refresh();
      return;
    }

    // Snappy, smooth easeOutQuart curve with responsive momentum
    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    const lenis = new Lenis({
      duration: 0.95,
      easing: easeOutQuart,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.3,
      touchMultiplier: 1.8,
      autoRaf: false, // Strictly disable internal Lenis RAF loop
      ...options,
    });

    lenisRef.current = lenis;
    window.lenis = lenis;

    // 1. Unified Animation Frame Loop
    const onScroll = () => {
      ScrollTrigger.update();
    };
    lenis.on('scroll', onScroll);

    // Bind Lenis directly to GSAP's ticker
    const tickerCallback = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);

    // Eliminate frame lag smoothing to prevent virtual/native scroll desync
    gsap.ticker.lagSmoothing(0);

    // 2. Debounced Resize Listener (Ignoring mobile address bar vertical changes)
    let lastWidth = window.innerWidth;
    let resizeTimer = null;

    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const currentWidth = window.innerWidth;
        if (Math.abs(currentWidth - lastWidth) > 0) {
          lastWidth = currentWidth;
          ScrollTrigger.refresh();
        }
      }, 200);
    };

    window.addEventListener('resize', handleResize);

    // Initial ScrollTrigger synchronization
    ScrollTrigger.refresh();

    // 3. Robust Cleanup Lifecycle
    return () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      gsap.ticker.remove(tickerCallback);
      lenis.off('scroll', onScroll);
      lenis.destroy();
      lenisRef.current = null;
      if (window.lenis === lenis) {
        delete window.lenis;
      }
    };
  }, [prefersReducedMotion, isTouch]);

  return lenisRef;
};

export default useSmoothScroll;
