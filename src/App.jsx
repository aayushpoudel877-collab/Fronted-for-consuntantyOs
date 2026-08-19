import React, { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Heart,
  Layers3,
  MessageCircle,
  MousePointer2,
  Phone,
  Shield,
  Sparkles,
  Users,
  Globe,
} from 'lucide-react';

/* =========================================================
   PREMIUM DESIGN SYSTEM
   ========================================================= */

const cn = (...classes) => classes.filter(Boolean).join(' ');

/* =========================================================
   INTERACTIVE AMBIENT BACKGROUND (unchanged)
   ========================================================= */

const InteractiveParticleNetwork = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let particles = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.35;
        this.r = Math.random() * 2 + 0.7;
        this.phase = Math.random() * Math.PI * 2;
      }
      update(t) {
        this.x += this.vx + Math.cos(t * 0.0003 + this.phase) * 0.04;
        this.y += this.vy + Math.sin(t * 0.00025 + this.phase) * 0.04;

        if (this.x < -30) this.x = width + 30;
        if (this.x > width + 30) this.x = -30;
        if (this.y < -30) this.y = height + 30;
        if (this.y > height + 30) this.y = -30;

        const dx = this.x - mouseRef.current.x;
        const dy = this.y - mouseRef.current.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 130 && distance > 0) {
          const force = (130 - distance) / 130;
          this.x += (dx / distance) * force * 3.2;
          this.y += (dy / distance) * force * 3.2;
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(37,99,235,0.32)';
        ctx.fill();
      }
    }

    const init = () => {
      const count = Math.min(95, Math.max(48, Math.floor(window.innerWidth / 14)));
      particles = Array.from({ length: count }, () => new Particle());
    };

    const onMove = (event) => {
      mouseRef.current = { x: event.clientX, y: event.clientY };
    };

    const onLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    const animate = (time) => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.update(time);
        p.draw();
      });

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const a = particles[i];
          const b = particles[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);

          if (distance < 155) {
            const opacity = (1 - distance / 155) * 0.34;
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            const mouseDistance = Math.hypot(mx - mouseRef.current.x, my - mouseRef.current.y);
            const hot = mouseDistance < 100;

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = hot
              ? `rgba(124,58,237,${Math.min(0.8, opacity * 3)})`
              : `rgba(37,99,235,${opacity})`;
            ctx.lineWidth = hot ? 1.6 : 0.6;
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    resize();
    init();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none opacity-90"
      aria-hidden="true"
    />
  );
};

/* =========================================================
   SCROLL / MOTION PRIMITIVES
   ========================================================= */

const Reveal = ({ children, delay = 0, y = 36, className }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

const BlurReveal = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, filter: 'blur(14px)', y: 18 }}
    whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

/* =========================================================
   TYPING COMPONENTS
   ========================================================= */

const HeroTypewriter = ({ words, interval = 2600 }) => {
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[index];

    const timer = setTimeout(
      () => {
        if (!deleting) {
          if (value.length < word.length) {
            setValue(word.slice(0, value.length + 1));
          } else {
            setDeleting(true);
          }
        } else {
          if (value.length > 0) {
            setValue(word.slice(0, value.length - 1));
          } else {
            setDeleting(false);
            setIndex((current) => (current + 1) % words.length);
          }
        }
      },
      deleting ? 45 : value.length === word.length ? interval : 92,
    );

    return () => clearTimeout(timer);
  }, [value, deleting, index, words, interval]);

  return (
    <span className="relative inline-block min-w-[8ch] bg-gradient-to-r from-blue-700 via-violet-600 to-cyan-500 bg-clip-text text-transparent">
      {value}
      <span className="ml-0.5 inline-block h-[0.9em] w-[2px] translate-y-[0.08em] animate-pulse bg-blue-600" />
    </span>
  );
};

