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
  Briefcase,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Globe,
  Heart,
  Layers3,
  Lock,
  MessageCircle,
  MousePointer2,
  Plane,
  Shield,
  Sparkles,
  Users,
  User,
  Zap,
} from 'lucide-react';

/* =========================================================
   PREMIUM DESIGN SYSTEM
   ========================================================= */

const palette = {
  ink: '#0B1220',
  navy: '#102A63',
  blue: '#2563EB',
  sky: '#38BDF8',
  violet: '#7C3AED',
  cyan: '#06B6D4',
  amber: '#F59E0B',
  cream: '#F7F8FC',
};

const cn = (...classes) => classes.filter(Boolean).join(' ');

/* =========================================================
   INTERACTIVE AMBIENT BACKGROUND
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

const SectionHeading = ({ eyebrow, title, body, dark = false }) => (
  <div className="max-w-2xl">
    <motion.div
      initial={{ opacity: 0, x: -14 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className={cn(
        'mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em]',
        dark
          ? 'border-white/15 bg-white/10 text-white/75'
          : 'border-blue-100 bg-blue-50/80 text-blue-700',
      )}
    >
      <Sparkles className="h-3.5 w-3.5" />
      {eyebrow}
    </motion.div>

    <BlurReveal>
      <h2
        className={cn(
          'text-4xl font-semibold leading-[1.05] tracking-[-0.04em] md:text-6xl',
          dark ? 'text-white' : 'text-slate-950',
        )}
      >
        {title}
      </h2>
    </BlurReveal>

    <Reveal delay={0.08}>
      <p
        className={cn(
          'mt-6 max-w-xl text-base leading-7 md:text-lg',
          dark ? 'text-white/65' : 'text-slate-600',
        )}
      >
        {body}
      </p>
    </Reveal>
  </div>
);

/* =========================================================
   MAGNETIC BUTTON
   ========================================================= */

