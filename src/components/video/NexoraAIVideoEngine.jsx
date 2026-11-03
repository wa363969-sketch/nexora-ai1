import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiPlay,
  HiPause,
  HiSpeakerWave,
  HiSpeakerXMark,
  HiArrowPath,
  HiArrowsPointingOut,
  HiArrowsPointingIn,
  HiSparkles,
  HiCheckCircle,
  HiLockClosed,
  HiViewColumns,
  HiRocketLaunch,
  HiDocumentText,
  HiPhoto,
  HiShieldCheck,
  HiCheck,
  HiCursorArrowRays
} from 'react-icons/hi2';

export const TOTAL_DURATION = 90; // Exactly 1 min 30 sec: 100% matched to voice narration

export const VIDEO_SCENES = [
  {
    id: 1,
    start: 0,
    end: 18,
    title: 'Dashboard & Live Telemetry',
    urduTitle: 'ڈیش بورڈ اور لائیو میٹرکس',
    badge: 'Module 1',
    isFree: true,
    segments: [
      {
        start: 0,
        end: 9,
        voiceText: 'NEXORA ke smart dashboard par khushamdeed! Yahan aapki team ki sprint velocity, active projects, aur AI quota live monitor hotay hain.',
        urduSub: 'NEXORA ڈیش بورڈ: تمام پراجیکٹس، اسپرنٹ ویلوسیٹی اور AI کوٹہ ایک ہی اسکرین پر لائیو مانیٹر کریں۔',
        enSub: 'NEXORA Dashboard: Monitor team velocity, projects, and AI quota in real-time.'
      },
      {
        start: 9,
        end: 18,
        voiceText: 'Top workspace selector se aap private aur client workspaces switch kar sakte hain aur weekly completion rate track kar sakte hain.',
        urduSub: 'ورک اسپیس سلیکٹر: کلائنٹ اکاؤنٹس میں سوئچ کریں اور ہفتہ وار کارکردگی چیک کریں۔',
        enSub: 'Workspace Selector: Switch client accounts and inspect weekly throughput.'
      }
    ]
  },
  {
    id: 2,
    start: 18,
    end: 36,
    title: 'Agile Kanban Board & Drag-Drop Tasks',
    urduTitle: 'ایجائل کنبان بورڈ اور ٹاسکس',
    badge: 'Module 2',
    isFree: false,
    segments: [
      {
        start: 18,
        end: 27,
        voiceText: 'Yeh hamara Agile Kanban Board hai. Sprints ke tamam tasks ko Backlog, In Progress, aur Completed columns mein categorize kiya jata hai.',
        urduSub: 'ایجائل کنبان بورڈ: اسپرنٹ کے تمام ٹاسکس کو کالمز میں منظم کریں۔',
        enSub: 'Agile Kanban Board: Organize tasks across Backlog, In Progress, and Completed.'
      },
      {
        start: 27,
        end: 36,
        voiceText: 'Kisi bhi task ko cursor se pakar kar smoothly drag and drop karein. Task status foran update hota hai aur sprint velocity barh jati hai.',
        urduSub: 'ڈریگ اینڈ ڈراپ: ٹاسک کو کھینچ کر ان پروگریس اور کمپلیٹڈ میں منتقل کریں۔',
        enSub: 'Drag & Drop: Move cards seamlessly to accelerate sprint completion.'
      }
    ]
  },
  {
    id: 3,
    start: 36,
    end: 54,
    title: 'Super AI Co-Pilot (Gemini 3.5 Engine)',
    urduTitle: 'سپر اے آئی کوپائلٹ اور جیمنائی ۳.۵',
    badge: 'Module 3',
    isFree: false,
    segments: [
      {
        start: 36,
        end: 45,
        voiceText: 'NEXORA ka Super AI Co-Pilot Google Gemini 3.5 se powered hai. Yahan aap project proposals aur technical task breakdowns generate kar sakte hain.',
        urduSub: 'سپر اے آئی: گوگل جیمنائی 3.5 کے ذریعے ٹاسک بریک ڈاؤن اور اسپرنٹ پلانز حاصل کریں۔',
        enSub: 'Super AI: Generate technical breakdowns and proposals with Google Gemini 3.5.'
      },
      {
        start: 45,
        end: 54,
        voiceText: 'Jaise hi aap prompt enter karte hain, Gemini 3.5 foran enterprise roadmap aur contracts stream karke screen par dikha deta hai.',
        urduSub: 'فوری جنریشن: جیمنائی 3.5 سیکنڈز میں تفصیلی روڈ میپ اور کنٹریکٹس بناتا ہے۔',
        enSub: 'Instant Stream: Gemini 3.5 rapidly generates verified project deliverables.'
      }
    ]
  },
  {
    id: 4,
    start: 54,
    end: 72,
    title: '1-Click PDF, Word & 4K Creative Studio',
    urduTitle: 'پی ڈی ایف، ورڈ اور فور کے امیج اسٹوڈیو',
    badge: 'Module 4',
    isFree: false,
    segments: [
      {
        start: 54,
        end: 63,
        voiceText: 'AI assistant ke har response ke neechay PDF aur Word download ke buttons hain, jinse formal branded contracts direct save hotay hain.',
        urduSub: 'ڈاکومنٹ ایکسپورٹ: ایک کلک میں باضابطہ پی ڈی ایف اور ورڈ فائلز ڈاؤنلوڈ کریں۔',
        enSub: '1-Click Documents: Download branded PDF contracts and Word .docx files instantly.'
      },
      {
        start: 63,
        end: 72,
        voiceText: 'Saath hi 4K AI Image Studio mein switch karke aap FLUX engine ke zariye ultra-high-definition marketing graphics bana sakte hain.',
        urduSub: 'فور کے امیج اسٹوڈیو: فلکس اے آئی سے ہائی ریزولوشن مارکیٹنگ ڈیزائنز تیار کریں۔',
        enSub: '4K Creative Studio: Generate photorealistic campaign graphics with the FLUX engine.'
      }
    ]
  },
  {
    id: 5,
    start: 72,
    end: 90,
    title: 'Admin Governance & Raast Verification',
    urduTitle: 'ایڈمن گورننس اور راست پے منٹس',
    badge: 'Module 5',
    isFree: false,
    segments: [
      {
        start: 72,
        end: 81,
        voiceText: 'Admin Console se aap poore platform ko control kar sakte hain, client quotas govern kar sakte hain aur incoming bank payments check kar sakte hain.',
        urduSub: 'ایڈمن کنسول: پلیٹ فارم گورننس، کلائنٹ کوٹہ اور موصول شدہ بینکاری ادائیگیوں کا معائنہ۔',
        enSub: 'Admin Console: Govern multi-client workspaces and incoming payment queues.'
      },
      {
        start: 81,
        end: 90,
        voiceText: 'Raast ya EasyPaisa se anay wali PKR 1,499 ki payments ko ek click par approve karein aur client ka premium access activate ho jayega.',
        urduSub: 'فوری منظوری: راست اور ایزی پیسہ کی ادائیگیوں کو ایک کلک میں منظور کر کے رسائی دیں۔',
        enSub: '1-Click Approvals: Instantly unlock client quotas and video guide access upon verification.'
      }
    ]
  }
];