const PromiseTypewriter = ({ lines, delayBetweenLines = 600 }) => {
  const [displayed, setDisplayed] = useState('');
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    if (lineIndex >= lines.length) {
      setIsComplete(true);
      return;
    }

    const currentLine = lines[lineIndex];
    if (charIndex < currentLine.length) {
      const timer = setTimeout(() => {
        setDisplayed((prev) => prev + currentLine[charIndex]);
        setCharIndex(charIndex + 1);
      }, 25 + Math.random() * 20);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setLineIndex(lineIndex + 1);
        setCharIndex(0);
        setDisplayed((prev) => prev + '\n');
      }, delayBetweenLines);
      return () => clearTimeout(timer);
    }
  }, [hasStarted, lineIndex, charIndex, lines, delayBetweenLines]);

  return (
    <div ref={ref} className="font-serif font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950">
      <span className="whitespace-pre-wrap text-4xl md:text-5xl">
        {displayed}
        {!isComplete && hasStarted && (
          <span className="inline-block h-[0.9em] w-[2px] translate-y-[0.08em] animate-pulse bg-blue-600" />
        )}
      </span>
      {!hasStarted && (
        <span className="text-4xl md:text-5xl text-slate-300">Built for student-focused teams<br />that care about<br />student experience.</span>
      )}
    </div>
  );
};

/* =========================================================
   MAGNETIC BUTTON & SPOTLIGHT CARD
   ========================================================= */

const MagneticButton = ({ children, className = '', variant = 'primary', onClick, type = 'button' }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 280, damping: 18 });
  const springY = useSpring(y, { stiffness: 280, damping: 18 });

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.12);
    y.set((e.clientY - (rect.top + rect.height / 2)) * 0.12);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: springX, y: springY }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl px-6 py-3.5 text-sm font-semibold transition-shadow duration-300',
        variant === 'primary' &&
          'bg-slate-950 text-white shadow-[0_16px_50px_rgba(15,23,42,0.25)]',
        variant === 'light' &&
          'bg-white text-slate-950 shadow-[0_12px_40px_rgba(15,23,42,0.12)]',
        variant === 'ghost' &&
          'border border-white/15 bg-white/10 text-white backdrop-blur-xl',
        className,
      )}
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative">{children}</span>
    </motion.button>
  );
};

const SpotlightCard = ({ children, className = '', glow = 'blue', tilt = 6 }) => {
  const ref = useRef(null);
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const sx = useSpring(rotateX, { stiffness: 180, damping: 22 });
  const sy = useSpring(rotateY, { stiffness: 180, damping: 22 });

  const glowColor =
    glow === 'violet' ? '124,58,237' : glow === 'cyan' ? '6,182,212' : '37,99,235';

  const background = useMotionTemplate`radial-gradient(circle at ${mx}% ${my}%, rgba(${glowColor},0.17), transparent 42%)`;

  const handleMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    mx.set(px * 100);
    my.set(py * 100);
    rotateY.set((px - 0.5) * tilt);
    rotateX.set((0.5 - py) * tilt);
  };

  const handleLeave = () => {
    mx.set(50);
    my.set(50);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX: sx, rotateY: sy }}
      transition={{ type: 'spring', stiffness: 180, damping: 20 }}
      className={cn('relative transform-gpu', className)}
    >
      <div className="relative h-full overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/80 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
        <motion.div
          style={{ background }}
          className="pointer-events-none absolute inset-0 z-10 opacity-90"
        />
        <div className="pointer-events-none absolute inset-[1px] rounded-[27px] bg-gradient-to-br from-white/60 via-transparent to-white/10" />
        <div className="relative z-20 h-full">{children}</div>
      </div>
    </motion.div>
  );
};

/* =========================================================
   SKETCH CHARACTER (eyes follow mouse, body tilts, peeking reaction)
   ========================================================= */

