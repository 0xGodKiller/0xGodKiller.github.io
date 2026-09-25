import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Terminal, 
  Send, 
  CheckCircle2, 
  Github, 
  Linkedin, 
  Mail, 
  ShieldCheck, 
  RefreshCcw, 
  Radio, 
  CornerDownRight 
} from 'lucide-react';
import useDeviceCapabilities from '../hooks/useDeviceCapabilities';

gsap.registerPlugin(ScrollTrigger);

/**
 * ContactSection Component
 * - Terminal-style message interface centered in the viewport.
 * - Minimalist underline-only fields for Name, Email, and Message with blinking carets.
 * - Outlined [TRANSMIT MESSAGE] action button with hover inversion.
 * - Cathode Collapse Entry: Background and container collapse into a bright single-pixel
 *   center line before snapping open into the terminal interface.
 * - Form Dispatch VFX: 100ms full-screen inverted flash on submit, followed by
 *   tactical "TRANSMISSION LOGGED" confirmation.
 * - Accessibility: Instant plain appearance & flash suppression under prefers-reduced-motion.
 * - Plain-text footer nodes for GITHUB, LINKEDIN, and EMAIL.
 */
export const ContactSection = () => {
  const { prefersReducedMotion } = useDeviceCapabilities();
  const sectionRef = useRef(null);
  const terminalBoxRef = useRef(null);
  const cathodeLineRef = useRef(null);

  // Form states
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [activeField, setActiveField] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [transmissionHash, setTransmissionHash] = useState('');

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Cathode Collapse Entry Animation
  useEffect(() => {
    const section = sectionRef.current;
    const terminal = terminalBoxRef.current;
    const cathodeLine = cathodeLineRef.current;
    if (!section || !terminal || !cathodeLine) return;

    if (prefersReducedMotion) {
      gsap.set(terminal, { opacity: 1, scaleX: 1, scaleY: 1 });
      gsap.set(cathodeLine, { opacity: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      // Setup initial state: terminal hidden, cathode line centered
      gsap.set(terminal, { opacity: 0, scaleY: 0.05, transformOrigin: 'center center' });
      gsap.set(cathodeLine, { scaleX: 1, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          once: true,
        },
      });

      // 1. Bright single-pixel center line flares open across the screen
      tl.to(cathodeLine, {
        opacity: 1,
        duration: 0.15,
        ease: 'power2.in',
      })
      // 2. Line collapses horizontally toward the center point
      .to(cathodeLine, {
        scaleX: 0.08,
        duration: 0.25,
        ease: 'power4.in',
      })
      // 3. High-energy burst flash
      .to(cathodeLine, {
        scaleX: 0.12,
        filter: 'brightness(3) drop-shadow(0 0 12px #fff)',
        duration: 0.08,
      })
      // 4. Cathode line dissolves as terminal snaps open vertically and horizontally
      .set(cathodeLine, { opacity: 0 })
      .to(terminal, {
        opacity: 1,
        scaleY: 1,
        scaleX: 1,
        force3D: true,
        duration: 0.45,
        ease: 'back.out(1.4)', // Violent analog phosphor snap open
        clearProps: 'transform,willChange',
      });
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, [prefersReducedMotion]);

  // Form Submission Handler with 100ms Inverted Full-Screen Flash (suppressed for reduced motion)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    // Generate pseudo-random cryptographic transmission hash
    const randomHex = Array.from({ length: 8 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('').toUpperCase();
    setTransmissionHash(`0x${randomHex}::NODE_PRIMARY`);

    if (prefersReducedMotion) {
      setIsSubmitted(true);
      return;
    }

    // Trigger 100ms full-screen inverted flash (pure white)
    setIsFlashing(true);
    setTimeout(() => {
      setIsFlashing(false);
      setIsSubmitted(true);
    }, 100);
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', message: '' });
    setIsSubmitted(false);
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative min-h-screen py-24 flex flex-col justify-center items-center px-6 max-w-5xl mx-auto scroll-mt-16 select-none"
    >
      {/* 100ms Inverted Full-Screen Flash Overlay */}
      {isFlashing && (
        <div
          aria-hidden="true"
          className="fixed inset-0 bg-pure-white z-[99999] pointer-events-none transition-none"
        />
      )}

      {/* Cathode Ray Tube Single-Pixel Collapse Line (VFX Layer) */}
      <div
        ref={cathodeLineRef}
        aria-hidden="true"
        className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-pure-white pointer-events-none z-30 shadow-[0_0_14px_rgba(255,255,255,1),0_0_28px_rgba(255,255,255,0.8)] opacity-0 gpu-accelerate"
      />

      {/* Terminal Form Box Container (Explicit min-h-[580px] to prevent layout recalculations) */}
      <div
        ref={terminalBoxRef}
        className="w-full min-h-[580px] border border-border-gray bg-pure-black/95 shadow-2xl overflow-hidden flex flex-col justify-between gpu-accelerate"
      >
        {/* Terminal Header Bar */}
        <div className="bg-subtle-gray/40 border-b border-border-gray px-5 py-3.5 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-neutral-600 inline-block" />
            <span className="w-2.5 h-2.5 bg-neutral-600 inline-block" />
            <span className="w-2.5 h-2.5 bg-neutral-600 inline-block" />
            <span className="ml-2 font-bold text-pure-white flex items-center gap-2">
              <Terminal size={14} className="text-pure-white" />
              TERMINAL_NODE // TRANSMISSION_BUFFER
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px]">
            <span className="text-neutral-500 hidden sm:inline">CHANNEL: ENCRYPTED_SSL</span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 border border-border-gray text-pure-white bg-pure-black font-semibold">
              <span className={`w-1.5 h-1.5 inline-block ${isSubmitted ? 'bg-pure-white' : 'bg-pure-white animate-pulse'}`} />
              {isSubmitted ? 'DISPATCHED' : 'STANDBY'}
            </span>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="p-6 md:p-10 lg:p-12">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="space-y-2 border-b border-border-gray pb-4">
                <div className="font-mono text-[10px] text-neutral-500 tracking-wider">
                  [COMMUNICATION_PROTOCOL :: RFC-912]
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight font-sans text-pure-white">
                  TRANSMIT TRANSMISSION
                </h3>
                <p className="font-mono text-xs text-neutral-400">
                  Direct telemetry dispatch to engineering core. Complete buffer parameters below to initiate handshake.
                </p>
              </div>

              {/* Minimalist Underline Input Fields */}
              <div className="space-y-8 font-mono">
                {/* Field 1: Name */}
                <div className="relative group">
                  <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                    <label htmlFor="name" className="flex items-center gap-1.5 font-bold text-neutral-300">
                      <span>[01] // IDENTIFIER_NAME</span>
                      {activeField === 'name' && <span className="animate-pulse text-pure-white">_</span>}
                    </label>
                    <span className="text-[10px] text-neutral-600 group-focus-within:text-neutral-400">
                      REQ: STRING
                    </span>
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => setActiveField('name')}
                    onBlur={() => setActiveField(null)}
                    data-cursor="interactive"
                    data-cursor-text="TYPE_NAME"
                    placeholder="Enter your identification..."
                    className="w-full bg-transparent border-b border-border-gray focus:border-pure-white text-sm md:text-base text-pure-white py-2 outline-none transition-colors placeholder:text-neutral-700"
                  />
                </div>

                {/* Field 2: Email */}
                <div className="relative group">
                  <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                    <label htmlFor="email" className="flex items-center gap-1.5 font-bold text-neutral-300">
                      <span>[02] // COMM_CHANNEL_EMAIL</span>
                      {activeField === 'email' && <span className="animate-pulse text-pure-white">_</span>}
                    </label>
                    <span className="text-[10px] text-neutral-600 group-focus-within:text-neutral-400">
                      REQ: EMAIL_ADDR
                    </span>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setActiveField('email')}
                    onBlur={() => setActiveField(null)}
                    data-cursor="interactive"
                    data-cursor-text="TYPE_EMAIL"
                    placeholder="name@domain.com"
                    className="w-full bg-transparent border-b border-border-gray focus:border-pure-white text-sm md:text-base text-pure-white py-2 outline-none transition-colors placeholder:text-neutral-700"
                  />
                </div>

                {/* Field 3: Message */}
                <div className="relative group">
                  <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                    <label htmlFor="message" className="flex items-center gap-1.5 font-bold text-neutral-300">
                      <span>[03] // PAYLOAD_MESSAGE</span>
                      {activeField === 'message' && <span className="animate-pulse text-pure-white">_</span>}
                    </label>
                    <span className="text-[10px] text-neutral-600 group-focus-within:text-neutral-400">
                      REQ: TEXT_PAYLOAD
                    </span>
                  </div>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    onFocus={() => setActiveField('message')}
                    onBlur={() => setActiveField(null)}
                    data-cursor="interactive"
                    data-cursor-text="TYPE_MSG"
                    placeholder="Specify project requirements, technical inquiries, or architectural review..."
                    className="w-full bg-transparent border-b border-border-gray focus:border-pure-white text-sm md:text-base text-pure-white py-2 outline-none transition-colors resize-none placeholder:text-neutral-700"
                  />
                </div>
              </div>

              {/* Action Button: Outlined [TRANSMIT MESSAGE] */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-border-gray">
                <div className="font-mono text-[10px] text-neutral-500 flex items-center gap-2">
                  <Radio size={12} className="text-pure-white" />
                  <span>CIPHER: 4096-BIT RSA // PAYLOAD BUFFER READY</span>
                </div>

                <button
                  type="submit"
                  data-cursor="interactive"
                  data-cursor-text="TRANSMIT_NOW"
                  className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-3 px-8 py-3.5 border border-border-gray bg-transparent text-pure-white font-mono text-xs font-bold tracking-wider uppercase transition-all duration-200 hover:border-pure-white hover:bg-pure-white hover:text-pure-black focus:outline-none"
                >
                  <span>[TRANSMIT MESSAGE]</span>
                  <CornerDownRight size={14} className="group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
                </button>
              </div>
            </form>
          ) : (
            /* Transmission Logged Confirmation View */
            <div className="py-12 space-y-8 font-mono text-center flex flex-col items-center">
              <div className="w-14 h-14 border border-pure-white flex items-center justify-center bg-subtle-gray/50">
                <CheckCircle2 size={28} className="text-pure-white animate-pulse" />
              </div>

              <div className="space-y-3">
                <div className="text-[11px] text-neutral-500 tracking-widest">
                  STATUS // DISPATCH_SUCCESSFUL
                </div>
                <h3 className="text-3xl md:text-4xl font-extrabold text-pure-white tracking-tight">
                  TRANSMISSION LOGGED
                </h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                  Your payload has been authenticated and routed into the engineering queue. Response latency estimate: &lt; 24h.
                </p>
              </div>

              <div className="p-4 border border-border-gray bg-subtle-gray/20 text-xs text-neutral-300 max-w-md w-full space-y-2 text-left">
                <div className="flex justify-between border-b border-border-gray/50 pb-1">
                  <span className="text-neutral-500">TRANSMISSION_HASH:</span>
                  <span className="text-pure-white font-bold">{transmissionHash}</span>
                </div>
                <div className="flex justify-between border-b border-border-gray/50 pb-1">
                  <span className="text-neutral-500">PAYLOAD_ORIGIN:</span>
                  <span className="text-pure-white">{formData.name} ({formData.email})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">PACKET_INTEGRITY:</span>
                  <span className="text-pure-white font-semibold">100% VERIFIED</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                data-cursor="interactive"
                data-cursor-text="RESET_FORM"
                className="inline-flex items-center gap-2 px-6 py-2.5 border border-border-gray hover:border-pure-white text-xs font-mono text-neutral-300 hover:text-pure-white transition-colors"
              >
                <RefreshCcw size={13} />
                <span>[DISPATCH ANOTHER TRANSMISSION]</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Social Nodes: Direct Plain-Text Links */}
        <div className="bg-subtle-gray/20 border-t border-border-gray px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
          <div className="text-[11px] text-neutral-500">
            DIRECT_NODES:
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-neutral-400">
            <a
              href="https://github.com/0xraiven"
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="interactive"
              data-cursor-text="EXT_GITHUB"
              className="hover:text-pure-white transition-colors flex items-center gap-1.5"
            >
              <Github size={13} />
              <span>[GITHUB]</span>
            </a>

            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="interactive"
              data-cursor-text="EXT_LINKEDIN"
              className="hover:text-pure-white transition-colors flex items-center gap-1.5"
            >
              <Linkedin size={13} />
              <span>[LINKEDIN]</span>
            </a>

            <a
              href="mailto:contact@neilshah.dev"
              data-cursor="interactive"
              data-cursor-text="SEND_MAIL"
              className="hover:text-pure-white transition-colors flex items-center gap-1.5"
            >
              <Mail size={13} />
              <span>[EMAIL: contact@neilshah.dev]</span>
            </a>
          </div>

          <div className="text-[10px] text-neutral-500">
            TIME_SYNC: UTC+05:30
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
