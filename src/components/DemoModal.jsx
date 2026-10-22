import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiXMark,
  HiPlay,
  HiPause,
  HiSpeakerWave,
  HiSpeakerXMark,
  HiSparkles,
  HiViewColumns,
  HiBriefcase,
  HiBolt,
  HiChartBar,
  HiArrowRight,
  HiCheckCircle,
} from 'react-icons/hi2';
import { Link } from 'react-router-dom';

const DEMO_STEPS = [
  {
    id: 'intro',
    title: 'Welcome to NEXORA',
    subtitle: 'The All-in-One AI Productivity Platform',
    icon: HiSparkles,
    color: 'from-blue-500 to-cyan-500',
    description: 'NEXORA brings your projects, team collaboration, task tracking, and cutting-edge Gemini AI into one seamless workspace.',
    features: [
      'Universal Project Management with Kanban & Lists',
      'Real-time Gemini 3.5 AI Assistant',
      'Smart Automation Workflows & Alerts',
      'Multi-Tenant Private Client Workspaces'
    ],
    highlight: 'Getting Started in Under 60 Seconds'
  },
  {
    id: 'projects',
    title: '1. Projects & Kanban Boards',
    subtitle: 'Track Every Milestone Visually',
    icon: HiViewColumns,
    color: 'from-violet-500 to-purple-500',
    description: 'Drag and drop tasks across "To Do", "In Progress", and "Done" columns. Every project progress bar updates dynamically.',
    features: [
      'Interactive Kanban Drag & Drop with priority badges',
      'Custom tags, deadline counters, and team assignees',
      'Instant search and multi-criteria filtering',
      'Automated completion percentage calculations'
    ],
    highlight: 'Never miss a project deadline again'
  },
  {
    id: 'ai-assistant',
    title: '2. Real Gemini AI Assistant',
    subtitle: 'Your 24/7 Intelligent Copilot',
    icon: HiSparkles,
    color: 'from-amber-400 to-orange-500',
    description: 'Ask the AI assistant to draft project briefs, break down complex tasks, write emails, and debug code in real time.',
    features: [
      'Powered by Google Gemini 3.5 Flash architecture',
      'One-click task generation from conversation prompts',
      'Code generation, bug diagnosis, and copywriting',
      'Persistent chat history isolated to your account'
    ],
    highlight: 'Ask anything: "Generate 5 marketing tasks for launch"'
  },
  {
    id: 'automation-analytics',
    title: '3. Automations & Executive Analytics',
    subtitle: 'Put Your Repetitive Work on Autopilot',
    icon: HiBolt,
    color: 'from-emerald-400 to-teal-500',
    description: 'Automate status updates, trigger notifications, and monitor velocity through real-time executive charts.',
    features: [
      'Custom webhook & trigger-based workflow automations',
      'Real-time team productivity metrics & burn-down charts',
      '100% Private Data Isolation for every client account',
      'PWA support — install directly on mobile and desktop'
    ],
    highlight: 'Boost your entire team efficiency by 40%'
  }
];

