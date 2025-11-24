
import React, { useState, useEffect } from 'react';
import { Settings } from '../types';
import { Clock, Crosshair, Percent, Hash, Play, Volume2, AlertTriangle } from 'lucide-react';
import { initAudio, playShootSound, speakText, getVoiceCount } from './AudioHelper';

interface Props {
  initialSettings: Settings;
  onStart: (settings: Settings) => void;
}

export const SetupScreen: React.FC<Props> = ({ initialSettings, onStart }) => {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [voiceCount, setVoiceCount] = useState(0);

  useEffect(() => {
    // Check for voices periodically in case they load late
    const checkVoices = setInterval(() => {
        setVoiceCount(getVoiceCount());
    }, 1000);
    
    // Force init immediately
    initAudio();
    
    return () => clearInterval(checkVoices);
  }, []);

  const handleChange = (key: keyof Settings, value: number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleStart = () => {
    initAudio(); 
    speakText("Starting");
    onStart(settings);
  };

  const testSound = () => {
    initAudio();
    playShootSound();
    // Delay speech slightly so it doesn't clash with the beep
    setTimeout(() => {
        speakText("Audio check.");
    }, 500);
  };

  return (
    <div className="p-6 space-y-8 animate-fade-in pb-20">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-white">Drill Setup</h2>
        <p className="text-slate-400 text-sm">Customize timing and difficulty.</p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <button 
          onClick={testSound}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-blue-400 px-4 py-2 rounded-full text-sm border border-slate-600 transition-colors"
        >
          <Volume2 className="w-4 h-4" />
          Test Audio (Beep + Voice)
        </button>
        
        {voiceCount === 0 ? (
            <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                No voices found. Check system settings.
            </p>
        ) : (
            <p className="text-xs text-slate-500">
                {voiceCount} voices detected.
            </p>
        )}
      </div>

      <div className="space-y-6">
        {/* Prep Time */}
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <label className="flex items-center gap-2 text-blue-400 font-semibold mb-3">
            <Clock className="w-5 h-5" />
            Prep Time (s)
          </label>
          <div className="flex items-center gap-4">
            <input 
              type="range" 
              min="5" max="30" step="1"
              value={settings.prepTime}
              onChange={(e) => handleChange('prepTime', Number(e.target.value))}
              className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-xl font-mono text-white w-12 text-right">{settings.prepTime}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Time to nock arrow and prepare.</p>
        </div>

        {/* Hold Time - Single Value */}
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <label className="flex items-center gap-2 text-yellow-500 font-semibold mb-3">
            <Crosshair className="w-5 h-5" />
            Hold Time (s)
          </label>
          <div className="flex items-center gap-4">
             <input 
              type="range" 
              min="1" max="15" step="0.5"
              value={settings.holdTime}
              onChange={(e) => handleChange('holdTime', Number(e.target.value))}
              className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-yellow-500"
            />
            <span className="text-xl font-mono text-white w-12 text-right">{settings.holdTime}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Exact time at full draw before command.</p>
        </div>

        {/* Shoot Percentage */}
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <label className="flex items-center gap-2 text-green-500 font-semibold mb-3">
            <Percent className="w-5 h-5" />
            Shoot Frequency (%)
          </label>
           <div className="flex items-center gap-4">
            <input 
              type="range" 
              min="0" max="100" step="10"
              value={settings.shootPercentage}
              onChange={(e) => handleChange('shootPercentage', Number(e.target.value))}
              className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
            <span className="text-xl font-mono text-white w-12 text-right">{settings.shootPercentage}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Chance the app will say "SHOOT".</p>
        </div>

        {/* Arrows Count */}
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
           <label className="flex items-center gap-2 text-slate-300 font-semibold mb-3">
            <Hash className="w-5 h-5" />
            Number of Arrows
          </label>
          <div className="flex justify-between items-center bg-slate-900 rounded-lg p-2">
             <button 
                onClick={() => handleChange('numberOfArrows', Math.max(1, settings.numberOfArrows - 1))}
                className="w-10 h-10 rounded bg-slate-700 text-white flex items-center justify-center text-xl font-bold active:bg-slate-600"
             >-</button>
             <span className="text-2xl font-mono text-white">{settings.numberOfArrows}</span>
             <button 
                onClick={() => handleChange('numberOfArrows', settings.numberOfArrows + 1)}
                className="w-10 h-10 rounded bg-slate-700 text-white flex items-center justify-center text-xl font-bold active:bg-slate-600"
             >+</button>
          </div>
        </div>
      </div>

      <button 
        onClick={handleStart}
        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-colors text-lg shadow-lg shadow-green-900/20"
      >
        <Play className="w-6 h-6 fill-current" />
        START DRILL
      </button>
    </div>
  );
};
