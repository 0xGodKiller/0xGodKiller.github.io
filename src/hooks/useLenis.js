import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Custom hook to initialize Lenis smooth scrolling engine globally
 * and synchronize with GSAP ScrollTrigger for pinned animations.
 *
 * Configured with heavy, deliberate wheel and trackpad momentum:
 * - duration: 1.2
 * - easing: easeOutQuart (1 - (1 - t)^4)
 */
export const useLenis = (options = {}) => {
  const lenisRef = useRef(null);

  useEffect(() => {
    // Quartic ease-out function: deliberate deceleration curve
    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    const lenis = new Lenis({
      duration: 1.2,
      easing: easeOutQuart,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      ...options,
    });

    lenisRef.current = lenis;
    window.lenis = lenis;

    // Synchronize Lenis scroll updates with GSAP ScrollTrigger
    const handleScroll = () => {
      ScrollTrigger.update();
    };
    lenis.on('scroll', handleScroll);

    // Drive Lenis through GSAP ticker for frame-perfect pinning and scrubbing
    const updateTicker = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.off('scroll', handleScroll);
      lenis.destroy();
      lenisRef.current = null;
      if (window.lenis === lenis) {
        delete window.lenis;
      }
    };
  }, []);

  return lenisRef;
};

export default useLenis;
