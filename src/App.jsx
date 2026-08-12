import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Shield, Users, Heart, FileText, MessageCircle, 
  Plane, ArrowRight, Eye, EyeOff, User, Briefcase, Lock, Globe
} from 'lucide-react';

// ==========================================
// --- NEW: INTERACTIVE PARTICLE NETWORK BACKGROUND ---
// ==========================================

const InteractiveParticleNetwork = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const requestRef = useRef();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const PARTICLE_COUNT = 120;
    const CONNECTION_DIST = 150;
    const MOUSE_INFLUENCE = 100;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2.5 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Soft wrap around edges
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Mouse interaction (Push particles away)
        const dx = this.x - mouseRef.current.x;
        const dy = this.y - mouseRef.current.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < MOUSE_INFLUENCE && dist > 0) {
          const force = (MOUSE_INFLUENCE - dist) / MOUSE_INFLUENCE;
          this.x += (dx / dist) * force * 3;
          this.y += (dy / dist) * force * 3;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(30, 58, 138, 0.4)'; // Blue-900
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      if (!isMountedRef.current) return;
      ctx.clearRect(0, 0, width, height);
      
      // Update and draw particles
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);

          if (dist < CONNECTION_DIST) {
            // Base opacity on distance
            const opacity = (1 - dist / CONNECTION_DIST) * 0.5;
            
            // Check if mouse is near the midpoint of this line to make it glow
            const midX = (particles[i].x + particles[j].x) / 2;
            const midY = (particles[i].y + particles[j].y) / 2;
            const mDx = midX - mouseRef.current.x;
            const mDy = midY - mouseRef.current.y;
            const mDist = Math.sqrt(mDx*mDx + mDy*mDy);
            
            let lineColor = `rgba(30, 58, 138, ${opacity})`; // Default Blue
            let lineWidth = 0.8;

            // If mouse is hovering near the connection, amp it up (Glow effect)
            if (mDist < 80) {
              lineColor = `rgba(245, 158, 11, ${Math.min(1, opacity * 2.5)})`; // Amber glow
              lineWidth = 2.5;
            }

            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
          }
        }
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    resize();
    init();
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 pointer-events-none" />;
};

// ==========================================
// --- REUSABLE 3D TILT COMPONENT ---
// ==========================================

const TiltCard = ({ children, className, tiltAmount = 10 }) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRotateY(((x / rect.width) - 0.5) * tiltAmount);
    setRotateX(((y / rect.height) - 0.5) * -tiltAmount);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
      animate={{ rotateX, rotateY }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      whileHover={{ scale: 1.02 }}
    >
      {children}
    </motion.div>
  );
};

// --- Reusable Animation Components ---
const FadeInUp = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay, ease: [0.25, 0.8, 0.5, 1] }}
  >
    {children}
  </motion.div>
);

const ScaleIn = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

// --- Typing Animation ---
const Typewriter = ({ words, delay = 2000 }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  useEffect(() => {
    let timer;
    const currentFullWord = words[currentWordIndex];
    if (!isDeleting && currentText !== currentFullWord) {
      timer = setTimeout(() => setCurrentText(currentFullWord.substring(0, currentText.length + 1)), 100);
    } else if (isDeleting && currentText !== '') {
      timer = setTimeout(() => setCurrentText(currentFullWord.substring(0, currentText.length - 1)), 50);
    } else if (!isDeleting && currentText === currentFullWord) {
      timer = setTimeout(() => setIsDeleting(true), delay);
    } else if (isDeleting && currentText === '') {
      setIsDeleting(false);
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex, words, delay]);
  return <span className="text-blue-900 relative inline-block min-w-[120px]">{currentText}<span className="absolute right-[-2px] top-0 w-0.5 h-full bg-blue-900 animate-pulse"></span></span>;
};

// --- Googly Eye Computer ---
const GooglyEyeComputer = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const eyeRef = useRef(null);
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (eyeRef.current) {
        const rect = eyeRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        const angle = Math.atan2(deltaY, deltaX);
        const distance = Math.min(8, Math.sqrt(deltaX*deltaX + deltaY*deltaY) / 15);
        setMousePos({ x: Math.cos(angle) * distance, y: Math.sin(angle) * distance });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  return (
    <motion.div 
      ref={eyeRef} 
      className="relative w-48 h-40 bg-[#e0e5ec] rounded-2xl shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.7)] flex items-center justify-center gap-4 mx-auto"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-transparent rounded-2xl pointer-events-none"></div>
      <div className="relative w-12 h-12 bg-white rounded-full shadow-inner border-2 border-slate-300 flex items-center justify-center">
        <motion.div className="w-6 h-6 bg-slate-900 rounded-full" animate={{ x: mousePos.x, y: mousePos.y }} transition={{ type: "spring", stiffness: 150, damping: 10 }} />
      </div>
      <div className="relative w-12 h-12 bg-white rounded-full shadow-inner border-2 border-slate-300 flex items-center justify-center">
        <motion.div className="w-6 h-6 bg-slate-900 rounded-full" animate={{ x: mousePos.x, y: mousePos.y }} transition={{ type: "spring", stiffness: 150, damping: 10 }} />
      </div>
      <div className="absolute -bottom-2 flex gap-1"><div className="w-2 h-1 bg-slate-400 rounded-full"></div><div className="w-4 h-1 bg-slate-400 rounded-full"></div><div className="w-2 h-1 bg-slate-400 rounded-full"></div></div>
    </motion.div>
  );
};

// --- Doodle Characters ---
const DoodleCharacter = ({ type, mousePos, isCovering }) => {
  const deltaX = mousePos.x - window.innerWidth / 2;
  const deltaY = mousePos.y - window.innerHeight / 2;
  const maxPupilMove = 3.5; 
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const limitedDist = Math.min(maxPupilMove, distance / 15);
  const angle = Math.atan2(deltaY, deltaX);
  const moveX = Math.cos(angle) * limitedDist;
  const moveY = Math.sin(angle) * limitedDist;
  return (
    <div className="relative w-36 h-44">
      <svg viewBox="0 0 160 200" className="w-full h-full drop-shadow-md">
        {type === 'boy' && (
          <g>
            <path d="M80 140 L55 200 L105 200 Z" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M60 170 L80 185 L100 170" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round"/>
            <path d="M50 70 Q80 40 110 70 L110 55 Q80 35 50 55 Z" fill="none" stroke="#1e293b" strokeWidth="3"/>
            <path d="M50 70 L45 75 L50 80" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round"/>
            <path d="M110 70 L115 75 L110 80" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="80" cy="85" r="35" fill="#FAF8F4" stroke="#1e293b" strokeWidth="3"/>
            <circle cx="65" cy="85" r="7" fill="white" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="95" cy="85" r="7" fill="white" stroke="#1e293b" strokeWidth="2"/>
            <motion.circle cx="65" cy="85" r="4" fill="#1e293b" animate={{ cx: 65 + moveX, cy: 85 + moveY }} transition={{ type: "spring", stiffness: 150, damping: 12 }}/>
            <motion.circle cx="95" cy="85" r="4" fill="#1e293b" animate={{ cx: 95 + moveX, cy: 85 + moveY }} transition={{ type: "spring", stiffness: 150, damping: 12 }}/>
            <path d="M70 98 Q80 105 90 98" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/>
            <motion.g initial={{ scale: 0, opacity: 0 }} animate={{ scale: isCovering ? 1 : 0, opacity: isCovering ? 1 : 0 }} transition={{ type: "spring", stiffness: 250, damping: 20 }}>
              <path d="M60 75 C50 65 55 55 65 65 C70 55 85 55 85 65 C95 55 100 65 90 75 L95 95 L55 95 Z" fill="#FAF8F4" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M55 80 L75 80" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/>
              <path d="M65 75 L70 85" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/>
              <path d="M80 75 L75 85" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/>
            </motion.g>
          </g>
        )}
        {type === 'girl' && (
          <g>
            <path d="M80 140 L55 200 L105 200 Z" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M60 170 L80 185 L100 170" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round"/>
            <path d="M50 70 Q45 85 50 110 Q55 120 55 130" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round"/>
            <path d="M110 70 Q115 85 110 110 Q105 120 105 130" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round"/>
            <path d="M45 65 Q80 35 115 65 L115 50 Q80 25 45 50 Z" fill="none" stroke="#1e293b" strokeWidth="3"/>
            <path d="M50 70 L45 75 L50 80" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round"/>
            <path d="M110 70 L115 75 L110 80" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="80" cy="85" r="35" fill="#FAF8F4" stroke="#1e293b" strokeWidth="3"/>
            <circle cx="65" cy="85" r="7" fill="white" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="95" cy="85" r="7" fill="white" stroke="#1e293b" strokeWidth="2"/>
            <motion.circle cx="65" cy="85" r="4" fill="#1e293b" animate={{ cx: 65 + moveX, cy: 85 + moveY }} transition={{ type: "spring", stiffness: 150, damping: 12 }}/>
            <motion.circle cx="95" cy="85" r="4" fill="#1e293b" animate={{ cx: 95 + moveX, cy: 85 + moveY }} transition={{ type: "spring", stiffness: 150, damping: 12 }}/>
            <path d="M72 98 Q80 103 88 98" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/>
            <motion.g initial={{ scale: 0, opacity: 0 }} animate={{ scale: isCovering ? 1 : 0, opacity: isCovering ? 1 : 0 }} transition={{ type: "spring", stiffness: 250, damping: 20 }}>
              <path d="M60 75 C50 65 55 55 65 65 C70 55 85 55 85 65 C95 55 100 65 90 75 L95 95 L55 95 Z" fill="#FAF8F4" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M55 80 L75 80" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/>
              <path d="M65 75 L70 85" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/>
              <path d="M80 75 L75 85" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/>
            </motion.g>
          </g>
        )}
      </svg>
    </div>
  );
};

// --- Interactive Login Area ---
const InteractiveLoginArea = ({ activeInput }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleGlobalMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);
  const isPasswordActive = activeInput === 'password';
  return (
    <div className="hidden md:flex flex-col items-center justify-center bg-blue-900/40 backdrop-blur-sm border-l border-white/20 rounded-r-3xl relative overflow-hidden p-8 min-h-[500px]">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-800/50 to-transparent pointer-events-none"></div>
      <div className="mb-6 z-10 text-center">
         <h3 className="text-white text-xl font-bold drop-shadow-md">We respect your privacy</h3>
         <p className="text-blue-100 text-xs opacity-80">Our doodles follow your cursor!</p>
      </div>
      <div className="relative flex items-center justify-center w-full h-full">
        <div className="absolute left-4 transform -translate-x-4"><DoodleCharacter type="boy" mousePos={mousePos} isCovering={isPasswordActive} /></div>
        <div className="absolute right-4 transform translate-x-4"><DoodleCharacter type="girl" mousePos={mousePos} isCovering={isPasswordActive} /></div>
        <motion.div initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: isPasswordActive ? 1 : 0, scale: isPasswordActive ? 1 : 0.8, y: isPasswordActive ? 0 : 20 }} transition={{ duration: 0.3 }} className="absolute top-0 bg-white/20 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 shadow-lg text-white flex flex-col items-center z-20">
          <span className="text-2xl font-bold tracking-widest drop-shadow-md">Shh...</span>
          <span className="text-[10px] text-blue-100 mt-1">typing password</span>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white/20 backdrop-blur-md rotate-45 border-b border-r border-white/10"></div>
        </motion.div>
      </div>
    </div>
  );
};

