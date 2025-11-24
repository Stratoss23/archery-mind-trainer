import React from 'react';
import { Target } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-800 p-3 shadow-md z-10 flex items-center justify-center sm:justify-between">
      {/* App Title */}
      <div className="flex items-center gap-2 text-yellow-500">
        <Target className="w-6 h-6" />
        <h1 className="text-xl font-bold tracking-wide text-white">
          Archery <span className="text-yellow-500">Mind</span> Trainer
        </h1>
      </div>
    </header>
  );
};