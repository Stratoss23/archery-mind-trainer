
// Utility to generate beeps using Web Audio API
// This is much more reliable than Text-to-Speech alone

let audioCtx: AudioContext | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;
let voices: SpeechSynthesisVoice[] = [];

// Load voices immediately
const loadVoices = () => {
  const vs = window.speechSynthesis.getVoices();
  if (vs.length > 0) {
    voices = vs;
  }
};

// Ensure voices are loaded (Chrome needs this event)
if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = loadVoices;
  loadVoices();
}

export const getVoiceCount = () => {
  // Try loading again if empty
  if (voices.length === 0) loadVoices();
  return voices.length;
};

export const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  // Also wake up the speech synthesis engine
  if (window.speechSynthesis) {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    // Desktop fix: Clear any stuck queue immediately on init
    window.speechSynthesis.cancel();
  }
  
  // Try to load voices again
  loadVoices();
  
  return audioCtx;
};

export const playTone = (freq: number, duration: number, type: OscillatorType = 'sine') => {
  const ctx = initAudio();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.01);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + duration);
};

// --- Robust Speech Function ---
export const speakText = (text: string) => {
  if (!window.speechSynthesis) return;

  // 1. Desktop Critical Fix: Clear the queue!
  window.speechSynthesis.cancel();

  // Resume just in case
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
  
  const utterance = new SpeechSynthesisUtterance(text);

  // CRITICAL FIX: Force English language.
  // This tells Android/iOS to use English pronunciation rules and numbers,
  // even if the system default is Slovak.
  utterance.lang = 'en-US';

  // 2. Voice Selection
  if (voices.length === 0) loadVoices();
  
  // Prefer Google US English, then any English
  const englishVoice = voices.find(v => v.name === "Google US English") ||
                       voices.find(v => v.lang.includes('en-US') && !v.name.includes('Network')) || 
                       voices.find(v => v.lang.includes('en'));

  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  utterance.rate = 1.0;
  utterance.volume = 1.0;
  utterance.pitch = 1.0;

  // 3. Assign to global to prevent Garbage Collection
  currentUtterance = utterance;
  
  utterance.onend = () => {
    currentUtterance = null;
  };
  
  utterance.onerror = (e) => {
    console.error("TTS Error:", e);
    window.speechSynthesis.cancel(); // Reset on error
  };

  // Small timeout to ensure cancel() finished processing
  setTimeout(() => {
      window.speechSynthesis.speak(utterance);
  }, 10);
};

// --- Combo Sounds ---

export const playShootSound = () => {
  playTone(880, 0.1, 'square'); 
  setTimeout(() => playTone(1760, 0.3, 'square'), 100); 
};

export const playHoldSound = () => {
  playTone(200, 0.4, 'sawtooth');
  setTimeout(() => playTone(150, 0.4, 'sawtooth'), 200);
};

export const playPrepSound = () => {
  playTone(440, 0.1, 'sine');
};

export const playDrawSound = () => {
  playTone(400, 0.1, 'triangle');
  setTimeout(() => playTone(600, 0.2, 'triangle'), 100);
};
