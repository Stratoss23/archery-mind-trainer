
import React, { useState } from 'react';
import { AppState, Settings, DrillResult } from './types';
import { SetupScreen } from './components/SetupScreen';
import { ActiveSession } from './components/ActiveSession';
import { SummaryScreen } from './components/SummaryScreen';
import { Header } from './components/Header';

const DEFAULT_SETTINGS: Settings = {
  prepTime: 10,
  holdTime: 4,
  shootPercentage: 70,
  numberOfArrows: 6,
};

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.SETUP);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [results, setResults] = useState<DrillResult[]>([]);

  const startSession = (newSettings: Settings) => {
    setSettings(newSettings);
    setResults([]);
    setAppState(AppState.ACTIVE);
  };

  const endSession = (sessionResults: DrillResult[]) => {
    setResults(sessionResults);
    setAppState(AppState.SUMMARY);
  };

  const resetApp = () => {
    setAppState(AppState.SETUP);
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-900 overflow-hidden shadow-2xl relative">
      <Header />
      
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
        {appState === AppState.SETUP && (
          <div className="flex flex-col h-full">
            <SetupScreen 
              initialSettings={settings} 
              onStart={startSession} 
            />
            
            {/* Footer Logo Area */}
            <div className="p-6 mt-auto flex justify-center pb-8 animate-fade-in">
               <a 
                href="https://www.youtube.com/@archerylove" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group opacity-90 hover:opacity-100 transition-all active:scale-95 flex flex-col items-center"
              >
                {/* User provided PNG Logo (Transparent) */}
                <img 
                  src="https://www.lukostrelbatopolcany.sk/wp-content/uploads/2025/11/logo_love_transparent.png" 
                  alt="Archery Love" 
                  className="w-64 h-auto object-contain mb-2" 
                />

                {/* Subtitle */}
                <div className="text-[10px] text-slate-400 font-bold tracking-[0.15em] uppercase text-center">
                  Archery Love • Youtube Channel
                </div>
              </a>
            </div>
          </div>
        )}

        {appState === AppState.ACTIVE && (
          <ActiveSession 
            settings={settings} 
            onComplete={endSession}
            onAbort={resetApp}
          />
        )}

        {appState === AppState.SUMMARY && (
          <SummaryScreen 
            results={results} 
            onRestart={resetApp} 
          />
        )}
      </main>
    </div>
  );
}