export default function DemoModal({ isOpen, onClose }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [speechAvailable, setSpeechAvailable] = useState(false);
  const [mounted, setMounted] = useState(false);

  const stepDuration = 12; // 12 seconds per slide
  const totalDuration = stepDuration * DEMO_STEPS.length;

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechAvailable(true);
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Voice narration safe trigger
  const speakCurrentStep = (index) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || isMuted) return;
    try {
      window.speechSynthesis.cancel();
      const step = DEMO_STEPS[index];
      const textToSpeak = `${step.title}. ${step.subtitle}. ${step.description}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 1.0;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    } catch {
      // Safe fallback if speech is blocked
    }
  };

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setActiveStepIndex(0);
      setProgress(0);
      setIsPlaying(true);
      speakCurrentStep(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle Mute changes
  useEffect(() => {
    if (isMuted) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } else if (isOpen && isPlaying) {
      speakCurrentStep(activeStepIndex);
    }
  }, [isMuted]);

  // Timer loop for video playback
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (100 / (totalDuration * 10));
        if (next >= 100) {
          setIsPlaying(false);
          return 100;
        }
        const currentStep = Math.min(
          DEMO_STEPS.length - 1,
          Math.floor((next / 100) * DEMO_STEPS.length)
        );
        if (currentStep !== activeStepIndex) {
          setActiveStepIndex(currentStep);
          speakCurrentStep(currentStep);
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying, activeStepIndex, totalDuration]);

  if (!isOpen || !mounted) return null;

  const currentStep = DEMO_STEPS[activeStepIndex];
  const StepIcon = currentStep.icon;

  const handleStepSelect = (index) => {
    setActiveStepIndex(index);
    setProgress((index / DEMO_STEPS.length) * 100);
    speakCurrentStep(index);
  };

  const togglePlay = () => {
    if (!isPlaying && progress >= 100) {
      setProgress(0);
      setActiveStepIndex(0);
      speakCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
      if (isPlaying) {
        window.speechSynthesis?.cancel();
      } else {
        speakCurrentStep(activeStepIndex);
      }
    }
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-lg overflow-y-auto"
    >
      {/* Backdrop click */}
      <div
        className="fixed inset-0 -z-10"
        onClick={() => {
          window.speechSynthesis?.cancel();
          onClose();
        }}
      />

      <div
        className="relative w-full max-w-4xl bg-navy-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/10 bg-navy-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <HiSparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                NEXORA Product Demo & Walkthrough
                <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  AI Interactive Guide
                </span>
              </h2>
              <p className="text-xs text-gray-400">See how to manage projects, AI prompts & client workflows</p>
            </div>
          </div>
          <button
            onClick={() => {
              window.speechSynthesis?.cancel();
              onClose();
            }}
            aria-label="Close Demo"
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <HiXMark className="w-6 h-6" />
          </button>
        </div>

        {/* Video Canvas Stage */}
        <div className="relative min-h-[380px] sm:min-h-[440px] w-full bg-navy-950 overflow-hidden flex flex-col justify-between p-5 sm:p-8">
          {/* Animated Background Atmosphere */}
          <div className="absolute inset-0 pointer-events-none">
            <div className={`absolute top-0 right-0 w-96 h-96 rounded-full bg-gradient-to-br ${currentStep.color} opacity-20 blur-3xl transition-all duration-700`} />
            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-blue-600/15 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />
          </div>

          {/* Top Video Indicators */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400">
                AI DEMO • STEP {activeStepIndex + 1} OF {DEMO_STEPS.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {speechAvailable && (
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  title={isMuted ? 'Turn Sound ON' : 'Turn Sound OFF'}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                    isMuted
                      ? 'bg-red-500/10 text-red-300 border-red-500/20 hover:bg-red-500/20'
                      : 'bg-white/10 text-gray-200 border-white/15 hover:bg-white/20'
                  }`}
                >
                  {isMuted ? <HiSpeakerXMark className="w-4 h-4" /> : <HiSpeakerWave className="w-4 h-4 text-blue-400" />}
                  <span>{isMuted ? 'Voice Off' : 'AI Voice On'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Center Stage Presentation Content */}
          <div className="relative z-10 my-4 sm:my-6 grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-center">
            {/* Left Column: Visual Icon & Info */}
            <div className="md:col-span-5 flex flex-col items-start text-left">
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr ${currentStep.color} flex items-center justify-center text-white shadow-xl mb-3`}>
                <StepIcon className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-semibold text-blue-400 mb-2">
                {currentStep.highlight}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                {currentStep.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 font-medium">{currentStep.subtitle}</p>
              <p className="text-xs sm:text-sm text-gray-300 mt-3 leading-relaxed">
                {currentStep.description}
              </p>
            </div>

            {/* Right Column: Key Feature Highlights / Mock UI */}
            <div className="md:col-span-7 bg-navy-900/80 border border-white/15 rounded-xl p-4 sm:p-5 backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  How It Works
                </span>
                <span className="text-[11px] text-blue-400 font-mono font-medium">Gemini 3.5 Ready</span>
              </div>
              <div className="space-y-2.5">
                {currentStep.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-200"
                  >
                    <HiCheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Video Controls Bar */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition shadow-lg shadow-blue-500/25 cursor-pointer"
              >
                {isPlaying ? <HiPause className="w-5 h-5" /> : <HiPlay className="w-5 h-5 ml-0.5" />}
              </button>
              <div className="text-xs text-gray-400">
                <span className="text-white font-medium">
                  {Math.round((progress / 100) * totalDuration)}s
                </span>{' '}
                / {totalDuration}s
              </div>
            </div>

            {/* Step Pills */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {DEMO_STEPS.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => handleStepSelect(idx)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    activeStepIndex === idx
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                  }`}
                >
                  Step {idx + 1}
                </button>
              ))}
            </div>

            <Link
              to="/register"
              onClick={() => {
                window.speechSynthesis?.cancel();
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 transition shadow-lg shadow-blue-500/20"
            >
              <span>Get Started</span>
              <HiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Video Timeline Scrubber */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Footer Quick Steps Guide */}
        <div className="px-5 sm:px-6 py-3.5 bg-navy-950 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
          {DEMO_STEPS.map((step, idx) => (
            <div
              key={step.id}
              onClick={() => handleStepSelect(idx)}
              className={`p-2 sm:p-2.5 rounded-xl cursor-pointer border transition text-left ${
                activeStepIndex === idx
                  ? 'bg-white/10 border-blue-500/50'
                  : 'bg-white/[0.02] border-transparent hover:bg-white/5'
              }`}
            >
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Step 0{idx + 1}
              </div>
              <div className="text-xs font-semibold text-white truncate mt-0.5">{step.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
