import React from 'react';
import { Translation } from '../types';
import { ChevronLeft, Sprout, Search, Shovel, Layers, Combine, PackageCheck, FlaskConical } from 'lucide-react';

interface Props {
  text: Translation;
  onBack: () => void;
  onFindLabs?: () => void;
}

const SoilTestingGuide: React.FC<Props> = ({ text, onBack, onFindLabs }) => {
  return (
    <div className="flex flex-col h-full animate-fade-up max-w-5xl mx-auto w-full p-4 md:p-8">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-earth-200 dark:border-slate-700 hover:bg-earth-50 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-earth-600 dark:text-slate-300" />
        </button>
        <div>
           <h2 className="text-3xl font-extrabold text-earth-900 dark:text-white leading-tight">
             {text.guideTitle}
           </h2>
           <p className="text-earth-500 dark:text-slate-400 font-medium">{text.guideSubtitle}</p>
        </div>
      </div>

      <div className="space-y-8 pb-12">
        
        {/* Why Test Section */}
        <div className="bg-gradient-to-br from-leaf-50 to-emerald-50 dark:from-leaf-900/20 dark:to-emerald-900/20 rounded-[2.5rem] p-8 border border-leaf-100 dark:border-leaf-800/50">
           <div className="flex items-start gap-4">
              <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-leaf-600 dark:text-leaf-400">
                 <FlaskConical className="w-8 h-8" />
              </div>
              <div>
                 <h3 className="text-xl font-bold text-earth-900 dark:text-white mb-2">{text.whyTestTitle}</h3>
                 <p className="text-earth-700 dark:text-slate-300 leading-relaxed text-lg">
                   {text.whyTestDesc}
                 </p>
              </div>
           </div>
        </div>

        {/* Steps Section */}
        <div>
           <h3 className="text-2xl font-bold text-earth-900 dark:text-white mb-6 flex items-center gap-2">
             <Search className="w-6 h-6 text-leaf-600" /> {text.howToSampleTitle}
           </h3>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Step 1 */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-earth-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-700 dark:text-amber-400 font-bold text-xl">1</div>
                    <div className="flex-1 h-px bg-earth-100 dark:bg-slate-700"></div>
                    <Shovel className="w-6 h-6 text-earth-400" />
                 </div>
                 <h4 className="text-lg font-bold text-earth-800 dark:text-white mb-2">{text.step1Title}</h4>
                 <p className="text-earth-600 dark:text-slate-400">{text.step1Desc}</p>
              </div>

              {/* Step 2 */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-earth-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-xl">2</div>
                    <div className="flex-1 h-px bg-earth-100 dark:bg-slate-700"></div>
                    <Layers className="w-6 h-6 text-earth-400" />
                 </div>
                 <h4 className="text-lg font-bold text-earth-800 dark:text-white mb-2">{text.step2Title}</h4>
                 <p className="text-earth-600 dark:text-slate-400">{text.step2Desc}</p>
              </div>

              {/* Step 3 */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-earth-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-700 dark:text-purple-400 font-bold text-xl">3</div>
                    <div className="flex-1 h-px bg-earth-100 dark:bg-slate-700"></div>
                    <Combine className="w-6 h-6 text-earth-400" />
                 </div>
                 <h4 className="text-lg font-bold text-earth-800 dark:text-white mb-2">{text.step3Title}</h4>
                 <p className="text-earth-600 dark:text-slate-400">{text.step3Desc}</p>
              </div>

              {/* Step 4 */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-earth-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center text-rose-700 dark:text-rose-400 font-bold text-xl">4</div>
                    <div className="flex-1 h-px bg-earth-100 dark:bg-slate-700"></div>
                    <PackageCheck className="w-6 h-6 text-earth-400" />
                 </div>
                 <h4 className="text-lg font-bold text-earth-800 dark:text-white mb-2">{text.step4Title}</h4>
                 <p className="text-earth-600 dark:text-slate-400">{text.step4Desc}</p>
              </div>
           </div>
        </div>

        {/* Find Labs CTA */}
        {onFindLabs && (
          <div className="mt-8 text-center">
             <button 
               onClick={onFindLabs}
               className="inline-flex items-center gap-2 px-8 py-4 bg-earth-800 dark:bg-white text-white dark:text-black rounded-2xl font-bold hover:opacity-90 transition-opacity shadow-lg"
             >
               <Search className="w-5 h-5" /> {text.findLabBtn}
             </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default SoilTestingGuide;