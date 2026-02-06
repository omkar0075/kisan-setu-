import React, { useEffect, useState } from 'react';
import { Sprout, Cherry } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

const SplashScreen: React.FC<Props> = ({ onComplete }) => {
  // Animation Phase State:
  // 0: Initial Void (Darkness)
  // 1: Germination (Plant rises from soil)
  // 2: The Drop (Fruit separates and falls)
  // 3: The Impact (Explosion, Flash, Shockwave)
  // 4: The Reveal (Logo emerges from smoke)
  // 5: Dissolve (Transition to App)
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // TIMELINE ORCHESTRATION
    
    // T+0ms: Dark Void
    
    // T+500ms: Plant starts growing
    const t1 = setTimeout(() => setPhase(1), 500);
    
    // T+2000ms: Fruit starts falling (Gravity kicks in)
    const t2 = setTimeout(() => setPhase(2), 2000);
    
    // T+2600ms: IMPACT! (Camera Shake + Flash)
    // The drop animation is approx 0.6s, so we trigger impact shortly after drop starts
    const t3 = setTimeout(() => setPhase(3), 2600);
    
    // T+2700ms: Logo Reveal (Elastic Bounce)
    const t4 = setTimeout(() => setPhase(4), 2700);

    // T+4500ms: Background Transition to App Theme
    const t5 = setTimeout(() => setPhase(5), 4500);

    // T+5000ms: Handover to Main App
    const t6 = setTimeout(() => onComplete(), 5000);

    return () => {
      [t1, t2, t3, t4, t5, t6].forEach(clearTimeout);
    };
  }, [onComplete]);

  return (
    <div 
      className={`
        fixed inset-0 z-50 flex items-center justify-center overflow-hidden
        ${phase >= 3 ? 'animate-camera-shake' : ''} 
        ${phase >= 5 ? 'bg-earth-50' : 'bg-earth-950'}
        transition-colors duration-700 ease-in-out
      `}
    >
      {/* 1. Global Texture Layer (The "Soil") */}
      <div className={`absolute inset-0 bg-noise pointer-events-none transition-opacity duration-1000 ${phase >= 5 ? 'opacity-10' : 'opacity-30'}`}></div>

      {/* 2. ACT 1: Germination (The Plant) */}
      {/* Fades out when impact happens to clear stage for logo */}
      <div 
        className={`
          absolute bottom-0 left-0 w-full h-1/2 flex justify-center items-end pb-0 
          transition-all duration-200 ease-out
          ${phase >= 3 ? 'opacity-0 scale-95 blur-sm' : 'opacity-100'}
        `}
      >
         <div className={`transform origin-bottom text-leaf-700 ${phase >= 1 ? 'animate-grow-up' : 'translate-y-full opacity-0'}`}>
            {/* Giant abstract plant */}
            <Sprout className="w-64 h-64 md:w-96 md:h-96 filter drop-shadow-2xl" strokeWidth={1.5} />
         </div>
      </div>

      {/* 3. ACT 2: The Drop (The Fruit) */}
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
        {phase === 2 && (
          <div className="animate-accel-drop">
             <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(220,38,38,0.6)] text-white relative z-50 border-2 border-red-400">
                <Cherry className="w-8 h-8" />
             </div>
          </div>
        )}
      </div>

      {/* 4. ACT 3: The Impact (Flash & Shockwave) */}
      {/* White flash overlay */}
      {phase === 3 && (
        <div className="absolute inset-0 bg-white z-[60] animate-flash-fade pointer-events-none"></div>
      )}
      
      {/* Expanding shockwave ring */}
      {phase >= 3 && phase < 5 && (
        <div className="absolute z-10 w-24 h-24 rounded-full border-4 border-leaf-400 animate-shockwave-ring"></div>
      )}

      {/* 5. ACT 4: The Reveal (Final Brand Logo) */}
      {/* This container sits exactly where the fruit landed */}
      <div className={`relative z-40 flex flex-col items-center justify-center ${phase >= 4 ? 'block' : 'hidden'}`}>
        
        <div className="animate-elastic-scale flex flex-col items-center">
            {/* Main App Icon */}
            <div 
              className={`
                w-28 h-28 rounded-[2rem] flex items-center justify-center mb-8 transition-all duration-1000
                ${phase >= 5 
                  ? 'bg-white shadow-glow-lg text-leaf-600 ring-4 ring-leaf-50' // Final State
                  : 'bg-gradient-to-br from-leaf-600 to-emerald-800 shadow-[0_0_100px_rgba(22,163,74,0.8)] text-white border-4 border-leaf-400' // Impact State
                }
              `}
            >
              <Sprout className="w-14 h-14" />
            </div>

            {/* Brand Text Reveal */}
            <div className="text-center overflow-hidden">
                <h1 
                  className={`
                    text-5xl font-extrabold tracking-tight transition-colors duration-1000
                    ${phase >= 5 ? 'text-earth-900' : 'text-white'}
                  `}
                >
                  Kisan <span className={`transition-colors duration-1000 ${phase >= 5 ? 'text-leaf-600' : 'text-leaf-300'}`}>Setu</span>
                </h1>
                
                <div className={`
                    overflow-hidden transition-all duration-1000 delay-300
                    ${phase >= 5 ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}
                `}>
                    <p className="mt-3 text-sm font-bold tracking-[0.3em] uppercase text-earth-500">
                      Smart Farming AI
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;