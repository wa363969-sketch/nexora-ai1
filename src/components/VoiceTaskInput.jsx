import { useState, useEffect } from 'react';
import { HiMicrophone, HiStop, HiSparkles } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function VoiceTaskInput({ onTaskRecorded }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  function toggleListening() {
    if (!SpeechRecognition) {
      toast.error('Voice Recognition is not supported by your current browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        toast('Listening... Speak your task now (e.g. "Urgent fix authentication bug")', { icon: '🎙️' });
      };

      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        parseAndCreateTask(text);
      };

      recognition.onerror = (e) => {
        console.error(e);
        setIsListening(false);
        toast.error('Could not capture audio');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      toast.error('Error starting voice listener');
    }
  }

  function parseAndCreateTask(text) {
    const lower = text.toLowerCase();
    let priority = 'medium';
    if (lower.includes('urgent') || lower.includes('critical') || lower.includes('p0')) {
      priority = 'urgent';
    } else if (lower.includes('high') || lower.includes('p1')) {
      priority = 'high';
    } else if (lower.includes('low') || lower.includes('p3')) {
      priority = 'low';
    }

    // Clean title
    const cleanTitle = text.replace(/^(create task|add task|urgent|high priority|task)/i, '').trim() || text;

    if (onTaskRecorded) {
      onTaskRecorded({
        title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
        priority,
        status: 'todo',
        description: `Voice dictated task via NEXORA Speech Engine: "${text}"`,
        assigneeName: 'Alex Rivera'
      });
      toast.success(`Voice task added: "${cleanTitle}" [${priority.toUpperCase()}]`);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
        isListening
          ? 'bg-rose-500 text-white border-rose-400 animate-pulse ring-4 ring-rose-500/30'
          : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border-white/10'
      }`}
      title={isListening ? 'Listening... click to cancel' : 'Dictate task by voice'}
    >
      {isListening ? <HiStop className="w-4 h-4" /> : <HiMicrophone className="w-4 h-4" />}
    </button>
  );
}
