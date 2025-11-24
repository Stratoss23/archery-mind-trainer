
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Settings, DrillPhase, DrillResult } from '../types';
import { XCircle, Volume2, VolumeX, Crosshair } from 'lucide-react';
import { playShootSound, playHoldSound, playPrepSound, playDrawSound, speakText } from './AudioHelper';

interface Props {
  settings: Settings;
  onComplete: (results: DrillResult[]) => void;
  onAbort: () => void;
}

export const ActiveSession: React.FC<Props> = ({ settings, onComplete, onAbort }) => {
  const [phase, setPhase] = useState<DrillPhase>(DrillPhase.PREP);
  const [currentArrow, setCurrentArrow] = useState(1);
  const [timer, setTimer] = useState(settings.prepTime);
  const [command, setCommand] = useState<'SHOOT' | 'HOLD' | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Use useRef for results to avoid re-renders during the critical command phase
  const resultsRef = useRef<DrillResult[]>([]);
  
  // Track if command has been executed for the current phase to prevent duplicates
  const commandExecutedRef = useRef(false);

  // Refs for timeouts to clear them on unmount
  const commandTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset the execution flag when entering a new phase
  useEffect(() => {
    if (phase !== DrillPhase.COMMAND) {
      commandExecutedRef.current = false;
    }
  }, [phase]);

  const triggerVoice = useCallback((text: string, delay = 0) => {
    if (!soundEnabled) return;
    if (delay > 0) {
        setTimeout(() => speakText(text), delay);
    } else {
        speakText(text);
    }
  }, [soundEnabled]);

  // Audio Feedback for Phase Changes (PREP and HOLD)
  useEffect(() => {
    if (phase === DrillPhase.PREP) {
      // Play Sound
      if (soundEnabled) {
        playPrepSound();
        triggerVoice(`Arrow ${currentArrow}. Ready.`);
      }
    } else if (phase === DrillPhase.HOLD) {
      if (soundEnabled) {
        playDrawSound();
        // Small delay to let the draw sound finish
        triggerVoice("Draw.", 300);
      }
    }
  }, [phase, currentArrow, triggerVoice, soundEnabled]);

  const nextArrow = useCallback(() => {
    if (currentArrow >= settings.numberOfArrows) {
      onComplete(resultsRef.current);
      return;
    }
    setCurrentArrow(prev => prev + 1);
    setPhase(DrillPhase.PREP);
    setTimer(settings.prepTime);
    setCommand(null);
  }, [currentArrow, settings.numberOfArrows, onComplete, settings.prepTime]);

  // 1. Timer Logic (PREP & HOLD)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (phase === DrillPhase.PREP) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setPhase(DrillPhase.HOLD);
            return settings.holdTime;
          }
          return prev - 1;
        });
      }, 1000);
    } 
    else if (phase === DrillPhase.HOLD) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 0.1) {
            clearInterval(interval);
            // Decision moment
            const isShoot = Math.random() * 100 <= settings.shootPercentage;
            const newCommand = isShoot ? 'SHOOT' : 'HOLD';
            setCommand(newCommand);
            setPhase(DrillPhase.COMMAND);
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [phase, settings.prepTime, settings.holdTime, settings.shootPercentage]);


  // 2. Command Logic (Runs ONCE when entering COMMAND phase)
  useEffect(() => {
    if (phase === DrillPhase.COMMAND && command && !commandExecutedRef.current) {
      commandExecutedRef.current = true;
      
      if (command === 'SHOOT') {
        if (soundEnabled) {
            playShootSound(); // Distinct high pitch
            // Delay command slightly to not overlap with beep
            triggerVoice("Shoot!", 400);
        }
      } else {
        if (soundEnabled) {
            playHoldSound(); // Distinct low pitch
            triggerVoice("Let down!", 400);
        }
      }

      // B) Record Result (into Ref, does not trigger re-render)
      resultsRef.current.push({
        arrowNumber: currentArrow,
        command: command,
        timestamp: new Date()
      });

      // C) Wait 2 seconds, then next arrow
      if (commandTimeoutRef.current) clearTimeout(commandTimeoutRef.current);
      commandTimeoutRef.current = setTimeout(() => {
        nextArrow();
      }, 2000);
    }
  }, [phase, command, currentArrow, nextArrow, triggerVoice, soundEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (commandTimeoutRef.current) clearTimeout(commandTimeoutRef.current);
      window.speechSynthesis.cancel();
    };
  }, []);

  // Visual helpers
  const getBackgroundColor = () => {
    switch (phase) {
      case DrillPhase.PREP: return 'bg-slate-800';
      case DrillPhase.HOLD: return 'bg-yellow-600';
      case DrillPhase.COMMAND:
        if (command === 'SHOOT') return 'bg-green-600';
        if (command === 'HOLD') return 'bg-red-600';
        return 'bg-slate-800';
      default: return 'bg-slate-900';
    }
  };

  const getPhaseText = () => {
    switch (phase) {
      case DrillPhase.PREP: return 'GET READY';
      case DrillPhase.HOLD: return 'DRAW & HOLD';
      case DrillPhase.COMMAND: return command === 'SHOOT' ? 'SHOOT!' : 'LET DOWN!';
      default: return '';
    }
  };

  return (
    <div className={`h-full w-full flex flex-col items-center justify-center transition-colors duration-300 ${getBackgroundColor()} relative`}>
      
      {/* Top Info Bar */}
      <div className="absolute top-4 w-full px-6 flex justify-between items-center text-white/80 z-20">
        <div className="font-mono text-xl">
          ARROW {currentArrow}/{settings.numberOfArrows}
        </div>
        <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 bg-black/20 rounded-full">
          {soundEnabled ? <Volume2 /> : <VolumeX />}
        </button>
      </div>

      {/* Main Center Content */}
      <div className="flex flex-col items-center z-10">
        {phase === DrillPhase.PREP && (
           <div className="text-[8rem] font-bold text-white font-mono leading-none animate-pulse-slow">
             {Math.ceil(timer)}
           </div>
        )}
        
        {phase === DrillPhase.HOLD && (
          <div className="animate-pulse">
             <Crosshair className="w-48 h-48 text-white opacity-80" />
          </div>
        )}

        {phase === DrillPhase.COMMAND && (
          <div className="text-center animate-bounce-short">
             {command === 'SHOOT' ? (
                <div className="bg-white/20 p-6 rounded-full border-4 border-white">
                  <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-green-600"></div>
                  </div>
                </div>
             ) : (
                <XCircle className="w-48 h-48 text-white" />
             )}
          </div>
        )}

        <h2 className="text-4xl font-black text-white tracking-widest mt-8 uppercase drop-shadow-md">
          {getPhaseText()}
        </h2>
        
        {/* Subtitle for Voice confirmation */}
        {soundEnabled && (
            <div className="mt-4 text-sm text-white/50 bg-black/30 px-3 py-1 rounded-full flex items-center gap-2">
                <Volume2 className="w-3 h-3" />
                <span>Voice Active</span>
            </div>
        )}
      </div>

      {/* Footer controls */}
      <div className="absolute bottom-8 z-20">
        <button 
          onClick={onAbort}
          className="bg-slate-900/50 hover:bg-slate-900/80 text-white px-6 py-2 rounded-full text-sm font-semibold backdrop-blur-sm border border-white/10 transition-all"
        >
          ABORT
        </button>
      </div>
    </div>
  );
};
