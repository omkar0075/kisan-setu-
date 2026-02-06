import React, { useState } from 'react';
import { Translation, AnalysisResponse, ExtractedParameter, CropSuggestion } from '../types';
import { 
  RotateCcw, Leaf, CloudSun, Droplets, Sprout, 
  TrendingUp, Hammer, MapPin, ChevronDown, ChevronUp, Beaker, CheckCircle2,
  ShieldAlert, Bug, Stethoscope, Download, Loader2
} from 'lucide-react';

interface Props {
  text: Translation;
  data: AnalysisResponse;
  onRetry: () => void;
}

// Reusable components for dashboard
interface CardProps {
  children?: React.ReactNode;
  className?: string;
  delay?: number;
}

const Card: React.FC<CardProps> = ({ children, className = "", delay = 0 }) => (
  <div 
    className={`bg-white dark:bg-slate-800 rounded-3xl shadow-card border border-earth-100 dark:border-slate-700 overflow-hidden hover:shadow-depth hover:-translate-y-2 transition-all duration-500 animate-fade-up print:shadow-none print:border print:break-inside-avoid ${className}`}
    style={{ animationDelay: `${delay}ms` }}
  >
    {children}
  </div>
);

const DetailCard: React.FC<{ param: ExtractedParameter; label?: string; delay?: number }> = ({ param, label, delay = 0 }) => {
  if (!param) return null;
  
  const s = param.status ? param.status.toLowerCase() : 'unknown';
  let colorTheme = { 
    bg: 'bg-gray-50 dark:bg-slate-700', 
    text: 'text-gray-700 dark:text-slate-200', 
    border: 'border-gray-100 dark:border-slate-600', 
    dot: 'bg-gray-400',
    shadow: 'shadow-sm'
  };
  
  if (s.includes('high')) colorTheme = { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', border: 'border-red-100 dark:border-red-900/50', dot: 'bg-red-500', shadow: 'shadow-red-500/10' };
  if (s.includes('low') || s.includes('deficient')) colorTheme = { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-100 dark:border-amber-900/50', dot: 'bg-amber-500', shadow: 'shadow-amber-500/10' };
  if (s.includes('normal') || s.includes('medium') || s.includes('sufficient')) colorTheme = { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-100 dark:border-emerald-900/50', dot: 'bg-emerald-500', shadow: 'shadow-emerald-500/10' };

  const displayLabel = label || param.name || 'Parameter';

  return (
    <div 
      className={`flex flex-col p-4 rounded-2xl border ${colorTheme.border} ${colorTheme.bg} transition-all duration-300 hover:scale-105 shadow-md hover:shadow-xl ${colorTheme.shadow} animate-pop-in cursor-default print:break-inside-avoid print:shadow-none`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-bold text-earth-500 dark:text-slate-400 uppercase tracking-wider truncate pr-2" title={displayLabel}>{displayLabel}</span>
        <div className={`w-2 h-2 rounded-full ${colorTheme.dot} shrink-0 mt-1 shadow-[0_0_8px_currentColor] opacity-80 print:shadow-none`}></div>
      </div>
      <div className="flex items-baseline gap-1 mt-auto">
        <span className={`text-xl font-bold ${colorTheme.text} drop-shadow-sm`}>{param.value || '-'}</span>
        <span className="text-xs text-earth-400 dark:text-slate-500 font-medium">{param.unit}</span>
      </div>
      <span className={`text-xs font-semibold mt-1 ${colorTheme.text} opacity-80`}>{param.status || 'Unknown'}</span>
    </div>
  );
};

const AnalysisResult: React.FC<Props> = ({ text, data, onRetry }) => {
  const { narrative, raw_data, extracted_location } = data;
  const [showRawData, setShowRawData] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    
    // 1. Temporarily show Raw Data so it renders in the PDF
    const wasRawDataShown = showRawData;
    if (!wasRawDataShown) setShowRawData(true);

    // 2. Wait for React to render the expanded section (and images to load)
    setTimeout(async () => {
      const element = document.getElementById('report-content');
      
      if (element) {
        // Handle Dark Mode for PDF
        // html2pdf snapshots exactly what is on screen. 
        // If the user is in Dark Mode, the PDF will be dark. 
        // We want a clean white paper report usually.
        // Strategy: Temporarily switch app to light mode for the snapshot.
        const isDark = document.documentElement.classList.contains('dark');
        if (isDark) {
            document.documentElement.classList.remove('dark');
        }

        const opt = {
          margin: [10, 10], // top/bottom, left/right
          filename: `KisanSetu_Report_${extracted_location.replace(/[^a-zA-Z0-9]/g, '_') || 'Analysis'}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 2, // Higher scale for better text quality
            useCORS: true, 
            scrollY: 0,
            logging: false,
            // Force white background for the snapshot to avoid transparent/dark artifacts
            backgroundColor: '#ffffff'
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        try {
          if ((window as any).html2pdf) {
            await (window as any).html2pdf().set(opt).from(element).save();
          } else {
            console.error("html2pdf library not loaded");
            window.print(); // Fallback
          }
        } catch (error) {
          console.error("PDF Generation failed:", error);
          alert("Could not generate PDF file. Please try printing manually.");
        } finally {
          // Restore original state
          if (isDark) {
             document.documentElement.classList.add('dark');
          }
          if (!wasRawDataShown) setShowRawData(false);
          setIsDownloading(false);
        }
      } else {
        setIsDownloading(false);
      }
    }, 800); // 800ms to allow animations/transitions to settle
  };

  return (
    <div className="min-h-screen pb-20 print:pb-0 print:bg-white">
      {/* Print Styles for Fallback */}
      <style>{`
        @media print {
          @page { margin: 15px; }
          body { 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
            background-color: white !important;
            color: black !important;
          }
          .no-print { display: none !important; }
          .print-break-avoid { break-inside: avoid; }
        }
      `}</style>

      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-earth-200 dark:border-slate-800 shadow-lg transition-colors duration-300 print:static print:shadow-none print:bg-white print:border-b-2 print:border-black">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
             <div className="w-9 h-9 bg-leaf-100 dark:bg-leaf-900/30 rounded-xl flex items-center justify-center text-leaf-700 dark:text-leaf-400 shadow-sm border border-leaf-200 dark:border-leaf-800 print:border-none">
               <Leaf className="w-5 h-5" /> 
             </div>
             <h1 className="text-xl font-bold text-earth-800 dark:text-white drop-shadow-sm print:text-black">{text.resultsTitle}</h1>
          </div>
          
          <div className="flex items-center gap-3 no-print" data-html2canvas-ignore="true">
            <button
              onClick={onRetry}
              className="px-4 py-2 text-earth-600 dark:text-slate-300 hover:bg-earth-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> <span className="hidden sm:inline">{text.retry}</span>
            </button>
            
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-5 py-2 bg-leaf-600 hover:bg-leaf-700 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all active:scale-95 text-sm flex items-center gap-2"
            >
              {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span className="hidden sm:inline">{text.downloadReport}</span>
            </button>
          </div>
        </div>
      </header>

      <div id="report-content" className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-fade-up">
        
        {/* Header Summary Card */}
        <div className="bg-gradient-to-br from-leaf-50 to-emerald-50 dark:from-slate-800 dark:to-slate-900 rounded-[2rem] p-8 border border-leaf-100 dark:border-slate-700 shadow-sm relative overflow-hidden print:border print:border-black">
           <div className="absolute top-0 right-0 w-64 h-64 bg-leaf-200/20 dark:bg-leaf-900/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
           
           <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                 <div>
                    <h2 className="text-3xl font-black text-earth-900 dark:text-white mb-2 tracking-tight">Soil Health Analysis</h2>
                    <div className="flex items-center gap-2 text-earth-600 dark:text-slate-400 font-medium">
                       <MapPin className="w-5 h-5 text-leaf-600" />
                       {extracted_location || "Unknown Region"}
                    </div>
                 </div>
                 <div className="flex items-center gap-3 bg-white/60 dark:bg-black/20 p-3 rounded-2xl backdrop-blur-sm border border-white/40 dark:border-white/10">
                    <CloudSun className="w-10 h-10 text-amber-500" />
                    <div className="text-sm">
                       <p className="font-bold text-earth-800 dark:text-slate-200">Current Weather Context</p>
                       <p className="text-earth-500 dark:text-slate-400 text-xs">Based on location & season</p>
                    </div>
                 </div>
              </div>
              
              <div className="prose prose-lg dark:prose-invert max-w-none">
                 <p className="text-earth-700 dark:text-slate-300 leading-relaxed font-serif text-lg">
                   {narrative.soil_condition_summary}
                 </p>
              </div>
           </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <DetailCard param={raw_data.ph} label="pH Level" delay={100} />
           <DetailCard param={raw_data.ec} label="EC (Conductivity)" delay={200} />
           <DetailCard param={raw_data.oc} label="Organic Carbon" delay={300} />
           <DetailCard param={raw_data.nitrogen} label="Nitrogen (N)" delay={400} />
        </div>

        {/* Toggle Raw Data Accordion */}
        <div className="no-print" data-html2canvas-ignore="true">
           <button 
             onClick={() => setShowRawData(!showRawData)}
             className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-earth-100 dark:border-slate-700 text-earth-600 dark:text-slate-300 font-bold hover:bg-earth-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
           >
              <span className="flex items-center gap-2"><Beaker className="w-5 h-5" /> View Full Parameter List</span>
              {showRawData ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
           </button>
        </div>

        {/* Expandable Raw Data Section */}
        {showRawData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-content-show p-4 bg-earth-50 dark:bg-slate-800/50 rounded-3xl border border-earth-100 dark:border-slate-700">
             <DetailCard param={raw_data.phosphorus} label="Phosphorus (P)" />
             <DetailCard param={raw_data.potassium} label="Potassium (K)" />
             {raw_data.secondary?.map((p, i) => <DetailCard key={i} param={p} />)}
             {raw_data.micronutrients?.map((p, i) => <DetailCard key={i} param={p} />)}
          </div>
        )}

        {/* 2-Column Action Plan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:block print:space-y-8">
           
           {/* Column 1: Improvements */}
           <div className="space-y-8">
              
              {/* Fertilizer Plan */}
              <Card className="p-6 md:p-8 bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-800 dark:to-slate-800">
                 <h3 className="text-xl font-bold text-earth-900 dark:text-white mb-6 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600"><Beaker className="w-6 h-6" /></div>
                    Fertilizer Recommendations
                 </h3>
                 
                 <div className="space-y-6">
                    <div>
                       <h4 className="text-sm font-bold text-earth-500 uppercase tracking-wider mb-3">Organic Options</h4>
                       <ul className="space-y-3">
                          {narrative.fertilizer_recommendations.organic.map((item, i) => (
                             <li key={i} className="flex items-start gap-3 text-earth-700 dark:text-slate-300 text-sm">
                                <Leaf className="w-5 h-5 text-leaf-500 shrink-0 mt-0.5" />
                                <span>{item}</span>
                             </li>
                          ))}
                       </ul>
                    </div>
                    <div className="w-full h-px bg-earth-100 dark:bg-slate-700"></div>
                    <div>
                       <h4 className="text-sm font-bold text-earth-500 uppercase tracking-wider mb-3">Chemical Brands</h4>
                       <ul className="space-y-3">
                          {narrative.fertilizer_recommendations.chemical.map((item, i) => (
                             <li key={i} className="flex items-start gap-3 text-earth-700 dark:text-slate-300 text-sm">
                                <Beaker className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                <span>{item}</span>
                             </li>
                          ))}
                       </ul>
                    </div>
                 </div>
              </Card>

              {/* Maintenance & Irrigation */}
              <Card className="p-6 md:p-8">
                 <h3 className="text-xl font-bold text-earth-900 dark:text-white mb-6 flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600"><Hammer className="w-6 h-6" /></div>
                    Soil Maintenance
                 </h3>
                 <ul className="space-y-4 mb-8">
                    {narrative.soil_maintenance.map((tip, i) => (
                       <li key={i} className="flex items-start gap-3 text-earth-700 dark:text-slate-300">
                          <CheckCircle2 className="w-5 h-5 text-leaf-500 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{tip}</span>
                       </li>
                    ))}
                 </ul>

                 <h4 className="font-bold text-earth-900 dark:text-white mb-3 flex items-center gap-2 text-lg border-t border-earth-100 dark:border-slate-700 pt-6">
                    <Droplets className="w-5 h-5 text-cyan-500" /> Irrigation
                 </h4>
                 <p className="text-earth-600 dark:text-slate-400 leading-relaxed text-sm">
                    {narrative.irrigation_requirements}
                 </p>
              </Card>

           </div>

           {/* Column 2: Crops & Yield */}
           <div className="space-y-8">
              
              {/* Crop Suggestions */}
              <Card className="p-6 md:p-8 border-t-4 border-t-leaf-500">
                 <h3 className="text-xl font-bold text-earth-900 dark:text-white mb-6 flex items-center gap-3">
                    <div className="p-2 bg-leaf-100 dark:bg-leaf-900/30 rounded-lg text-leaf-600"><Sprout className="w-6 h-6" /></div>
                    Recommended Crops
                 </h3>
                 <div className="space-y-4">
                    {narrative.crop_suggestions.map((crop, i) => (
                       <div key={i} className="bg-earth-50 dark:bg-slate-700/50 rounded-2xl p-4 border border-earth-100 dark:border-slate-600">
                          <h4 className="font-bold text-lg text-earth-800 dark:text-white mb-1">{crop.crop}</h4>
                          <p className="text-sm text-earth-600 dark:text-slate-400 leading-relaxed">{crop.reasoning}</p>
                       </div>
                    ))}
                 </div>
              </Card>

              {/* Disease Prediction */}
              {narrative.disease_prediction && narrative.disease_prediction.length > 0 && (
                <Card className="p-6 md:p-8 border-t-4 border-t-red-400 bg-red-50/30 dark:bg-red-900/10">
                   <h3 className="text-xl font-bold text-earth-900 dark:text-white mb-6 flex items-center gap-3">
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600"><ShieldAlert className="w-6 h-6" /></div>
                      {text.diseaseRisksTitle}
                   </h3>
                   <div className="space-y-6">
                      {narrative.disease_prediction.map((disease, i) => (
                         <div key={i} className="relative pl-6 border-l-2 border-red-200 dark:border-red-800">
                            <h4 className="font-bold text-red-700 dark:text-red-400 text-lg flex items-center gap-2">
                               <Bug className="w-4 h-4" /> {disease.disease_name}
                            </h4>
                            <p className="text-sm text-earth-600 dark:text-slate-400 mt-1 mb-2 italic">
                               "{disease.likelihood_reason}"
                            </p>
                            <div className="flex gap-2 items-start mt-2">
                               <Stethoscope className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                               <ul className="text-sm text-earth-700 dark:text-slate-300 space-y-1">
                                  {disease.preventative_measures.map((measure, idx) => (
                                     <li key={idx}>• {measure}</li>
                                  ))}
                               </ul>
                            </div>
                         </div>
                      ))}
                   </div>
                </Card>
              )}

              {/* Yield Tips */}
              <Card className="p-6 md:p-8 bg-amber-50/50 dark:bg-amber-900/10">
                 <h3 className="text-xl font-bold text-earth-900 dark:text-white mb-6 flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600"><TrendingUp className="w-6 h-6" /></div>
                    Yield Boosters
                 </h3>
                 <ul className="space-y-3">
                    {narrative.production_increase_tips.map((tip, i) => (
                       <li key={i} className="flex items-start gap-3 text-earth-700 dark:text-slate-300 text-sm">
                          <span className="w-6 h-6 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center text-amber-800 dark:text-amber-100 text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                          <span className="pt-0.5">{tip}</span>
                       </li>
                    ))}
                 </ul>
              </Card>

           </div>

        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;