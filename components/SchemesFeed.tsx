import React, { useState, useEffect } from 'react';
import { Translation, LanguageCode, SchemeResponse } from '../types';
import { getGovernmentSchemes } from '../services/geminiService';
import {
  Landmark,
  MapPin,
  Search,
  Loader2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  FileText
} from 'lucide-react';

interface Props {
  text: Translation;
  language: LanguageCode;
}

const SchemesFeed: React.FC<Props> = ({ text, language }) => {
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SchemeResponse | null>(null);
  const [expandedScheme, setExpandedScheme] = useState<number | null>(null);

  const handleFetchSchemes = async () => {
    setLoading(true);
    try {
      const result = await getGovernmentSchemes(location, language);
      setData(result);
      setExpandedScheme(null);
    } catch (error) {
      console.error("Failed to fetch schemes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!data) {
      setLoading(true);
      getGovernmentSchemes('India', language)
        .then(setData)
        .finally(() => setLoading(false));
    }
  }, []);

  const toggleExpand = (idx: number) => {
    if (expandedScheme === idx) {
      setExpandedScheme(null);
    } else {
      setExpandedScheme(idx);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-up p-4 md:p-8 md:pt-4 max-w-5xl mx-auto w-full">

      {/* Header & Search */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 dark:from-blue-900 dark:to-indigo-950 rounded-[2.5rem] p-8 mb-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>

        <h2 className="text-3xl font-extrabold mb-2 relative z-10 flex items-center gap-3">
          <Landmark className="w-8 h-8 text-blue-200" />
          {text.schemesTitle}
        </h2>
        <p className="text-blue-100 mb-8 max-w-xl relative z-10 font-medium text-lg opacity-90">{text.schemesSubtitle}</p>

        <div className="relative z-10 flex flex-col md:flex-row gap-3 max-w-2xl bg-white/20 p-2 rounded-3xl backdrop-blur-md border border-white/30">
          <div className="relative flex-1">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
            <input
              type="text"
              placeholder={text.locationPlaceholder}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFetchSchemes()}
              className="w-full bg-transparent border-none outline-none text-white placeholder:text-white/60 pl-12 pr-4 py-3 font-semibold"
            />
          </div>
          <button
            onClick={handleFetchSchemes}
            disabled={loading}
            className="bg-white text-blue-700 px-8 py-3 rounded-2xl font-bold shadow-md hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            {text.fetchSchemes}
          </button>
        </div>
      </div>

      {/* Schemes List */}
      {loading && !data ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-gray-100 dark:bg-slate-800 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {data?.schemes.map((scheme, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-800 rounded-3xl shadow-card border border-earth-100 dark:border-slate-700 overflow-hidden transition-all hover:shadow-depth"
            >
              <div
                onClick={() => toggleExpand(idx)}
                className="p-6 cursor-pointer flex justify-between items-start gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-700 dark:text-blue-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-earth-900 dark:text-white">
                      {scheme.name}
                    </h3>
                  </div>
                  <p className="text-earth-600 dark:text-slate-300 leading-relaxed ml-13 pl-1">
                    {scheme.description}
                  </p>
                </div>
                <button className="p-2 bg-earth-50 dark:bg-slate-700 rounded-full text-earth-500 dark:text-slate-400">
                  {expandedScheme === idx ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              {/* Expanded Details */}
              {expandedScheme === idx && (
                <div className="px-6 pb-6 pt-0 animate-content-show border-t border-earth-100 dark:border-slate-700">
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    {/* Benefits */}
                    <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-5 rounded-2xl">
                      <h4 className="font-bold text-emerald-800 dark:text-emerald-300 mb-3 flex items-center gap-2">
                        {text.benefitsLabel}
                      </h4>
                      <ul className="space-y-2">
                        {scheme.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-earth-700 dark:text-slate-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Steps */}
                    <div className="bg-amber-50/50 dark:bg-amber-900/10 p-5 rounded-2xl">
                      <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
                        {text.stepsLabel}
                      </h4>
                      <ol className="space-y-3">
                        {scheme.stepsToClaim.map((step, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-earth-700 dark:text-slate-300">
                            <span className="w-5 h-5 bg-amber-200 dark:bg-amber-800 rounded-full flex items-center justify-center text-amber-800 dark:text-amber-200 text-xs font-bold shrink-0">
                              {i + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <a
                      href={scheme.officialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
                    >
                      {text.applyLinkBtn} <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchemesFeed;