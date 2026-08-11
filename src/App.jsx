import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Shield, Users, Heart, FileText, MessageCircle, 
  Plane, ArrowRight, Eye, EyeOff, User, Briefcase, Lock, Globe
} from 'lucide-react';

// --- Scroll-Scrubbed Video Background (FIXED: Crash-proof) ---
const ScrollScrubbedVideoBackground = ({ videoSrc }) => {
  const canvasRef = useRef(null);
  const frameCache = useRef([]);
  const videoRef = useRef(null);
  const visibleVideoRef = useRef(null);
  
  const currentTimeRef = useRef(0);
  const targetTimeRef = useRef(0);
  const animationIdRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    
    let totalFrames = 90;
    let duration = 1;
    let isExtracting = false;
    let extractionComplete = false;

    const resizeCanvas = () => {
      if (!canvas || !ctx) return;
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
      if (extractionComplete) drawFrame(currentTimeRef.current);
    };

    // --- Object-Cover Math ---
    const drawFrame = (progress) => {
      if (!canvas || !ctx) return;
      try {
        const cw = canvas.width / dpr;
        const ch = canvas.height / dpr;
        // Standard safe fallback size if video dimensions unknown
        const vw = 1920, vh = 1080; 
        const scaleX = cw / vw;
        const scaleY = ch / vh;
        const scale = Math.max(scaleX, scaleY);
        const sw = vw * scale;
        const sh = vh * scale;
        const sx = (cw - sw) / 2;
        const sy = (ch - sh) / 2;

        ctx.clearRect(0, 0, cw, ch);

        // 1. Use Frame Cache
        if (extractionComplete && frameCache.current.length > 0) {
          const index = Math.floor(progress * (frameCache.current.length - 1));
          const bitmap = frameCache.current[index];
          if (bitmap) {
            ctx.drawImage(bitmap, sx, sy, sw, sh);
            return;
          }
        }

        // 2. Fallback: Seek video element
        if (videoRef.current && videoRef.current.readyState >= 2) {
          const targetSeek = Math.max(0, Math.min(progress * duration, duration - 0.05));
          if (Math.abs(videoRef.current.currentTime - targetSeek) > 0.04) {
            videoRef.current.currentTime = targetSeek;
          }
          try { ctx.drawImage(videoRef.current, sx, sy, sw, sh); } catch (e) {}
        }
      } catch (e) {
        // Fail silently so the app never crashes
      }
    };

    // --- Frame Extractor (Offscreen) ---
    const extractFrames = async () => {
      if (isExtracting || extractionComplete || !isMountedRef.current) return;
      isExtracting = true;

      const video = document.createElement('video');
      video.src = videoSrc;
      video.muted = true;
      video.crossOrigin = "anonymous";
      video.preload = "auto";
      
      try {
        await new Promise((resolve, reject) => {
          const onLoaded = () => resolve();
          const onError = () => reject(new Error("Video load failed"));
          video.addEventListener('loadeddata', onLoaded);
          video.addEventListener('error', onError);
          // Safety timeout if network is slow
          setTimeout(() => {
             if (video.readyState < 2) reject(new Error("Video load timeout"));
          }, 5000);
        });

        duration = video.duration || 1;
        // Calculate frames based on 12fps (capped)
        totalFrames = Math.min(90, Math.max(24, Math.floor(duration * 12)));

        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = 960; 
        offscreenCanvas.height = 540;
        const offCtx = offscreenCanvas.getContext('2d');

        const cache = [];
        for (let i = 0; i < totalFrames; i++) {
          if (!isMountedRef.current) break;
          const time = (i / (totalFrames - 1)) * duration;
          video.currentTime = time;
          
          // Wait for seek
          await new Promise(resolve => {
            const onSeek = () => { video.removeEventListener('seeked', onSeek); resolve(); };
            video.addEventListener('seeked', onSeek);
            // Safety timeout
            setTimeout(resolve, 500);
          });

          offCtx.drawImage(video, 0, 0, 960, 540);
          
          // Try to save as ImageBitmap (faster), fallback to Canvas
          try {
            const bitmap = await createImageBitmap(offscreenCanvas);
            cache.push(bitmap);
          } catch (e) {
            // Safe fallback if createImageBitmap fails
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = 960;
            tempCanvas.height = 540;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(offscreenCanvas, 0, 0);
            cache.push(tempCanvas);
          }
        }
        
        if (isMountedRef.current) {
          frameCache.current = cache;
          extractionComplete = true;
          drawFrame(currentTimeRef.current);
        }
      } catch (error) {
        console.warn("Video frame cache extraction failed. Falling back to direct video seek.", error);
      } finally {
        isExtracting = false;
      }
    };

    // --- Scroll Logic ---
    const onScroll = () => {
      if (!isMountedRef.current) return;
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const target = docHeight > 0 ? Math.max(0, Math.min(1, scrollTop / docHeight)) : 0;
      targetTimeRef.current = target;
    };

    const animate = () => {
      if (!isMountedRef.current || !canvasRef.current) {
        animationIdRef.current = requestAnimationFrame(animate);
        return;
      }
      // Smooth Lerp
      currentTimeRef.current += (targetTimeRef.current - currentTimeRef.current) * 0.12;
      drawFrame(currentTimeRef.current);
      animationIdRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', resizeCanvas);
    
    resizeCanvas();
    // Delay extraction so UI thread doesn't hang on load
    setTimeout(extractFrames, 400);

    animationIdRef.current = requestAnimationFrame(animate);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resizeCanvas);
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      
      // Cleanup ImageBitmaps
      frameCache.current.forEach(b => { 
        if (b && typeof b.close === 'function') b.close(); 
      });
    };
  }, [videoSrc]);

  return (
    <div className="fixed inset-0 w-full h-full z-0 pointer-events-none bg-[#0a0a0a] overflow-hidden">
      {/* Fallback visible video element if canvas hasn't loaded yet */}
      <video 
        ref={visibleVideoRef}
        src={videoSrc} 
        muted 
        playsInline 
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover opacity-0 pointer-events-none"
      />
      {/* The main Canvas Renderer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
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

const TiltCard = ({ children, className }) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRotateY((x / rect.width - 0.5) * 10);
    setRotateX((y / rect.height - 0.5) * -10);
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
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      whileHover={{ scale: 1.02 }}
    >
      {children}
    </motion.div>
  );
};

// --- Typing Animation ---
const Typewriter = ({ words, delay = 2000 }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer;
    const currentFullWord = words[currentWordIndex];
    
    if (!isDeleting && currentText !== currentFullWord) {
      timer = setTimeout(() => {
        setCurrentText(currentFullWord.substring(0, currentText.length + 1));
      }, 100);
    } else if (isDeleting && currentText !== '') {
      timer = setTimeout(() => {
        setCurrentText(currentFullWord.substring(0, currentText.length - 1));
      }, 50);
    } else if (!isDeleting && currentText === currentFullWord) {
      timer = setTimeout(() => setIsDeleting(true), delay);
    } else if (isDeleting && currentText === '') {
      setIsDeleting(false);
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex, words, delay]);

  return (
    <span className="text-blue-900 relative inline-block min-w-[120px]">
      {currentText}
      <span className="absolute right-[-2px] top-0 w-0.5 h-full bg-blue-900 animate-pulse"></span>
    </span>
  );
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

        setMousePos({ 
          x: Math.cos(angle) * distance, 
          y: Math.sin(angle) * distance 
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={eyeRef} className="relative w-48 h-40 bg-[#e0e5ec] rounded-2xl shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.7)] flex items-center justify-center gap-4 mx-auto transition-transform hover:scale-105 duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-transparent rounded-2xl pointer-events-none"></div>
      
      <div className="relative w-12 h-12 bg-white rounded-full shadow-inner border-2 border-slate-300 flex items-center justify-center">
        <motion.div 
          className="w-6 h-6 bg-slate-900 rounded-full"
          animate={{ x: mousePos.x, y: mousePos.y }}
          transition={{ type: "spring", stiffness: 150, damping: 10 }}
        />
      </div>

      <div className="relative w-12 h-12 bg-white rounded-full shadow-inner border-2 border-slate-300 flex items-center justify-center">
        <motion.div 
          className="w-6 h-6 bg-slate-900 rounded-full"
          animate={{ x: mousePos.x, y: mousePos.y }}
          transition={{ type: "spring", stiffness: 150, damping: 10 }}
        />
      </div>

      <div className="absolute -bottom-2 flex gap-1">
        <div className="w-2 h-1 bg-slate-400 rounded-full"></div>
        <div className="w-4 h-1 bg-slate-400 rounded-full"></div>
        <div className="w-2 h-1 bg-slate-400 rounded-full"></div>
      </div>
    </div>
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

// --- Main Component ---
const ConsultancyOSRedesign = () => {
  // *** Replace this URL with your own if you want a different video ***
  const VIDEO_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260729_102822_0e6c87e8-c141-4744-bf32-ad30db296371.mp4";

  const [loginType, setLoginType] = useState('student');
  const [activeInput, setActiveInput] = useState(null);
  const [passVisible, setPassVisible] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-slate-800 font-sans overflow-x-hidden selection:bg-blue-900 selection:text-white relative">
      
      {/* --- NEW: Cinematic Scroll-Scrubbed Video Background --- */}
      <ScrollScrubbedVideoBackground videoSrc={VIDEO_URL} />

      {/* --- Navigation --- */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 bg-[#FAF8F4]/80 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Consultancy<span className="text-blue-900">OS</span></span>
          </div>
          <div className="hidden md:flex gap-8 items-center text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-blue-900 transition-colors">Features</a>
            <a href="#" className="hover:text-blue-900 transition-colors">Solutions</a>
            <a href="#" className="hover:text-blue-900 transition-colors">Pricing</a>
            <button className="px-6 py-2.5 bg-blue-900 text-white rounded-full shadow-lg shadow-blue-900/30 hover:shadow-xl hover:scale-105 transition-all duration-300 font-medium">
              Book a demo
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-12 pb-20 md:pt-32 md:pb-32 px-6 overflow-hidden min-h-[80vh] flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center z-10 space-y-8">
          <FadeInUp delay={0.1}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-sm border border-amber-200 text-xs font-semibold text-amber-700 shadow-sm mx-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              ALL-IN-ONE PLATFORM
            </div>
          </FadeInUp>
          
          <FadeInUp delay={0.2}>
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight text-slate-900 drop-shadow-lg">
              Run your <br />
              consultancy <br />
              with <Typewriter words={["clarity.", "confidence.", "success."]} delay={3000} /> 
            </h1>
          </FadeInUp>

          <FadeInUp delay={0.3}>
            <p className="text-lg text-slate-600 max-w-lg mx-auto leading-relaxed drop-shadow-md">
              Keep student cases, documents, and communication organized—so you can focus on what matters most: people and possibilities.
            </p>
          </FadeInUp>

          <FadeInUp delay={0.4}>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="px-8 py-4 bg-blue-900 text-white rounded-2xl shadow-2xl shadow-blue-900/40 hover:shadow-blue-900/60 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 font-medium group">
                Book a demo
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white text-slate-800 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200 font-medium">
                Explore features
              </button>
            </div>
          </FadeInUp>

          <FadeInUp delay={0.5}>
            <div className="pt-8">
              <GooglyEyeComputer />
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* --- CRITICAL SPACER (80vh) --- */}
      <div className="h-[80vh] w-full" aria-hidden="true"></div>

      {/* --- Floating Icons --- */}
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
            className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-white/60 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 border border-white/80"
          >
            <div className="w-14 h-14 rounded-full bg-blue-50 shadow-md flex items-center justify-center text-blue-900">
              <item.icon className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-slate-700">{item.text}</span>
          </motion.div>
        ))}
      </div>

      {/* --- Promise Section --- */}
      <section className="py-24 px-6 bg-white/80 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <FadeInUp>
              <div className="space-y-6">
                <div className="inline-block px-4 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-800 text-xs font-bold tracking-wide uppercase">
                  Our Promise
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                  Built for consultancies that care about <span className="text-blue-900">student experience.</span>
                </h2>
                <p className="text-slate-600 text-lg leading-relaxed">
                  ConsultancyOS helps you stay organized, respond faster, and guide every student journey with confidence and care.
                </p>
              </div>
            </FadeInUp>

            <ScaleIn>
              <TiltCard className="relative bg-[#FAF8F4] rounded-3xl p-8 shadow-2xl shadow-slate-200/50 border border-white/60 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
                <div className="relative z-10 flex flex-col gap-6">
                  <div className="rounded-2xl overflow-hidden shadow-lg h-64 relative">
                    <img 
                      src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600" 
                      alt="Students studying" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-6">
                      <h3 className="text-white font-semibold text-xl drop-shadow-md">Guiding dreams.</h3>
                    </div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl border border-white shadow-sm text-center">
                    <p className="text-slate-700 font-medium text-sm">Building futures, one student at a time.</p>
                  </div>
                </div>
              </TiltCard>
            </ScaleIn>
          </div>
        </div>
      </section>

      {/* --- Features Grid --- */}
      <section className="py-24 px-6 bg-[#FAF8F4]/70 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Users, title: "Stay organized", desc: "Centralize student cases and documents so nothing falls through the cracks." },
              { icon: MessageCircle, title: "Communicate with ease", desc: "Keep every conversation in one place and respond faster." },
              { icon: Shield, title: "Work with confidence", desc: "Protect data, maintain compliance, and build trust." }
            ].map((feature, index) => (
              <FadeInUp key={index} delay={index * 0.1}>
                <TiltCard className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-white/80 hover:border-blue-200 transition-colors duration-300 h-full flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-blue-900 mb-6 shadow-inner">
                    <feature.icon className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                </TiltCard>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* --- Login / CTA Section --- */}
      <section className="relative py-28 px-6 overflow-hidden z-10" id="login">
        <div className="absolute inset-0 bg-blue-900">
           <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-blue-800 rounded-full blur-3xl opacity-50"></div>
           <div className="absolute bottom-[-100px] left-[-100px] w-80 h-80 bg-blue-700 rounded-full blur-3xl opacity-40"></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10 bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20 p-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 h-auto md:h-[550px]">
            <div className="p-8 md:p-12 flex flex-col justify-center bg-white/90 backdrop-blur-sm rounded-l-3xl md:rounded-r-none rounded-3xl shadow-inner">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
                <p className="text-slate-500 text-sm mt-1">Sign in to manage your consultancy.</p>
              </div>
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
                <button className="w-full py-3 bg-blue-900 text-white rounded-xl shadow-lg shadow-blue-900/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 font-medium mt-4">Sign In</button>
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