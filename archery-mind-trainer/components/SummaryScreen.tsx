
import React from 'react';
import { DrillResult } from '../types';
import { RotateCcw, Target, AlertTriangle } from 'lucide-react';

interface Props {
  results: DrillResult[];
  onRestart: () => void;
}

export const SummaryScreen: React.FC<Props> = ({ results, onRestart }) => {
  const shootCount = results.filter(r => r.command === 'SHOOT').length;
  const holdCount = results.filter(r => r.command === 'HOLD').length;

  return (
    <div className="p-6 h-full flex flex-col animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Session Complete</h2>
        <p className="text-slate-400">Great job! Here is your summary.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-green-900/30 border border-green-500/30 p-4 rounded-xl flex flex-col items-center">
          <Target className="w-8 h-8 text-green-500 mb-2" />
          <span className="text-3xl font-bold text-white">{shootCount}</span>
          <span className="text-xs text-green-300 uppercase tracking-wider">Shots</span>
        </div>
        <div className="bg-red-900/30 border border-red-500/30 p-4 rounded-xl flex flex-col items-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
          <span className="text-3xl font-bold text-white">{holdCount}</span>
          <span className="text-xs text-red-300 uppercase tracking-wider">Holds</span>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl overflow-hidden flex-1 mb-8 border border-slate-700">
        <div className="p-3 bg-slate-700 font-semibold text-slate-300 text-sm flex justify-between">
          <span>Arrow #</span>
          <span>Command</span>
        </div>
        <div className="overflow-y-auto max-h-[300px]">
          {results.map((r, i) => (
            <div key={i} className="flex justify-between p-3 border-b border-slate-700 last:border-0 text-sm">
              <span className="text-slate-400">Arrow {r.arrowNumber}</span>
              <span className={`font-bold ${r.command === 'SHOOT' ? 'text-green-400' : 'text-red-400'}`}>
                {r.command === 'SHOOT' ? 'SHOOT' : 'LET DOWN'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={onRestart}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
      >
        <RotateCcw className="w-5 h-5" />
        NEW SESSION
      </button>
    </div>
  );
};