const MagneticButton = ({ children, className = '', variant = 'primary', onClick }) => {
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
      type="button"
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

/* =========================================================
   3D / SPOTLIGHT CARD
   ========================================================= */

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
   HERO VISUAL
   ========================================================= */

const HeroOrbit = () => {
  const icons = [
    { Icon: Shield, label: 'Secure', orbit: 'left-[4%] top-[18%]' },
    { Icon: Users, label: 'Students', orbit: 'right-[4%] top-[26%]' },
    { Icon: MessageCircle, label: 'Messages', orbit: 'left-[12%] bottom-[18%]' },
    { Icon: Globe, label: 'Global', orbit: 'right-[12%] bottom-[16%]' },
  ];

  return (
    <div className="relative mx-auto mt-12 h-[250px] max-w-4xl md:h-[340px]">
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [0, 1, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-1/2 top-1/2 w-[230px] -translate-x-1/2 -translate-y-1/2 md:w-[310px]"
      >
        <div className="relative rounded-[30px] border border-white/80 bg-white/90 p-4 shadow-[0_30px_90px_rgba(37,99,235,0.2)] backdrop-blur-2xl">
          <div className="rounded-[23px] bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">ConsultancyOS</div>
                <div className="mt-1 text-lg font-semibold">Control Center</div>
              </div>
              <div className="rounded-xl bg-white/10 p-2">
                <Layers3 className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2">
              {['128', '94%', '24'].map((value, i) => (
                <motion.div
                  key={value}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.08 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.07] p-3"
                >
                  <div className="text-lg font-bold">{value}</div>
                  <div className="mt-1 text-[8px] uppercase tracking-wider text-white/45">
                    {['cases', 'reply rate', 'tasks'][i]}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-3 h-16 rounded-2xl border border-white/10 bg-white/[0.05] p-3">
              <div className="flex items-end gap-1.5">
                {[30, 45, 35, 62, 48, 75, 68, 90, 77, 100].map((h, i) => (
                  <motion.span
                    key={i}
                    initial={{ height: 6 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.55 + i * 0.05, duration: 0.7, ease: 'easeOut' }}
                    className="flex-1 rounded-full bg-gradient-to-t from-sky-400 to-violet-400"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {icons.map(({ Icon, label, orbit }, index) => (
        <motion.div
          key={label}
          animate={{ y: [0, index % 2 ? -10 : 10, 0] }}
          transition={{
            duration: 4.5 + index * 0.45,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: index * 0.25,
          }}
          className={cn('absolute hidden md:block', orbit)}
        >
          <div className="flex items-center gap-2 rounded-full border border-white/90 bg-white/85 px-3 py-2 text-[10px] font-semibold text-slate-700 shadow-[0_16px_40px_rgba(15,23,42,0.09)] backdrop-blur-xl">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-blue-50 text-blue-700">
              <Icon className="h-3.5 w-3.5" />
            </span>
            {label}
          </div>
        </motion.div>
      ))}

      <motion.div
        animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-1/2 top-1/2 -z-10 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/20 blur-[70px]"
      />
    </div>
  );
};

/* =========================================================
   FEATURE CARDS
   ========================================================= */

const featureData = [
  {
    icon: Users,
    eyebrow: "Organization",
    title: "Stay organized",
    desc: "Centralize student cases and documents so nothing falls through the cracks.",
    glow: "blue",
    stat: "Everything together",
  },
  {
    icon: MessageCircle,
    eyebrow: "Communication",
    title: "Communicate with ease",
    desc: "Keep every conversation in one place and respond faster.",
    glow: "violet",
    stat: "One clear place",
  },
  {
    icon: Shield,
    eyebrow: "Confidence",
    title: "Work with confidence",
    desc: "Protect data, maintain compliance, and build trust.",
    glow: "cyan",
    stat: "Secure & reliable",
  },
];

const FeatureCard = ({ feature, index }) => {
  const Icon = feature.icon;

  return (
    <Reveal delay={index * 0.09} className="h-full">
      <SpotlightCard glow={feature.glow} className="h-full min-h-[360px]">
        <div className="flex h-full flex-col p-7 md:p-8">
          <div className="flex items-start justify-between">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.08 }}
              className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg"
            >
              <Icon className="h-5 w-5" />
            </motion.div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              {feature.eyebrow}
            </div>
          </div>

          <div className="mt-auto">
            <div className="mb-4 h-px w-full bg-gradient-to-r from-slate-200 via-slate-200 to-transparent" />
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
              <Sparkles className="h-3.5 w-3.5" />
              {feature.stat}
            </div>
            <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.03em] text-slate-950 md:text-3xl">
              {feature.title}
            </h3>
            <p className="mt-4 text-sm leading-6 text-slate-600">{feature.desc}</p>
            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-900">
              Explore workflow
              <motion.span whileHover={{ x: 5 }} className="inline-flex">
                <ArrowRight className="h-4 w-4" />
              </motion.span>
            </div>
          </div>
        </div>
      </SpotlightCard>
    </Reveal>
  );
};

/* =========================================================
   MINI SCROLLING SHOWCASE
   ========================================================= */

const WorkflowShowcase = () => {
  const [active, setActive] = useState(0);

  const tabs = [
    { title: 'Cases', icon: Layers3 },
    { title: 'Students', icon: Users },
    { title: 'Messages', icon: MessageCircle },
  ];

  return (
    <div className="mt-12 grid items-stretch gap-4 md:grid-cols-[0.8fr_1.5fr]">
      <div className="rounded-[28px] border border-white/10 bg-white/[0.06] p-3 backdrop-blur-2xl">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const selected = active === index;
          return (
            <button
              key={tab.title}
              onClick={() => setActive(index)}
              className="relative mb-2 flex w-full items-center gap-3 rounded-2xl p-4 text-left last:mb-0"
            >
              {selected && (
                <motion.div
                  layoutId="active-workflow"
                  className="absolute inset-0 rounded-2xl bg-white/10"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
              <span className={cn(
                'relative z-10 grid h-10 w-10 place-items-center rounded-xl border',
                selected
                  ? 'border-white/15 bg-white text-slate-950'
                  : 'border-white/10 bg-white/5 text-white/65',
              )}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="relative z-10">
                <span className="block text-sm font-semibold text-white">{tab.title}</span>
                <span className="mt-0.5 block text-[11px] text-white/45">
                  {['Pipeline overview', 'Journey timeline', 'Response queue'][index]}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <motion.div
        key={active}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.07] p-5 backdrop-blur-2xl"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-violet-500/15 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">Live workspace</div>
              <div className="mt-1 text-lg font-semibold text-white">{tabs[active].title}</div>
            </div>
            <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-200">
              synced
            </span>
          </div>

          <div className="mt-5 space-y-2">
            {[1, 2, 3, 4].map((item, index) => (
              <motion.div
                key={`${active}-${item}`}
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.07 }}
                className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.045] p-3"
              >
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-white/20 to-white/5" />
                <div className="min-w-0 flex-1">
                  <div className="h-2.5 w-2/3 rounded-full bg-white/15" />
                  <div className="mt-2 h-2 w-1/2 rounded-full bg-white/8" />
                </div>
                <div className="h-7 w-7 rounded-full border border-white/8 bg-white/5" />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/* =========================================================
   LOGIN EXPERIENCE
   ========================================================= */

const LoginCharacterPanel = ({ activeInput }) => {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  const moveX = Math.max(-8, Math.min(8, (mouse.x / Math.max(window.innerWidth, 1) - 0.5) * 16));
  const moveY = Math.max(-6, Math.min(6, (mouse.y / Math.max(window.innerHeight, 1) - 0.5) * 12));

  return (
    <div className="relative hidden min-h-[570px] overflow-hidden rounded-[26px] bg-slate-950 md:block">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(56,189,248,0.24),transparent_34%),radial-gradient(circle_at_75%_72%,rgba(124,58,237,0.22),transparent_35%),linear-gradient(135deg,#07111f,#102a63)]" />
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        className="absolute -right-32 top-10 h-80 w-80 rounded-full border border-white/10"
      />
      <motion.div
        animate={{ rotate: [360, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
        className="absolute -left-24 bottom-0 h-72 w-72 rounded-full border border-white/10"
      />

      <div className="relative z-10 flex h-full flex-col justify-between p-9">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">
            <Lock className="h-3.5 w-3.5" />
            Private workspace
          </div>
          <h3 className="mt-5 max-w-sm text-3xl font-semibold tracking-[-0.04em] text-white">
            Ready to bring more clarity to your consultancy?
          </h3>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/55">
            Let's build better outcomes for your students—together.
          </p>
        </div>

        <div className="relative h-72">
          <motion.div
            animate={{ x: moveX, y: moveY }}
            transition={{ type: 'spring', stiffness: 120, damping: 12 }}
            className="absolute left-1/2 top-7 w-64 -translate-x-1/2"
          >
            <div className="rounded-[26px] border border-white/15 bg-white/[0.08] p-4 shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-white/40">Student profile</div>
                  <div className="mt-1 text-sm font-semibold text-white">Aarav Sharma</div>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-300 to-violet-400" />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-white/5 p-3">
                  <div className="text-xs font-bold text-white">08</div>
                  <div className="mt-1 text-[8px] uppercase tracking-wider text-white/30">tasks</div>
                </div>
                <div className="rounded-2xl bg-white/5 p-3">
                  <div className="text-xs font-bold text-white">04</div>
                  <div className="mt-1 text-[8px] uppercase tracking-wider text-white/30">files</div>
                </div>
                <div className="rounded-2xl bg-white/5 p-3">
                  <div className="text-xs font-bold text-white">12</div>
                  <div className="mt-1 text-[8px] uppercase tracking-wider text-white/30">msgs</div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-2 left-3 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-[10px] text-white/70 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Everything is in sync
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-7 right-1 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-[10px] text-white/70 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-sky-300" />
              Privacy by design
            </div>
          </motion.div>
        </div>

        <motion.div
          animate={{ opacity: activeInput === 'password' ? 1 : 0.55, y: activeInput === 'password' ? 0 : 5 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-xl"
        >
          <div className="text-sm font-semibold text-white">
            {activeInput === 'password' ? 'Password field active' : 'Ready when you are'}
          </div>
          <div className="mt-1 text-[11px] text-white/40">
            {activeInput === 'password' ? 'Your private space stays private.' : 'A calmer way to run the day-to-day.'}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

/* =========================================================
   MAIN PAGE
   ========================================================= */

const ConsultancyOSRedesign = () => {
  const [loginType, setLoginType] = useState('student');
  const [activeInput, setActiveInput] = useState(null);
  const [passVisible, setPassVisible] = useState(false);
  const [theme, setTheme] = useState('blue');

  const { scrollYProgress } = useScroll();
  const progressScale = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const heroY = useTransform(scrollYProgress, [0, 0.28], [0, -110]);
  const heroScale = useTransform(scrollYProgress, [0, 0.28], [1, 0.94]);
  const glowY = useTransform(scrollYProgress, [0, 1], ['0%', '75%']);

  const themeAccent =
    theme === 'violet'
      ? '#7C3AED'
      : theme === 'cyan'
        ? '#0891B2'
        : '#2563EB';

  return (
    <div
      className={cn(
        'min-h-screen overflow-x-hidden bg-[#F7F8FC] font-sans text-slate-900 selection:bg-slate-950 selection:text-white',
        theme === 'violet' && 'selection:bg-violet-950',
        theme === 'cyan' && 'selection:bg-cyan-950',
      )}
      style={{ '--accent': themeAccent }}
    >
      <InteractiveParticleNetwork />

      {/* Scroll progress */}
      <motion.div
        style={{ scaleX: progressScale }}
        className="fixed left-0 right-0 top-0 z-[70] h-1 origin-left bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400"
      />

      {/* Ambient color wash */}
      <motion.div
        style={{ y: glowY }}
        className="pointer-events-none fixed -left-32 top-32 z-0 h-80 w-80 rounded-full bg-blue-500/10 blur-[100px]"
      />
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none fixed right-0 top-1/3 z-0 h-72 w-72 rounded-full bg-violet-500/10 blur-[110px]"
      />

      {/* NAV */}
      <nav className="fixed top-4 left-1/2 z-[60] w-[calc(100%-24px)] max-w-6xl -translate-x-1/2">
        <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/75 px-4 py-3 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
          <a href="#" className="flex items-center gap-2.5">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.05 }}
              className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-white shadow-lg"
            >
              <span className="text-sm font-bold">C</span>
            </motion.div>
            <span className="text-base font-bold tracking-tight text-slate-950">
              Consultancy<span className="text-blue-700">OS</span>
            </span>
          </a>

          <div className="hidden items-center gap-6 md:flex">
            {[
              ['Features', '#features'],
              ['Solutions', '#features'],
              ['Resources', '#features'],
              ['Pricing', '#login'],
              ['About', '#promise'],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="text-xs font-semibold text-slate-500 transition hover:text-slate-950"
              >
                {label}
              </a>
            ))}

            <div className="mx-1 h-5 w-px bg-slate-200" />

            <div className="flex items-center gap-1.5">
              {[
                ['blue', '#2563EB'],
                ['violet', '#7C3AED'],
                ['cyan', '#0891B2'],
              ].map(([name, color]) => (
                <button
                  key={name}
                  aria-label={`Switch to ${name} palette`}
                  onClick={() => setTheme(name)}
                  className={cn(
                    'h-5 w-5 rounded-full border-2 transition',
                    theme === name ? 'scale-110 border-slate-950' : 'border-white',
                  )}
                  style={{ background: color }}
                />
              ))}
            </div>

            <MagneticButton variant="primary" className="rounded-xl px-4 py-2.5 text-xs">
              Book a demo
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </MagneticButton>
          </div>

          <a
            href="#login"
            className="rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white md:hidden"
          >
            Sign in
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 min-h-[92vh] px-6 pb-20 pt-40 md:pt-48">
        <motion.div
          style={{ y: heroY, scale: heroScale }}
          className="mx-auto max-w-6xl text-center"
        >
          <Reveal>
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600 shadow-sm backdrop-blur-xl">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
              </span>
              A calmer consultancy operating system
            </div>
          </Reveal>

          <BlurReveal delay={0.08}>
            <h1 className="mx-auto mt-7 max-w-5xl text-5xl font-semibold leading-[0.97] tracking-[-0.06em] text-slate-950 md:text-8xl">
              Run the work.
              <br />
              <span className="bg-gradient-to-r from-blue-700 via-violet-600 to-cyan-500 bg-clip-text text-transparent">
                Keep the human part.
              </span>
            </h1>
          </BlurReveal>

          <Reveal delay={0.16}>
            <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
              Keep student cases, documents, and communication organized—so you can focus on what matters most:
              people and possibilities.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <MagneticButton>
                Book a demo
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </MagneticButton>
              <MagneticButton variant="light">
                See the platform
                <MousePointer2 className="h-4 w-4" />
              </MagneticButton>
            </div>
          </Reveal>

          <HeroOrbit />
        </motion.div>
      </section>

      {/* TRUST ROW */}
      <section className="relative z-10 border-y border-slate-200/80 bg-white/55 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-5 px-6 py-6 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 md:justify-between">
          {[
            ['Secure by design', Shield],
            ['Built for experts', Users],
            ['Clear communication', MessageCircle],
            ['Global-ready', Globe],
          ].map(([label, Icon]) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className="h-3.5 w-3.5 text-slate-500" />
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative z-10 px-6 py-28 md:py-36">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="A better operating layer"
            title="Premium on the surface. Powerful underneath."
            body="ConsultancyOS helps you stay organized, respond faster, and guide every student journey with confidence and care."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {featureData.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* PREMIUM CONTENT SECTION */}
      <section id="platform" className="relative z-10 px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Our promise"
            title="Built for consultancies that care about student experience."
            body="ConsultancyOS helps you stay organized, respond faster, and guide every student journey with confidence and care."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: Shield,
                title: "Stay secure",
                desc: "Protect data, maintain compliance, and build trust.",
                glow: "blue",
              },
              {
                icon: Users,
                title: "Built for education experts",
                desc: "Centralize student cases and documents.",
                glow: "violet",
              },
              {
                icon: Heart,
                title: "Student experience first",
                desc: "Guide every student journey with confidence and care.",
                glow: "cyan",
              },
            ].map((item, index) => (
              <Reveal key={item.title} delay={index * 0.1}>
                <SpotlightCard glow={item.glow} className="h-full min-h-[255px]">
                  <div className="flex h-full flex-col items-center justify-center p-7 text-center">
                    <motion.div
                      whileHover={{ rotate: 8, scale: 1.08 }}
                      className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg"
                    >
                      <item.icon className="h-6 w-6" />
                    </motion.div>
                    <h3 className="mt-6 text-xl font-semibold tracking-[-0.03em] text-slate-950">
                      {item.title}
                    </h3>
                    <p className="mt-3 max-w-xs text-sm leading-6 text-slate-500">{item.desc}</p>
                  </div>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PROMISE / STORY */}
      <section className="relative z-10 px-6 py-28 md:py-36">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeading
              eyebrow="Designed for trust"
              title="Built for consultancies that care about student experience."
              body="Use depth, subtle gradients and tactile interactions to make complex work feel more human—not more complicated."
            />

            <div className="mt-8 space-y-3">
              {[
                ['Clear by default', 'Important actions stay visible without competing for attention.'],
                ['Fast to understand', 'Visual hierarchy does the explaining before the copy does.'],
                ['Feels alive', 'Motion responds to focus, scroll and intention instead of decorating every pixel.'],
              ].map(([title, copy], index) => (
                <Reveal key={title} delay={index * 0.08}>
                  <div className="group rounded-2xl border border-slate-200/80 bg-white/75 p-4 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-lg">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-950 text-white">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-950">{title}</div>
                        <div className="mt-1 text-xs leading-5 text-slate-500">{copy}</div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={0.1}>
              <SpotlightCard glow="violet" className="min-h-[430px]">
                <div className="relative flex h-full min-h-[430px] flex-col justify-between overflow-hidden p-7 md:p-9">
                  <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
                  <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

                  <div>
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                        Student experience
                      </div>
                      <Sparkles className="h-4 w-4 text-violet-500" />
                    </div>
                    <div className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-slate-950">
                      Guiding dreams.
                    </div>
                    <div className="text-3xl font-semibold tracking-[-0.045em] text-slate-950">
                      Building futures.
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      [Users, "Students"],
                      [MessageCircle, "Communication"],
                      [Shield, "Confidence"],
                    ].map(([Icon, label], index) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15 + index * 0.08 }}
                        whileHover={{ y: -6, scale: 1.02 }}
                        className="rounded-2xl border border-slate-200 bg-white/75 p-4 shadow-sm backdrop-blur-xl"
                      >
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="mt-3 text-xs font-semibold text-slate-800">{label}</div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white/75 p-4 text-center text-sm font-medium text-slate-700 backdrop-blur-xl">
                    Built for consultancies that care.
                  </div>
                </div>
              </SpotlightCard>
            </Reveal>
        </div>
      </section>

      {/* LOGIN */}
      <section id="login" className="relative z-10 px-6 pb-28 pt-8 md:pb-36">
        <div className="mx-auto max-w-6xl rounded-[32px] bg-gradient-to-br from-blue-700 via-slate-950 to-violet-800 p-[1px] shadow-[0_30px_100px_rgba(37,99,235,0.18)]">
          <div className="grid overflow-hidden rounded-[31px] bg-slate-950/95 md:grid-cols-2">
            <div className="bg-white p-7 md:p-12">
              <div className="max-w-md">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  <Lock className="h-3.5 w-3.5" />
                  Secure access
                </div>
                <h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-slate-950">
                  Welcome back.
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Your consultancy workspace is ready when you are.
                </p>

                <div className="relative mt-8 flex rounded-2xl bg-slate-100 p-1">
                  <motion.div
                    animate={{ x: loginType === 'student' ? 0 : '100%' }}
                    transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                    className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-xl bg-white shadow-sm"
                  />
                  {[
                    ['student', 'Student'],
                    ['staff', 'Staff'],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => setLoginType(value)}
                      className={cn(
                        'relative z-10 flex-1 rounded-xl py-2.5 text-sm font-semibold transition',
                        loginType === value ? 'text-slate-950' : 'text-slate-400',
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <form
                  className="mt-7 space-y-4"
                  onSubmit={(e) => e.preventDefault()}
                >
                  {loginType === 'student' ? (
                    <>
                      <motion.div
                        key="student-fields"
                        initial={{ opacity: 0, x: -14 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 14 }}
                        className="space-y-4"
                      >
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            placeholder="Full Name"
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-11 py-3.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                            onFocus={() => setActiveInput('name')}
                          />
                        </div>

                        <div className="relative">
                          <Users className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="tel"
                            placeholder="Phone Number"
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-11 py-3.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                            onFocus={() => setActiveInput('email')}
                          />
                        </div>
                      </motion.div>
                    </>
                  ) : (
                    <motion.div
                      key="staff-fields"
                      initial={{ opacity: 0, x: -14 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <div className="relative">
                        <Briefcase className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          placeholder="Staff ID"
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-11 py-3.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                          onFocus={() => setActiveInput('email')}
                        />
                      </div>
                    </motion.div>
                  )}

                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type={passVisible ? 'text' : 'password'}
                      placeholder="Password"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-11 py-3.5 pr-12 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                      onFocus={() => setActiveInput('password')}
                      onBlur={() => setActiveInput(null)}
                    />
                    <button
                      type="button"
                      onClick={() => setPassVisible((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-900"
                    >
                      {passVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <MagneticButton className="mt-1 w-full rounded-2xl py-3.5">
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </MagneticButton>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Protected workspace</span>
                    <span className="inline-flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5" />
                      Privacy first
                    </span>
                  </div>
                </form>
              </div>
            </div>

            <LoginCharacterPanel activeInput={activeInput} />
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-slate-200/80 bg-white/55 px-6 py-10 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div>
            <div className="text-sm font-bold text-slate-950">ConsultancyOS</div>
            <div className="mt-1 text-xs text-slate-400">Built for calmer, clearer consultancy operations.</div>
          </div>
          <div className="text-xs text-slate-400">
            © {new Date().getFullYear()} ConsultancyOS · Premium interaction edition
          </div>
        </div>
      </footer>

      {/* Small scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="pointer-events-none fixed bottom-5 left-1/2 z-50 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500 shadow-lg backdrop-blur-xl md:flex"
      >
        <ChevronDown className="h-3 w-3 animate-bounce" />
        Scroll to explore
      </motion.div>
    </div>
  );
};

export default ConsultancyOSRedesign;