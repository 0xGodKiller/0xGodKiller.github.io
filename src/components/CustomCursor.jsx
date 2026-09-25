import React, { useEffect, useRef } from 'react';
import useDeviceCapabilities from '../hooks/useDeviceCapabilities';

/**
 * CustomCursor: Zero-Rerender High-Precision Reticle Cursor.
 * - Tracks mouse with smooth spring lerp inside a unified requestAnimationFrame loop.
 * - Automatically unmounts and disables on touch screens (pointer: coarse) or reduced motion.
 * - Reads pointer events via passive listeners without triggering React state re-renders.
 * - Mutates DOM and SVG attributes directly for 60–120+ FPS thread-isolated performance.
 * - Default state: 12px crosshair reticle (+).
 * - Interactive state: Expands dynamically into a bracketed box [  ].
 */
export const CustomCursor = () => {
  const { prefersReducedMotion, isTouch, canHover } = useDeviceCapabilities();

  // If touch device or reduced motion is active, do not render custom cursor
  if (isTouch || prefersReducedMotion || !canHover) {
    return null;
  }

  const cursorRef = useRef(null);
  const labelRef = useRef(null);

  // Mutable state refs (Zero React re-render churn)
  const isVisibleRef = useRef(false);
  const currentLabelRef = useRef('');

  // Target values from mouse events
  const targetX = useRef(-100);
  const targetY = useRef(-100);
  const targetInteractive = useRef(0); // 0 = default crosshair, 1 = bracketed box
  const targetClick = useRef(0);

  // Interpolated lerp values
  const currentX = useRef(-100);
  const currentY = useRef(-100);
  const currentProgress = useRef(0);
  const currentScale = useRef(1);

  useEffect(() => {
    // Check if pointer device is fine (mouse/trackpad)
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    let rafId = null;

    // Passive mousemove listener (zero React state overhead)
    const handleMouseMove = (e) => {
      targetX.current = e.clientX;
      targetY.current = e.clientY;

      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        if (cursorRef.current) {
          cursorRef.current.style.opacity = '1';
        }
      }

      // Check if hovering over element with data-cursor="interactive"
      const el = e.target?.closest?.('[data-cursor="interactive"]');
      if (el) {
        targetInteractive.current = 1;
        const text = el.getAttribute('data-cursor-text') || '';
        if (text !== currentLabelRef.current) {
          currentLabelRef.current = text;
          if (labelRef.current) {
            labelRef.current.textContent = text;
            labelRef.current.style.display = text ? 'block' : 'none';
          }
        }
      } else {
        targetInteractive.current = 0;
        if (currentLabelRef.current !== '') {
          currentLabelRef.current = '';
          if (labelRef.current) {
            labelRef.current.style.display = 'none';
          }
        }
      }
    };

    const handleMouseDown = () => {
      targetClick.current = 1;
    };

    const handleMouseUp = () => {
      targetClick.current = 0;
    };

    const handleMouseLeave = () => {
      isVisibleRef.current = false;
      targetInteractive.current = 0;
      if (cursorRef.current) {
        cursorRef.current.style.opacity = '0';
      }
    };

    const handleMouseEnter = () => {
      isVisibleRef.current = true;
      if (cursorRef.current) {
        cursorRef.current.style.opacity = '1';
      }
    };

    // Physics constants
    const POS_LERP = 0.22;
    const STATE_LERP = 0.16;
    const CLICK_LERP = 0.30;

    const renderLoop = () => {
      // Position lerp
      currentX.current += (targetX.current - currentX.current) * POS_LERP;
      currentY.current += (targetY.current - currentY.current) * POS_LERP;

      // State expansion lerp (0 to 1)
      currentProgress.current += (targetInteractive.current - currentProgress.current) * STATE_LERP;

      // Click scale lerp
      const targetScaleVal = targetClick.current ? 0.85 : 1;
      currentScale.current += (targetScaleVal - currentScale.current) * CLICK_LERP;

      if (cursorRef.current) {
        const x = currentX.current;
        const y = currentY.current;
        const p = currentProgress.current;
        const s = currentScale.current;

        // Apply hardware-accelerated 3D transform
        cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`;

        // Bracket geometry sizing
        const halfSize = 6 + p * 14;  // 6px -> 20px
        const bracketLen = 4 + p * 4; // 4px -> 8px
        const strokeOpacity = 0.75 + p * 0.25;

        // Mutate SVG attributes directly without React reconciliation
        const svg = cursorRef.current.querySelector('svg');
        if (svg) {
          const chH = cursorRef.current.querySelector('.cursor-cross-h');
          const chV = cursorRef.current.querySelector('.cursor-cross-v');
          if (chH && chV) {
            const crossHalf = 6 * (1 - p * 0.4);
            chH.setAttribute('x1', `${-crossHalf}`);
            chH.setAttribute('x2', `${crossHalf}`);
            chV.setAttribute('y1', `${-crossHalf}`);
            chV.setAttribute('y2', `${crossHalf}`);
            chH.setAttribute('stroke-opacity', `${1 - p * 0.3}`);
            chV.setAttribute('stroke-opacity', `${1 - p * 0.3}`);
          }

          const tl = cursorRef.current.querySelector('.bracket-tl');
          if (tl) {
            tl.setAttribute('d', `M ${-halfSize + bracketLen} ${-halfSize} H ${-halfSize} V ${-halfSize + bracketLen}`);
            tl.setAttribute('stroke-opacity', `${p * strokeOpacity}`);
          }

          const tr = cursorRef.current.querySelector('.bracket-tr');
          if (tr) {
            tr.setAttribute('d', `M ${halfSize - bracketLen} ${-halfSize} H ${halfSize} V ${-halfSize + bracketLen}`);
            tr.setAttribute('stroke-opacity', `${p * strokeOpacity}`);
          }

          const bl = cursorRef.current.querySelector('.bracket-bl');
          if (bl) {
            bl.setAttribute('d', `M ${-halfSize} ${halfSize - bracketLen} V ${halfSize} H ${-halfSize + bracketLen}`);
            bl.setAttribute('stroke-opacity', `${p * strokeOpacity}`);
          }

          const br = cursorRef.current.querySelector('.bracket-br');
          if (br) {
            br.setAttribute('d', `M ${halfSize - bracketLen} ${halfSize} H ${halfSize} V ${halfSize - bracketLen}`);
            br.setAttribute('stroke-opacity', `${p * strokeOpacity}`);
          }
        }
      }

      rafId = requestAnimationFrame(renderLoop);
    };

    // Attach passive listeners to decouple from main JS thread
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.documentElement.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    document.documentElement.addEventListener('mouseenter', handleMouseEnter, { passive: true });

    rafId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="fixed top-0 left-0 pointer-events-none z-[9999] opacity-0 transition-opacity duration-150 gpu-accelerate"
      style={{
        transform: 'translate3d(-100px, -100px, 0)',
      }}
    >
      <div className="relative -top-1/2 -left-1/2 flex items-center justify-center">
        <svg
          width="64"
          height="64"
          viewBox="-32 -32 64 64"
          className="overflow-visible"
        >
          {/* Default 12px Crosshair Reticle (+) */}
          <line
            className="cursor-cross-h"
            x1="-6"
            y1="0"
            x2="6"
            y2="0"
            stroke="#f5f5f5"
            strokeWidth="1.2"
            strokeLinecap="square"
          />
          <line
            className="cursor-cross-v"
            x1="0"
            y1="-6"
            x2="0"
            y2="6"
            stroke="#f5f5f5"
            strokeWidth="1.2"
            strokeLinecap="square"
          />

          {/* Interactive Bracketed Box [  ] Corner Paths */}
          <path
            className="bracket-tl"
            d="M -14 -20 H -20 V -14"
            fill="none"
            stroke="#f5f5f5"
            strokeWidth="1.4"
            strokeLinecap="square"
            strokeOpacity="0"
          />
          <path
            className="bracket-tr"
            d="M 14 -20 H 20 V -14"
            fill="none"
            stroke="#f5f5f5"
            strokeWidth="1.4"
            strokeLinecap="square"
            strokeOpacity="0"
          />
          <path
            className="bracket-bl"
            d="M -20 14 V 20 H -14"
            fill="none"
            stroke="#f5f5f5"
            strokeWidth="1.4"
            strokeLinecap="square"
            strokeOpacity="0"
          />
          <path
            className="bracket-br"
            d="M 14 20 H 20 V 14"
            fill="none"
            stroke="#f5f5f5"
            strokeWidth="1.4"
            strokeLinecap="square"
            strokeOpacity="0"
          />
        </svg>

        {/* Optional Tactical Label if provided via data-cursor-text (Direct DOM Ref) */}
        <div
          ref={labelRef}
          className="absolute top-6 left-6 whitespace-nowrap bg-pure-black border border-border-gray px-1.5 py-0.5 font-mono text-[9px] tracking-widest text-pure-white uppercase shadow-md pointer-events-none"
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

export default CustomCursor;
