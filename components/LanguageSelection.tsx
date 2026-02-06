import React from 'react';
import { LANGUAGES } from '../constants';
import { LanguageCode } from '../types';
import { Sprout } from 'lucide-react';

interface Props {
  onSelect: (lang: LanguageCode) => void;
}

const LanguageSelection: React.FC<Props> = ({ onSelect }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-leaf-200/60 dark:bg-leaf-900/30 rounded-full blur-3xl"></div>
        <div className="absolute top-[30%] -right-[10%] w-[50%] h-[50%] bg-earth-200/60 dark:bg-earth-900/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl w-full flex flex-col items-center">
        {/* Title Section - No Delay */}
        <div className="mb-12 text-center animate-content-show">
          <div className="relative inline-block mb-6 group cursor-pointer">
            <div className="absolute inset-0 bg-leaf-500 blur-2xl opacity-30 group-hover:opacity-70 rounded-full transition-opacity duration-700 animate-pulse-slow"></div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-glow hover:shadow-neon relative ring-1 ring-leaf-100 dark:ring-leaf-900 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110">
              <Sprout className="text-leaf-600 dark:text-leaf-400 w-14 h-14 filter drop-shadow-md" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-earth-900 dark:text-earth-50 mb-4 tracking-tight drop-shadow-lg">
            Kisan <span className="text-leaf-600 dark:text-leaf-400 bg-clip-text text-transparent bg-gradient-to-r from-leaf-600 to-emerald-500 dark:from-leaf-400 dark:to-emerald-300">Setu</span>
          </h1>
          <p className="text-lg md:text-2xl text-earth-600 dark:text-earth-300 max-w-lg mx-auto leading-relaxed font-medium drop-shadow-sm">
            AI-powered soil analysis for smarter farming. <br/>
            <span className="font-bold text-leaf-700 dark:text-leaf-300">Select your language to begin.</span>
          </p>
        </div>

        {/* Buttons - Staggered Delay */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-4xl perspective-1000">
          {LANGUAGES.map((lang, idx) => (
            <button
              key={lang.code}
              onClick={() => onSelect(lang.code)}
              className="
                group relative flex flex-col items-center justify-center p-8 
                bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl 
                rounded-3xl shadow-card border border-white dark:border-slate-700 
                hover:shadow-card-hover hover:border-leaf-400 dark:hover:border-leaf-500
                hover:-translate-y-3 hover:scale-105
                hover:bg-gradient-to-br hover:from-white hover:to-leaf-50 dark:hover:from-slate-800 dark:hover:to-slate-700
                active:scale-95 active:shadow-inner
                transition-all duration-400 ease-out
                opacity-0 animate-content-show
                overflow-hidden
              "
              style={{ animationDelay: `${(idx * 100) + 200}ms` }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-leaf-400/10 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500"></div>
              
              <span className="text-4xl font-extrabold text-earth-800 dark:text-earth-100 mb-3 group-hover:text-leaf-600 dark:group-hover:text-leaf-400 transition-colors transform group-hover:scale-110 duration-300 drop-shadow-md">
                {lang.nativeLabel}
              </span>
              <span className="text-sm font-bold text-earth-400 dark:text-earth-500 uppercase tracking-widest group-hover:text-leaf-600 dark:group-hover:text-leaf-300 transition-colors">
                {lang.label}
              </span>
              
              {/* Active Indicator hint */}
              <div className="absolute bottom-5 w-2 h-2 rounded-full bg-leaf-500 dark:bg-leaf-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 shadow-glow-lg"></div>
            </button>
          ))}
        </div>

        <footer className="mt-20 text-earth-400 dark:text-slate-500 text-sm font-medium opacity-0 animate-content-show" style={{ animationDelay: '800ms' }}>
          Empowering farmers with advanced AI technology
        </footer>
      </div>
    </div>
  );
};

export default LanguageSelection;