const SketchCharacter = ({ mouseX, mouseY, peeking, contact }) => {
  const rotateX = useTransform(mouseY, [-1, 1], [8, -8]);
  const rotateY = useTransform(mouseX, [-1, 1], [-12, 12]);

  // Pupil translations (relative to eye center)
  const pupilLeftOffsetX = useTransform(mouseX, [-1, 1], [-2, 2]);
  const pupilLeftOffsetY = useTransform(mouseY, [-1, 1], [-1.5, 1.5]);
  const pupilRightOffsetX = useTransform(mouseX, [-1, 1], [-2, 2]);
  const pupilRightOffsetY = useTransform(mouseY, [-1, 1], [-1.5, 1.5]);

  return (
    <motion.div style={{ rotateX, rotateY, transformPerspective: 800 }} className="w-full h-full">
      <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
        {/* Body */}
        <path d="M100 75 L100 140" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />

        {/* Left arm group */}
        <motion.g
          style={{ rotate: peeking ? -30 : 0, transformOrigin: '85px 85px' }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <path d="M85 85 Q75 100 75 120" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" fill="none" />
          <circle cx="75" cy="120" r="5" fill="#fbbf24" stroke="#1e293b" strokeWidth="2" />
        </motion.g>

        {/* Right arm — lifts the phone when the contact field is active */}
        <motion.g
          animate={{
            rotate: peeking ? 8 : 0,
            x: peeking ? 2 : 0,
            y: peeking ? 2 : 0,
          }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          style={{ transformOrigin: '115px 85px' }}
        >
          <path
            d={peeking ? 'M115 85 Q126 94 132 103' : 'M115 85 Q125 100 125 120'}
            stroke="#1e293b"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <circle
            cx={peeking ? 132 : 125}
            cy={peeking ? 103 : 120}
            r="5"
            fill="#fbbf24"
            stroke="#1e293b"
            strokeWidth="2"
          />

          {peeking && (
            <motion.g
              initial={{ opacity: 0, scale: 0.8, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              style={{ transformOrigin: '143px 96px' }}
            >
              <rect x="132" y="72" width="23" height="40" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="2" />
              <rect x="135" y="76" width="17" height="30" rx="2.5" fill="#f8fafc" />
              <circle cx="143.5" cy="109" r="1.5" fill="#64748b" />
              <text
                x="143.5"
                y="91"
                textAnchor="middle"
                fontSize="3.4"
                fontWeight="600"
                fill="#2563eb"
              >
                {contact || 'MOBILE'}
              </text>
            </motion.g>
          )}
        </motion.g>

        {/* Head */}
        <circle cx="100" cy="50" r="25" fill="white" stroke="#1e293b" strokeWidth="4" />
        {/* Eyes */}
        <ellipse cx="90" cy="48" rx="4" ry="5" fill="#1e293b" />
        <ellipse cx="110" cy="48" rx="4" ry="5" fill="#1e293b" />

        {/* Pupils (follow mouse) */}
        <motion.g style={{ x: pupilLeftOffsetX, y: pupilLeftOffsetY }}>
          <circle cx="90" cy="48" r="1.5" fill="white" />
        </motion.g>
        <motion.g style={{ x: pupilRightOffsetX, y: pupilRightOffsetY }}>
          <circle cx="110" cy="48" r="1.5" fill="white" />
        </motion.g>

        {/* Mouth */}
        <path d="M95 60 Q100 65 105 60" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </motion.div>
  );
};


/* =========================================================
   HERO VISUAL
   ========================================================= */

const HeroVisual = () => {
  const cards = [
    {
      icon: Users,
      title: 'Student cases',
      value: '128',
      detail: '+18% this month',
      glow: 'blue',
    },
    {
      icon: MessageCircle,
      title: 'Conversations',
      value: '42',
      detail: '12 awaiting reply',
      glow: 'violet',
    },
    {
      icon: Shield,
      title: 'Documents',
      value: '96%',
      detail: 'Secure & organized',
      glow: 'cyan',
    },
  ];

  return (
    <Reveal delay={0.32}>
      <div className="relative mx-auto mt-16 max-w-5xl">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative grid gap-4 md:grid-cols-3">
          {cards.map(({ icon: Icon, title, value, detail, glow }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.35 + index * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ y: -8 }}
            >
              <SpotlightCard glow={glow} className="h-full">
                <div className="p-6 text-left">
                  <div className="flex items-center justify-between">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg">
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300" />
                  </div>

                  <p className="mt-7 text-sm font-semibold text-slate-500">{title}</p>
                  <div className="mt-1 text-4xl font-semibold tracking-[-0.04em] text-slate-950">
                    {value}
                  </div>
                  <p className="mt-2 text-xs font-medium text-blue-600">{detail}</p>

                  <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${62 + index * 14}%` }}
                      transition={{
                        duration: 1.2,
                        delay: 0.7 + index * 0.12,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400"
                    />
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.75 }}
          className="mx-auto mt-5 flex max-w-md items-center justify-center gap-3 rounded-2xl border border-white/80 bg-white/70 px-5 py-3 shadow-lg backdrop-blur-xl"
        >
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-slate-200 text-[10px] font-bold text-slate-600"
              >
                {item}
              </div>
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-600">
            Everything your team needs, in one workspace.
          </span>
        </motion.div>
      </div>
    </Reveal>
  );
};

/* =========================================================
   BOOK A DEMO SECTION
   ========================================================= */

const BookDemoSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    organization: '',
    contact: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [contactFocused, setContactFocused] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const characterRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!characterRef.current) return;
    const rect = characterRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const ny = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    mouseX.set(Math.max(-1, Math.min(1, nx)));
    mouseY.set(Math.max(-1, Math.min(1, ny)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'contact') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, contact: digitsOnly }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section
      id="book-demo"
      className="relative z-10 px-6 py-16 md:py-24"
      onMouseMove={handleMouseMove}
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700">
              <Sparkles className="h-3.5 w-3.5" />
              Book a demo
            </div>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-slate-950 md:text-5xl">
              Let's build something great together
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-600">
              Fill out the form and we'll get back to you. Or reach out directly.
            </p>
          </div>
        </Reveal>

        <div className="grid items-center gap-10 md:grid-cols-2">
          {/* Form */}
          <Reveal delay={0.1}>
            <SpotlightCard glow="blue" className="h-full">
              <div className="p-8">
                {submitted ? (
                  <div className="py-10 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-50 text-green-600"
                    >
                      <Check className="h-8 w-8" />
                    </motion.div>
                    <h3 className="mt-4 text-2xl font-semibold text-slate-950">Request received ✓</h3>
                    <p className="mt-2 text-sm text-slate-500">We'll reach out shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-slate-700">Name</label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="address" className="block text-sm font-semibold text-slate-700">Address</label>
                      <input
                        id="address"
                        name="address"
                        type="text"
                        required
                        value={formData.address}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        placeholder="City, Country"
                      />
                    </div>
                    <div>
                      <label htmlFor="organization" className="block text-sm font-semibold text-slate-700">Organization Name</label>
                      <input
                        id="organization"
                        name="organization"
                        type="text"
                        required
                        value={formData.organization}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        placeholder="Your organization name"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact" className="block text-sm font-semibold text-slate-700">Contact Number</label>
                      <input
                        id="contact"
                        name="contact"
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]{10}"
                        maxLength={10}
                        minLength={10}
                        required
                        value={formData.contact}
                        onChange={handleChange}
                        onFocus={() => setContactFocused(true)}
                        onBlur={() => setContactFocused(false)}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        placeholder="Enter 10-digit mobile number"
                      />
                    </div>
                    <div className="pt-2">
                      <MagneticButton type="submit" className="w-full">
                        Book a demo
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </MagneticButton>
                    </div>
                  </form>
                )}
              </div>
            </SpotlightCard>
          </Reveal>

          {/* Character */}
          <Reveal delay={0.2} className="flex justify-center">
            <div ref={characterRef} className="relative h-72 w-72 md:h-96 md:w-96">
              <SketchCharacter mouseX={mouseX} mouseY={mouseY} peeking={contactFocused} contact={formData.contact} />
            </div>
          </Reveal>
        </div>

        {/* Contact info */}
        <Reveal delay={0.15}>
          <div className="mt-10 text-center">
            <p className="text-sm text-slate-500">
              Or contact <span className="font-semibold text-slate-700">Yogesh Luitle</span> — Product Manager / Founder
            </p>
            <a
              href="tel:9767223140"
              className="mt-2 inline-flex items-center gap-2 text-lg font-semibold text-blue-700 transition hover:text-blue-900"
            >
              <Phone className="h-5 w-5" />
              9767223140
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* =========================================================
   MAIN PAGE
   ========================================================= */

const VisaSteps = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progressScale = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const scrollToBookDemo = () => {
    document.getElementById('book-demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  const menu = [
    ['Features', '#features'],
    ['Solutions', '#solutions'],
    ['Resources', '#resources'],
    ['Pricing', '#pricing'],
    ['About', '#about'],
  ];

  const linkMap = {
    '#features': '#features',
    '#solutions': '#features',
    '#resources': '#features',
    '#pricing': '#login',
    '#about': '#promise',
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F8FC] font-sans text-slate-900 selection:bg-slate-950 selection:text-white">
      <style>{`html { scroll-behavior: smooth; }`}</style>
      <InteractiveParticleNetwork />

      {/* Scroll progress */}
      <motion.div
        style={{ scaleX: progressScale }}
        className="fixed left-0 right-0 top-0 z-[70] h-1 origin-left bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400"
      />

      {/* Ambient color wash */}
      <div className="pointer-events-none fixed -left-32 top-32 z-0 h-80 w-80 rounded-full bg-blue-500/10 blur-[100px]" />
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none fixed right-0 top-1/3 z-0 h-72 w-72 rounded-full bg-violet-500/10 blur-[110px]"
      />

      {/* Navigation */}
      <header className="fixed left-1/2 top-4 z-[60] w-[calc(100%-24px)] max-w-6xl -translate-x-1/2">
        <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/75 px-4 py-3 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
          <a href="#" className="flex items-center gap-2.5">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.05 }}
              className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-white shadow-lg"
            >
              <span className="text-sm font-bold">VS</span>
            </motion.div>
            <span className="text-base font-bold tracking-tight text-slate-950">
              Consultancy<span className="text-blue-700">OS</span>
            </span>
          </a>

          <nav className="hidden items-center gap-6 md:flex">
            {menu.map(([label, href]) => (
              <a
                key={label}
                href={linkMap[href]}
                className="group flex items-center gap-1 text-xs font-semibold text-slate-500 transition hover:text-slate-950"
              >
                {label}
                {['Features', 'Solutions', 'Resources'].includes(label) && (
                  <ChevronDown className="h-3 w-3 transition-transform group-hover:translate-y-0.5" />
                )}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <a href="#login" className="text-xs font-semibold text-slate-500 transition hover:text-slate-950">
              Log in
            </a>
            <MagneticButton
              variant="primary"
              className="rounded-xl px-4 py-2.5 text-xs"
              onClick={scrollToBookDemo}
            >
              Book a demo
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </MagneticButton>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold md:hidden"
          >
            Menu
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            className="mt-2 overflow-hidden rounded-2xl border border-white/80 bg-white/75 backdrop-blur-2xl md:hidden"
          >
            <div className="grid gap-1 p-4">
              {menu.map(([label, href]) => (
                <a
                  key={label}
                  href={linkMap[href]}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-white/50"
                >
                  {label}
                </a>
              ))}
              <a
                href="#book-demo"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileOpen(false);
                  scrollToBookDemo();
                }}
                className="mt-1 rounded-xl bg-slate-950 px-3 py-3 text-center text-sm font-semibold text-white"
              >
                Book a demo
              </a>
            </div>
          </motion.div>
        )}
      </header>

      {/* Hero */}
      <section className="relative z-10 px-6 pb-8 pt-32 md:pt-44 lg:pb-12">
        <div className="mx-auto max-w-6xl text-center">
          <Reveal>
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600 shadow-sm backdrop-blur-xl">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              All-in-one platform for student applications
            </div>
          </Reveal>

          <BlurReveal delay={0.08}>
            <h1 className="mx-auto mt-7 max-w-5xl text-5xl font-semibold leading-[0.97] tracking-[-0.06em] text-slate-950 md:text-7xl lg:text-8xl">
              Run your consultancy
              <br />
              with{' '}
              <HeroTypewriter
                words={['clarity.', 'confidence.', 'possibilities.', 'belief.']}
                interval={2400}
              />
            </h1>
          </BlurReveal>

          <Reveal delay={0.16}>
            <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
              Keep student cases, documents, and communication organized—so you can focus on what
              matters most: people and possibilities.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <MagneticButton onClick={scrollToBookDemo}>
                Book a demo
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </MagneticButton>
              <MagneticButton variant="light" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                Explore features
                <MousePointer2 className="h-4 w-4" />
              </MagneticButton>
            </div>
          </Reveal>

          <HeroVisual />
        </div>
      </section>

      {/* Feature Strip */}
      <section className="relative z-10 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: Shield, title: 'Secure & reliable', desc: 'Your data and your students’ trust are protected.' },
              { icon: Users, title: 'Built for education teams', desc: 'Designed for teams, for better student support.' },
              { icon: Heart, title: 'Student experience first', desc: 'Every feature is crafted to support the human journey.' },
            ].map(({ icon: Icon, title, desc }, index) => (
              <Reveal key={title} delay={index * 0.08}>
                <SpotlightCard glow={index === 0 ? 'blue' : index === 1 ? 'violet' : 'cyan'} className="h-full min-h-[200px]">
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <motion.div
                      whileHover={{ rotate: 7, scale: 1.06 }}
                      className="grid h-12 w-12 place-items-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 shadow-sm"
                    >
                      <Icon className="h-5 w-5" />
                    </motion.div>
                    <h3 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-slate-950">{title}</h3>
                    <p className="mt-2 max-w-xs text-sm leading-5 text-slate-500">{desc}</p>
                  </div>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Promise Card with Scroll-Triggered Typewriter */}
      <section id="promise" className="relative z-10 px-6 py-28 md:py-36">
        <div className="mx-auto max-w-6xl">
          <SpotlightCard glow="violet" className="min-h-[300px]">
            <div className="grid items-center gap-8 p-8 md:grid-cols-[0.9fr_1.1fr]">
              <div>
                <Reveal>
                  <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.14em] text-blue-700">
                    Our promise
                    <span className="h-[2px] w-11 bg-gradient-to-r from-blue-500 to-violet-500" />
                  </div>
                </Reveal>
                <div className="mt-5 max-w-md">
                  <PromiseTypewriter
                    lines={[
                      'Built for student-focused teams',
                      'that care about',
                      'student experience.',
                    ]}
                    delayBetweenLines={500}
                  />
                </div>
                <Reveal delay={0.3}>
                  <p className="mt-6 max-w-sm text-sm leading-6 text-slate-600">
                    Visa Steps helps you stay organized, respond faster, and guide every student
                    journey with confidence and care.
                  </p>
                </Reveal>
              </div>
              <div className="relative min-h-[200px] rounded-[24px] bg-gradient-to-br from-blue-50 via-violet-50 to-cyan-50 p-6 shadow-inner">
                <div className="flex h-full flex-col items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-serif font-semibold text-slate-800">Guiding dreams.</div>
                    <div className="text-3xl font-serif font-semibold text-slate-800">Building futures.</div>
                  </div>
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="mt-6 rounded-full border border-white/80 bg-white/80 px-4 py-2 shadow-lg backdrop-blur-md"
                  >
                    <span className="text-sm font-semibold text-slate-700">✨ 100+ students placed</span>
                  </motion.div>
                </div>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* Feature Cards */}
      <section id="features" className="relative z-10 px-6 pb-20 md:pb-28">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Core capabilities
            </motion.div>
            <BlurReveal>
              <h2 className="text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-slate-950 md:text-6xl">
                Everything you need to keep applications moving.
              </h2>
            </BlurReveal>
            <Reveal delay={0.08}>
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
                Keep applications, documents, and communication organized in one place.
              </p>
            </Reveal>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: Users,
                title: 'Stay organized',
                desc: 'Centralize student cases and documents so nothing falls through the cracks.',
                glow: 'blue',
              },
              {
                icon: Sparkles,
                title: 'Communicate with ease',
                desc: 'Keep every conversation in one place and respond faster.',
                glow: 'violet',
              },
              {
                icon: Shield,
                title: 'Work with confidence',
                desc: 'Protect data, maintain compliance, and build trust with every interaction.',
                glow: 'cyan',
              },
            ].map(({ icon: Icon, title, desc, glow }, index) => (
              <Reveal key={title} delay={index * 0.08}>
                <SpotlightCard glow={glow} className="h-full min-h-[280px]">
                  <div className="flex h-full flex-col items-center justify-center p-7 text-center">
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.08 }}
                      className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg"
                    >
                      <Icon className="h-5 w-5" />
                    </motion.div>
                    <h3 className="mt-6 text-2xl font-semibold tracking-[-0.03em] text-slate-950">{title}</h3>
                    <p className="mt-3 max-w-xs text-sm leading-6 text-slate-500">{desc}</p>
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      className="absolute bottom-0 h-[2px] w-14 origin-center bg-gradient-to-r from-blue-500 to-violet-500"
                    />
                  </div>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="login" className="relative z-10 px-6 pb-20 md:pb-28">
        <div className="mx-auto max-w-6xl">
          <motion.div
            whileHover={{ y: -3 }}
            className="relative overflow-hidden rounded-[24px] bg-slate-950 px-7 py-12 shadow-[0_24px_60px_rgba(7,50,99,0.20)] sm:px-10 sm:py-14"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_20%,rgba(74,126,255,0.20),transparent_28%),radial-gradient(circle_at_100%_100%,rgba(211,170,74,0.16),transparent_28%)]" />

            <motion.div
              animate={{ x: [0, 12, 0], y: [0, -3, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -right-4 bottom-[-30px] h-28 w-28 rotate-[-23deg] border-b-2 border-r-2 border-blue-500/60"
            />

            <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="max-w-lg text-3xl font-semibold leading-[1.04] tracking-[-0.035em] text-white sm:text-4xl">
                  Ready to bring more clarity
                  <br />
                  to your student support?
                </h2>
                <p className="mt-3 text-sm leading-5 text-white/70">
                  Let's build better outcomes for your students—together.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <MagneticButton
                  variant="primary"
                  className="bg-blue-600 shadow-[0_16px_35px_rgba(0,0,0,0.18)] hover:bg-blue-700"
                  onClick={scrollToBookDemo}
                >
                  Book a demo
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </MagneticButton>
                <MagneticButton variant="ghost" className="border-white/40 text-white hover:bg-white/10">
                  Talk to our team
                </MagneticButton>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* New Book a Demo Section */}
      <BookDemoSection />

      {/* Anchor sections */}
      <section id="solutions" className="h-8" aria-hidden="true" />
      <section id="resources" className="h-0" aria-hidden="true" />
      <section id="pricing" className="h-0" aria-hidden="true" />
      <section id="about" className="h-0" aria-hidden="true" />

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200/80 bg-white/55 px-6 py-8 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div>
            <div className="text-sm font-bold text-slate-950">Visa Steps</div>
            <div className="mt-1 text-xs text-slate-400">Simple tools for clearer student journeys.</div>
          </div>
          <div className="text-xs text-slate-400">
            © {new Date().getFullYear()} Visa Steps · All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VisaSteps;