// ==========================================
// --- 3D VOLUMETRIC BANK CARD DESIGN ---
// ==========================================
const CARD_VIDEOS = [
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_030111_a9e15665-d379-4a7f-8116-695bbe452ad1.mp4',
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_171347_f640c30d-ec21-426a-98bc-77e07c2c60cb.mp4',
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260503_104800_bc43ae09-f494-43e3-97d7-2f8c1692cfd7.mp4',
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_161253_c72b1869-400f-45ed-ac0c-52f68c2ed5bd.mp4',
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_115655_b4d9cd77-feed-43cd-a198-af78ebdf1f7a.mp4',
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_024928_1efd0b0d-6c02-45a8-8847-1030900c4f63.mp4',
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_024928_1efd0b0d-6c02-45a8-8847-1030900c4f63.mp4'
];

const thicknessLayers = [-1.47, -0.73, 0, 0.73, 1.47];

const ThreeDFeatureCard = ({ icon: Icon, title, desc, videoSrc, index }) => {
  return (
    <TiltCard className="relative w-full aspect-[1.5925] rounded-[16px]" tiltAmount={8}>
      {thicknessLayers.map((zOffset, idx) => {
        const isFront = idx === thicknessLayers.length - 1;
        const isBack = idx === 0;
        const isMiddle = !isFront && !isBack;

        if (isMiddle) {
          return (
            <div key={idx} className="absolute inset-0 rounded-[16px] border border-[#808080] pointer-events-none overflow-hidden" style={{ backgroundColor: '#808080', transform: `translateZ(${zOffset}px)` }} />
          );
        }

        if (isFront) {
          return (
            <div key={idx} className={`absolute inset-0 rounded-[16px] border border-white/15 pointer-events-none overflow-hidden`} style={{ backgroundColor: '#0f0f0f', transform: `translateZ(${zOffset}px)`, backfaceVisibility: 'hidden', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.15)' }}>
              <video src={videoSrc} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover rounded-[16px]" />
              
              {/* FRONT FACE CONTENT */}
              <div className="absolute inset-0 p-5 sm:p-6 text-white z-10 bg-black/15 flex flex-col justify-between">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-shrink-0 pt-1">
                    <svg className="w-6 h-6 sm:w-[29px] sm:h-[29px]" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M20 8H40V14C40.0016 14.5299 40.2128 15.0377 40.5875 15.4125C40.9623 15.7872 41.4701 15.9984 42 16H59V24H42C41.4701 24.0016 40.9623 24.2128 40.5875 24.5875C40.2128 24.9623 40.0016 25.4701 40 26V52H20V8ZM18 8H8.00039C4.47435 8 1.56576 10.6083 1.08 14H18V8ZM1 16V24V26V34V36V44H18V36H1V34H18V26H1V24H18V16H1ZM1.08 46C1.56576 49.3917 4.47435 52 8.00039 52H18V46H1.08ZM42 14V8H52.0004C55.5264 8 58.4342 10.6084 58.92 14H42ZM59 26H42V34H59V26ZM59 36H42V44H59V36ZM52.0004 52H42V46H58.92C58.4342 49.3916 55.5264 52 52.0004 52Z" fill={`url(#paint0_linear_${index}_${idx})`} />
                      <path fillRule="evenodd" clipRule="evenodd" d="M1.02453 14.4146C1.00608 14.609 0.998061 14.8045 1.00039 15C1.00039 14.8028 1.00854 14.6076 1.02453 14.4146ZM1.00039 45C0.998061 45.1955 1.00608 45.391 1.02453 45.5854C1.00854 45.3924 1.00039 45.1972 1.00039 45ZM59.0004 15C59.0026 14.8176 58.9955 14.6353 58.9794 14.4538C58.9933 14.634 59.0004 14.8162 59.0004 15ZM59.0004 45C59.0004 45.1838 58.9933 45.366 58.9794 45.5462C58.9955 45.3647 59.0026 45.1824 59.0004 45Z" fill="#B7B7B7" />
                      <defs><linearGradient id={`paint0_linear_${index}_${idx}`} x1="30" y1="8" x2="30" y2="52" gradientUnits="userSpaceOnUse"><stop stopColor="white" /><stop offset="1" stopColor="#999999" /></linearGradient></defs>
                    </svg>
                  </div>
                  <h3 className="text-right text-lg sm:text-xl font-bold tracking-tight drop-shadow-md leading-tight max-w-[60%]">{title}</h3>
                </div>
                <div className="flex justify-between items-end gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 drop-shadow-md max-w-[70%]">
                    <div className="bg-white/10 backdrop-blur-sm p-2 rounded-full border border-white/10 flex-shrink-0">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <p className="text-[10px] sm:text-sm text-white/90 leading-snug">{desc}</p>
                  </div>
                  <div className="flex-shrink-0 flex -space-x-3 items-center opacity-90">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 backdrop-blur-[1px] border border-white/10" />
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/35 backdrop-blur-[1px] border border-white/10" />
                  </div>
                </div>
              </div>
            </div>
          );
        }

        if (isBack) {
          return (
            <div key={idx} className={`absolute inset-0 rounded-[16px] border border-white/15 pointer-events-none overflow-hidden`} style={{ backgroundColor: '#0f0f0f', transform: `translateZ(${zOffset}px) rotateX(180deg)`, backfaceVisibility: 'hidden', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.15)' }}>
              <div className="absolute inset-0 pointer-events-none" style={{ filter: 'blur(16px)', transform: 'scale(1.15)' }}>
                <video src={videoSrc} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
              </div>
              <div className="absolute left-0 right-0 top-4 sm:top-5 h-7 sm:h-9 bg-black/85 backdrop-blur-md z-10" />
              <div className="absolute left-4 sm:left-6 bottom-4 sm:bottom-5 z-20 flex flex-col gap-0.5 text-left">
                <div className="font-mono text-[10px] sm:text-[12px] font-medium tracking-[0.14em] text-white/60 select-none uppercase">ConsultancyOS</div>
                <div className="font-mono text-[7px] sm:text-[9px] font-medium text-white/40 tracking-wide flex items-center gap-2 select-none"><span>SECURE & RELIABLE</span></div>
              </div>
            </div>
          );
        }
        return null;
      })}
    </TiltCard>
  );
};

// --- Main Component ---
const ConsultancyOSRedesign = () => {
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 0.3], [0, -50]);

  const [loginType, setLoginType] = useState('student');
  const [activeInput, setActiveInput] = useState(null);
  const [passVisible, setPassVisible] = useState(false);

  const features = [
    { icon: Users, title: "Stay organized", desc: "Centralize student cases and documents so nothing falls through the cracks." },
    { icon: MessageCircle, title: "Communicate with ease", desc: "Keep every conversation in one place and respond faster." },
    { icon: Shield, title: "Work with confidence", desc: "Protect data, maintain compliance, and build trust." }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-slate-800 font-sans overflow-x-hidden selection:bg-blue-900 selection:text-white relative">
      
      {/* --- NEW INTERACTIVE PARTICLE NETWORK --- */}
      <InteractiveParticleNetwork />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 bg-[#FAF8F4]/80 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg"><span className="text-white font-bold text-lg">C</span></div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Consultancy<span className="text-blue-900">OS</span></span>
          </div>
          <div className="hidden md:flex gap-8 items-center text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-blue-900 transition-colors">Features</a>
            <a href="#" className="hover:text-blue-900 transition-colors">Solutions</a>
            <a href="#" className="hover:text-blue-900 transition-colors">Pricing</a>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 bg-blue-900 text-white rounded-full shadow-lg shadow-blue-900/30 hover:shadow-xl hover:scale-105 transition-all duration-300 font-medium"
            >
              Book a demo
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-32 md:pb-32 px-6 overflow-hidden min-h-[80vh] flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center z-10 space-y-8">
          <FadeInUp delay={0.1}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-sm border border-amber-200 text-xs font-semibold text-amber-700 shadow-sm mx-auto"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>ALL-IN-ONE PLATFORM</div>
          </FadeInUp>
          <FadeInUp delay={0.2}>
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight text-slate-900 drop-shadow-lg">Run your <br />consultancy <br />with <Typewriter words={["clarity.", "confidence.", "success."]} delay={3000} /></h1>
          </FadeInUp>
          <FadeInUp delay={0.3}>
            <p className="text-lg text-slate-600 max-w-lg mx-auto leading-relaxed drop-shadow-md">Keep student cases, documents, and communication organized—so you can focus on what matters most: people and possibilities.</p>
          </FadeInUp>
          <FadeInUp delay={0.4}>
            <div className="flex flex-wrap gap-4 justify-center">
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-blue-900 text-white rounded-2xl shadow-2xl shadow-blue-900/40 hover:shadow-blue-900/60 transition-all duration-300 flex items-center gap-2 font-medium group"
              >
                Book a demo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 font-medium"
              >
                Explore features
              </motion.button>
            </div>
          </FadeInUp>
          <FadeInUp delay={0.5}><div className="pt-8"><GooglyEyeComputer /></div></FadeInUp>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-[10vh] w-full" aria-hidden="true"></div>

      {/* Floating Icons */}
      <div className="max-w-7xl mx-auto -mt-10 mb-20 grid grid-cols-1 md:grid-cols-3 gap-8 px-6 relative z-10">
        {[
          { icon: Shield, text: "Secure & reliable" },
          { icon: Users, text: "Built for education experts" },
          { icon: Heart, text: "Student experience first" }
        ].map((item, index) => (
          <motion.div 
            key={index} 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 + index * 0.1 }}
            whileHover={{ y: -5, boxShadow: "0px 10px 30px rgba(0,0,0,0.05)" }}
            className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-white/60 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 border border-white/80"
          >
            <div className="w-14 h-14 rounded-full bg-blue-50 shadow-md flex items-center justify-center text-blue-900"><item.icon className="w-6 h-6" /></div>
            <span className="text-sm font-medium text-slate-700">{item.text}</span>
          </motion.div>
        ))}
      </div>

      {/* Promise Section */}
      <section className="py-24 px-6 bg-white/80 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <FadeInUp>
              <div className="space-y-6">
                <div className="inline-block px-4 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-800 text-xs font-bold tracking-wide uppercase">Our Promise</div>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">Built for consultancies that care about <span className="text-blue-900">student experience.</span></h2>
                <p className="text-slate-600 text-lg leading-relaxed">ConsultancyOS helps you stay organized, respond faster, and guide every student journey with confidence and care.</p>
              </div>
            </FadeInUp>
            <ScaleIn>
              <TiltCard className="relative bg-[#FAF8F4] rounded-3xl p-8 shadow-2xl shadow-slate-200/50 border border-white/60 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
                <div className="relative z-10 flex flex-col gap-6">
                  <div className="rounded-2xl overflow-hidden shadow-lg h-64 relative">
                    <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600" alt="Students studying" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-6"><h3 className="text-white font-semibold text-xl drop-shadow-md">Guiding dreams.</h3></div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl border border-white shadow-sm text-center"><p className="text-slate-700 font-medium text-sm">Building futures, one student at a time.</p></div>
                </div>
              </TiltCard>
            </ScaleIn>
          </div>
        </div>
      </section>

      {/* --- 3D Volumetric Feature Cards --- */}
      <section className="py-24 px-6 bg-[#FAF8F4]/70 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <FadeInUp key={index} delay={index * 0.1}>
                <div className="w-full h-full">
                  <ThreeDFeatureCard
                    icon={feature.icon}
                    title={feature.title}
                    desc={feature.desc}
                    videoSrc={CARD_VIDEOS[index % CARD_VIDEOS.length]}
                    index={index}
                  />
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* Login Section */}
      <section className="relative py-28 px-6 overflow-hidden z-10" id="login">
        <div className="absolute inset-0 bg-blue-900">
           <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-blue-800 rounded-full blur-3xl opacity-50"></div>
           <div className="absolute bottom-[-100px] left-[-100px] w-80 h-80 bg-blue-700 rounded-full blur-3xl opacity-40"></div>
        </div>
        <div className="max-w-6xl mx-auto relative z-10 bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20 p-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 h-auto md:h-[550px]">
            <div className="p-8 md:p-12 flex flex-col justify-center bg-white/90 backdrop-blur-sm rounded-l-3xl md:rounded-r-none rounded-3xl shadow-inner">
              <div className="mb-6"><h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2><p className="text-slate-500 text-sm mt-1">Sign in to manage your consultancy.</p></div>
              <div className="flex bg-slate-100 p-1 rounded-full mb-8 shadow-inner relative w-full max-w-xs mx-auto md:mx-0">
                 <motion.div className="absolute top-1 bottom-1 bg-white rounded-full shadow-md w-[calc(50%-4px)]" animate={{ x: loginType === 'student' ? 0 : '100%' }} transition={{ type: "spring", stiffness: 300, damping: 25 }}/>
                 <button onClick={() => setLoginType('student')} className={`flex-1 py-2 text-sm font-medium rounded-full relative z-10 transition-colors ${loginType === 'student' ? 'text-blue-900' : 'text-slate-500'}`}>Student</button>
                 <button onClick={() => setLoginType('staff')} className={`flex-1 py-2 text-sm font-medium rounded-full relative z-10 transition-colors ${loginType === 'staff' ? 'text-blue-900' : 'text-slate-500'}`}>Staff</button>
              </div>
              <form className="space-y-4 w-full max-w-sm mx-auto md:mx-0" onSubmit={(e) => e.preventDefault()}>
                {loginType === 'student' && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    <div className="relative"><User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" /><input type="text" placeholder="Full Name" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-slate-50/50" onFocus={() => setActiveInput(null)}/></div>
                    <div className="relative mt-4"><Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" /><input type="tel" placeholder="Phone Number" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-slate-50/50" onFocus={() => setActiveInput('email')}/></div>
                  </motion.div>
                )}
                {loginType === 'staff' && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    <div className="relative"><Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" /><input type="text" placeholder="Staff ID" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-slate-50/50" onFocus={() => setActiveInput('email')}/></div>
                  </motion.div>
                )}
                <div className="relative mt-4"><Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" /><input type={passVisible ? "text" : "password"} placeholder="Password" className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-slate-50/50" onFocus={() => setActiveInput('password')} onBlur={() => setActiveInput(null)}/><button type="button" onClick={() => setPassVisible(!passVisible)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600">{passVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-3 bg-blue-900 text-white rounded-xl shadow-lg shadow-blue-900/30 hover:shadow-xl transition-all duration-300 font-medium mt-4">Sign In</motion.button>
              </form>
            </div>
            <InteractiveLoginArea activeInput={activeInput} />
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-slate-200 bg-[#FAF8F4] text-center px-6 relative z-10">
        <p className="text-slate-500 text-sm">&copy; {new Date().getFullYear()} ConsultancyOS. Interactive Doodle Edition.</p>
      </footer>
    </div>
  );
};

export default ConsultancyOSRedesign;