export default function NexoraAIVideoEngine({ hasAccess, onRequireUnlock }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const lastSpokenSegmentKeyRef = useRef(null);

  // Determine current active scene
  const currentScene = VIDEO_SCENES.find(
    s => currentTime >= s.start && currentTime < s.end
  ) || VIDEO_SCENES[0];

  // Determine current active segment within scene
  const currentSegment = currentScene.segments.find(
    seg => currentTime >= seg.start && currentTime < seg.end
  ) || currentScene.segments[0];

  const sceneProgress = Math.min(
    1,
    Math.max(0, (currentTime - currentScene.start) / (currentScene.end - currentScene.start))
  );

  // Playback timer ticker (runs every 100ms for smooth 60fps tracking)
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 0.1 * playbackSpeed;
          
          // Check access restriction for pro scenes
          const nextScene = VIDEO_SCENES.find(s => next >= s.start && next < s.end);
          if (nextScene && !nextScene.isFree && !hasAccess) {
            setIsPlaying(false);
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            setIsSpeaking(false);
            onRequireUnlock();
            return prev;
          }

          if (next >= TOTAL_DURATION) {
            setIsPlaying(false);
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return 0;
          }
          return next;
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, hasAccess, onRequireUnlock]);

  // Voice narration synchronized precisely per segment
  useEffect(() => {
    if (!voiceEnabled || !isPlaying) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsSpeaking(false);
      lastSpokenSegmentKeyRef.current = null;
      return;
    }

    const segmentKey = `${currentScene.id}-${currentSegment.start}`;

    if (lastSpokenSegmentKeyRef.current !== segmentKey) {
      lastSpokenSegmentKeyRef.current = segmentKey;

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(currentSegment.voiceText);
        utter.rate = 1.0;
        utter.pitch = 1.0;
        utter.onstart = () => setIsSpeaking(true);
        utter.onend = () => setIsSpeaking(false);
        utter.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utter);
      }
    }
  }, [currentScene.id, currentSegment.start, voiceEnabled, isPlaying]);

  function togglePlay() {
    if (!isPlaying) {
      if (!currentScene.isFree && !hasAccess) {
        onRequireUnlock();
        return;
      }
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }

  function handleSeek(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const targetPercent = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = targetPercent * TOTAL_DURATION;

    const targetScene = VIDEO_SCENES.find(s => targetTime >= s.start && targetTime < s.end);
    if (targetScene && !targetScene.isFree && !hasAccess) {
      onRequireUnlock();
      return;
    }

    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    lastSpokenSegmentKeyRef.current = null;
    setCurrentTime(targetTime);
  }

  function jumpToScene(scene) {
    if (!scene.isFree && !hasAccess) {
      onRequireUnlock();
      return;
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    lastSpokenSegmentKeyRef.current = null;
    setCurrentTime(scene.start);
    setIsPlaying(true);
  }

  function toggleFullscreen() {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-3xl overflow-hidden bg-slate-950 border border-white/15 shadow-2xl flex flex-col justify-between select-none ${
        isFullscreen ? 'h-screen rounded-none' : 'aspect-video min-h-[460px]'
      }`}
    >
      {/* ─── TOP VIDEO CHROME OVERLAY ─── */}
      <div className="z-20 p-4 sm:p-6 flex items-center justify-between bg-gradient-to-b from-black/85 via-black/40 to-transparent">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-bold backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>NEXORA AI LIVE SIMULATION</span>
            <span className="text-gray-400 font-mono">Synced Audio</span>
          </div>

          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-lg bg-white/10 text-xs font-semibold text-gray-300 backdrop-blur-sm">
            {currentScene.badge}: {currentScene.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {voiceEnabled && isSpeaking && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-300 text-xs font-bold animate-pulse">
              <HiSpeakerWave className="w-3.5 h-3.5 text-violet-400" />
              <span>AI Speaking (Urdu)</span>
            </div>
          )}

          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2 rounded-xl backdrop-blur-md border text-xs font-bold transition-all cursor-pointer ${
              voiceEnabled
                ? 'bg-violet-600/30 border-violet-500/50 text-violet-300'
                : 'bg-black/40 border-white/10 text-gray-400 hover:text-white'
            }`}
            title={voiceEnabled ? 'Mute AI Voice' : 'Unmute AI Voice'}
          >
            {voiceEnabled ? <HiSpeakerWave className="w-4 h-4" /> : <HiSpeakerXMark className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ─── SIMULATED REAL APP VIDEO SCREEN (60FPS CANVAS / UI) ─── */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-b from-navy-950 via-slate-900 to-navy-950 flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]" />

        {/* ========================================================================= */}
        {/* SCENE 1: DASHBOARD & REAL-TIME TELEMETRY */}
        {/* ========================================================================= */}
        {currentScene.id === 1 && (
          <div className="relative w-[92%] h-[80%] rounded-2xl bg-navy-900/90 border border-blue-500/30 shadow-2xl p-4 sm:p-6 overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-violet-600 flex items-center justify-center font-black text-white text-sm shadow-md">
                  N
                </div>
                <div>
                  <div className="text-xs font-black text-white">NEXORA Workspace • Live Telemetry</div>
                  <div className="text-[10px] text-gray-400">Client: Enterprise SLA Tier</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  System Normal (99.9%)
                </span>
                <span className="text-[10px] text-gray-400 font-mono">14 Sprints Active</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 my-2">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="text-[10px] text-gray-400 uppercase font-semibold">Active Projects</div>
                <div className="text-xl sm:text-2xl font-black text-white mt-1">
                  {Math.min(18, Math.floor(12 + sceneProgress * 6))}
                </div>
                <div className="text-[10px] text-emerald-400 mt-0.5">+4 this sprint</div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="text-[10px] text-gray-400 uppercase font-semibold">Sprint Velocity</div>
                <div className="text-xl sm:text-2xl font-black text-blue-400 mt-1">
                  {(92.4 + sceneProgress * 5).toFixed(1)}%
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${92 + sceneProgress * 6}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="text-[10px] text-gray-400 uppercase font-semibold">AI Tokens Quota</div>
                <div className="text-xl sm:text-2xl font-black text-violet-400 mt-1">
                  {Math.floor(14200 + sceneProgress * 3000).toLocaleString()}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">Gemini 3.5 Active</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-navy-950/70 border border-white/5 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span>Weekly Task Throughput Rate</span>
                <span className="text-emerald-400 font-mono font-bold">Peak: 142 tasks/wk</span>
              </div>
              <svg className="w-full h-16 sm:h-20" viewBox="0 0 400 80">
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 60 Q 50 30 100 45 T 200 20 T 300 35 T 400 10 L 400 80 L 0 80 Z"
                  fill="url(#grad1)"
                />
                <path
                  d="M 0 60 Q 50 30 100 45 T 200 20 T 300 35 T 400 10"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                />
                <circle cx={400 * sceneProgress} cy={35} r="5" fill="#60a5fa" className="animate-pulse" />
              </svg>
            </div>

            <div
              className="absolute pointer-events-none transition-all duration-300 z-30"
              style={{
                left: `${30 + sceneProgress * 40}%`,
                top: `${35 + Math.sin(sceneProgress * 6) * 15}%`
              }}
            >
              <div className="relative">
                <HiCursorArrowRays className="w-6 h-6 text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                <span className="absolute -top-6 left-6 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[9px] font-bold text-cyan-200 whitespace-nowrap">
                  Navigating Workspace
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCENE 2: AGILE KANBAN BOARD & DRAGGING */}
        {/* ========================================================================= */}
        {currentScene.id === 2 && (
          <div className="relative w-[92%] h-[80%] rounded-2xl bg-navy-900/90 border border-violet-500/30 shadow-2xl p-4 sm:p-6 overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <HiRocketLaunch className="w-5 h-5 text-violet-400" />
                <span className="text-xs font-bold text-white">Sprint #4 Sprint Board: Mobile Security</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                Drag & Drop Engine Active
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 my-auto">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 min-h-[160px] space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-400">
                  <span>BACKLOG</span>
                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px]">2</span>
                </div>
                <div className="p-2.5 rounded-lg bg-navy-950 border border-white/10 text-xs space-y-1">
                  <span className="text-[9px] font-bold text-amber-400">P2 Low</span>
                  <div className="text-gray-200 text-[11px] font-medium">Session Revocation Hook</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 min-h-[160px] space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-blue-300">
                  <span>IN PROGRESS</span>
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-[9px]">1</span>
                </div>

                <motion.div
                  animate={{
                    x: sceneProgress > 0.5 ? 180 : 0,
                    y: sceneProgress > 0.5 ? 10 : 0,
                    scale: sceneProgress > 0.3 && sceneProgress < 0.7 ? 1.05 : 1
                  }}
                  transition={{ duration: 0.5 }}
                  className="p-3 rounded-xl bg-navy-950 border-2 border-blue-400 shadow-xl text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[9px] font-bold">
                      P0 Urgent
                    </span>
                    <span className="text-[9px] text-gray-400">Due Today</span>
                  </div>
                  <div className="text-white text-xs font-bold">Biometric Native Bridge</div>
                  <div className="text-[10px] text-gray-400">Apple FaceID + Android Keystore</div>
                </motion.div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 min-h-[160px] space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400">
                  <span>COMPLETED</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-[9px]">
                    {sceneProgress > 0.5 ? '5 ✓' : '4'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-navy-950 border border-emerald-500/30 text-xs space-y-1">
                  <span className="text-[9px] font-bold text-emerald-400">Verified ✓</span>
                  <div className="text-gray-200 text-[11px]">Database Migrations 2.0</div>
                </div>
              </div>
            </div>

            <div
              className="absolute pointer-events-none transition-all duration-300 z-30"
              style={{
                left: `${40 + sceneProgress * 35}%`,
                top: `${48 + Math.sin(sceneProgress * 4) * 5}%`
              }}
            >
              <HiCursorArrowRays className="w-7 h-7 text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]" />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCENE 3: SUPER AI CO-PILOT (GEMINI 3.5 ENGINE) */}
        {/* ========================================================================= */}
        {currentScene.id === 3 && (
          <div className="relative w-[92%] h-[80%] rounded-2xl bg-navy-900/90 border border-pink-500/30 shadow-2xl p-4 sm:p-6 overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <HiSparkles className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-bold text-white">NEXORA Super AI Assistant</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-[10px] font-bold">
                Model: Gemini 3.5 Flash-Lite
              </span>
            </div>

            <div className="space-y-3 my-auto overflow-hidden">
              <div className="flex justify-end">
                <div className="p-3 rounded-2xl bg-blue-600 text-white text-xs max-w-md shadow-lg">
                  <div className="font-semibold text-[10px] text-blue-200 mb-0.5">You (Prompt):</div>
                  Draft an Agile Architecture Plan for client contract with 99.9% SLA & PDF export.
                </div>
              </div>

              <div className="flex justify-start">
                <div className="p-3 sm:p-4 rounded-2xl bg-navy-950 border border-violet-500/30 text-xs max-w-lg space-y-2 shadow-xl">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-violet-400">
                    <HiSparkles className="w-3.5 h-3.5" />
                    <span>Gemini 3.5 Co-Pilot Response:</span>
                  </div>
                  <div className="text-gray-200 text-[11px] leading-relaxed font-mono">
                    {sceneProgress < 0.3 ? (
                      <span className="animate-pulse">Thinking with Gemini 3.5...</span>
                    ) : (
                      <>
                        <strong>✓ Enterprise SLA & Deliverables Breakdown:</strong>
                        <br />1. Biometric Keystore Hardware bridge verified.
                        <br />2. Zero-downtime database replication configured.
                        <br />3. 1-Click branded PDF document generated below.
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-navy-950 border border-white/10">
              <input
                type="text"
                readOnly
                value="Ask Super AI anything: contracts, bug triage, marketing specs..."
                className="w-full bg-transparent text-[11px] text-gray-400 focus:outline-none px-2"
              />
              <button className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-violet-600 text-[10px] font-bold text-white shadow-md">
                Generate
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCENE 4: 1-CLICK PDF, WORD & 4K IMAGE STUDIO */}
        {/* ========================================================================= */}
        {currentScene.id === 4 && (
          <div className="relative w-[92%] h-[80%] rounded-2xl bg-navy-900/90 border border-emerald-500/30 shadow-2xl p-4 sm:p-6 overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <HiDocumentText className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold text-white">Document Engine & 4K Creative Studio</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                jsPDF + Docx + FLUX 4K
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 my-auto">
              <div className="p-3.5 rounded-xl bg-navy-950 border border-white/10 space-y-2 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold">
                    <HiDocumentText className="w-4 h-4" />
                    <span>NEXORA_SLA_Contract.pdf</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                    {sceneProgress > 0.4 ? 'Downloaded ✓' : 'Ready'}
                  </span>
                </div>
                <div className="h-16 rounded bg-white/5 border border-white/5 p-2 text-[9px] text-gray-400 font-mono space-y-1">
                  <div className="w-2/3 h-1.5 bg-blue-400/40 rounded" />
                  <div className="w-full h-1.5 bg-white/10 rounded" />
                  <div className="w-4/5 h-1.5 bg-white/10 rounded" />
                </div>
                <div className="flex gap-2 pt-1">
                  <button className="flex-1 py-1 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                    📄 PDF Download
                  </button>
                  <button className="flex-1 py-1 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                    📝 Word (.docx)
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-navy-950 border border-white/10 space-y-2 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-violet-400 text-xs font-bold">
                    <HiPhoto className="w-4 h-4" />
                    <span>4K Concept Artwork</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 text-[9px] font-bold">
                    FLUX HD
                  </span>
                </div>
                <div className="h-16 rounded overflow-hidden relative border border-white/10">
                  <img
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80"
                    alt="AI Artwork"
                    className="w-full h-full object-cover filter brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-1.5">
                    <span className="text-[8px] text-gray-200 truncate">Prompt: Futuristic SaaS Workspace</span>
                  </div>
                </div>
                <button className="w-full py-1 rounded bg-gradient-to-r from-violet-600 to-pink-600 text-white text-[10px] font-bold shadow-md">
                  Download 4K Ultra-HD
                </button>
              </div>
            </div>

            <div className="text-[10px] text-gray-400 text-center">
              Generated contracts and designs are downloaded directly to client device with no third-party branding.
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCENE 5: ADMIN CONSOLE & RAAST BANK APPROVALS */}
        {/* ========================================================================= */}
        {currentScene.id === 5 && (
          <div className="relative w-[92%] h-[80%] rounded-2xl bg-navy-900/90 border border-amber-500/30 shadow-2xl p-4 sm:p-6 overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <HiShieldCheck className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-bold text-white">Admin Console: Root Governance</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                wa363969@gmail.com
              </span>
            </div>

            <div className="p-3 rounded-xl bg-navy-950 border border-white/10 space-y-2 my-auto">
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-300">
                <span>Incoming Raast & Bank Transfer Queue</span>
                <span className="text-amber-400">1 Pending Order</span>
              </div>

              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white text-[11px]">Ali Ahmed • 03001234567</div>
                  <div className="text-[10px] text-gray-400 font-mono">
                    TRX: 849201948 • RAAST • PKR 1,499
                  </div>
                </div>

                {sceneProgress > 0.4 ? (
                  <span className="px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-1">
                    <HiCheck className="w-3.5 h-3.5" />
                    <span>Approved ✓</span>
                  </span>
                ) : (
                  <button className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer animate-pulse">
                    Approve Access
                  </button>
                )}
              </div>
            </div>

            <div className="text-[10px] text-gray-400 text-center">
              1-Click approval instantly unlocks the complete video guide and client project quotas.
            </div>
          </div>
        )}
      </div>

      {/* ─── BOTTOM SUBTITLES (PINNED AT BOTTOM ABOVE CONTROLS) ─── */}
      <div className="absolute bottom-14 sm:bottom-16 left-0 right-0 z-20 flex justify-center px-4 pointer-events-none">
        <div className="max-w-2xl text-center px-4 py-2 rounded-2xl bg-black/85 backdrop-blur-md border border-white/15 shadow-2xl space-y-0.5">
          <div className="text-xs sm:text-sm font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            {currentSegment.urduSub}
          </div>
          <div className="text-[10px] sm:text-[11px] text-gray-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-medium">
            {currentSegment.enSub}
          </div>
        </div>
      </div>

      {/* ─── BOTTOM PLAYER TIMELINE & CONTROLS ─── */}
      <div className="z-20 p-3 sm:p-4 bg-black/95 border-t border-white/10 space-y-2">
        {/* Scrubber Timeline */}
        <div
          onClick={handleSeek}
          className="relative w-full h-2 rounded-full bg-white/20 hover:h-2.5 transition-all cursor-pointer group"
        >
          {/* Chapter markers */}
          {VIDEO_SCENES.map(s => (
            <div
              key={s.id}
              className="absolute top-0 bottom-0 w-0.5 bg-black/80 z-10"
              style={{ left: `${(s.start / TOTAL_DURATION) * 100}%` }}
              title={s.title}
            />
          ))}

          {/* Progress bar */}
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 rounded-full relative"
            style={{ width: `${(currentTime / TOTAL_DURATION) * 100}%` }}
          >
            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex items-center justify-between text-xs text-gray-300">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              {isPlaying ? <HiPause className="w-4 h-4" /> : <HiPlay className="w-4 h-4 ml-0.5" />}
            </button>

            <span className="font-mono text-[11px] text-gray-300">
              {formatTime(currentTime)} / {formatTime(TOTAL_DURATION)}
            </span>

            <div className="hidden sm:flex items-center gap-1.5 ml-2">
              {VIDEO_SCENES.map(s => (
                <button
                  key={s.id}
                  onClick={() => jumpToScene(s)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    s.id === currentScene.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/5 hover:bg-white/15 text-gray-400'
                  }`}
                >
                  Mod {s.id}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={playbackSpeed}
              onChange={e => setPlaybackSpeed(Number(e.target.value))}
              className="px-2 py-1 rounded bg-white/10 border border-white/10 text-white text-[11px] focus:outline-none cursor-pointer"
            >
              <option value="1" className="bg-navy-950">1.0x</option>
              <option value="1.25" className="bg-navy-950">1.25x</option>
              <option value="1.5" className="bg-navy-950">1.5x</option>
            </select>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white cursor-pointer"
            >
              {isFullscreen ? <HiArrowsPointingIn className="w-4 h-4" /> : <HiArrowsPointingOut className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
