import React, { useState, useEffect } from 'react';
import { Translation, LanguageCode, NewsResponse, NewsItem } from '../types';
import { getAgriculturalNews } from '../services/geminiService';
import { 
  CloudSun, 
  TrendingUp, 
  Newspaper, 
  AlertTriangle, 
  MapPin, 
  Search, 
  Loader2, 
  ExternalLink,
  Info,
  Calendar,
  Cpu,
  Sprout,
  Flame,
  Globe
} from 'lucide-react';

interface Props {
  text: Translation;
  language: LanguageCode;
}

const NewsFeed: React.FC<Props> = ({ text, language }) => {
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<NewsResponse | null>(null);

  const handleFetchNews = async () => {
    setLoading(true);
    try {
      const result = await getAgriculturalNews(location, language);
      setData(result);
    } catch (error) {
      console.error("Failed to fetch news", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!data) {
        getAgriculturalNews('India', language).then(setData);
    }
  }, []);

  const getCurrentDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    };
    return new Date().toLocaleDateString(language === 'en' ? 'en-US' : `${language}-IN`, options);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Weather': return <CloudSun className="w-5 h-5" />;
      case 'Market': return <TrendingUp className="w-5 h-5" />;
      case 'Accidents': return <Flame className="w-5 h-5" />;
      case 'Technology': return <Cpu className="w-5 h-5" />;
      case 'Crops': return <Sprout className="w-5 h-5" />;
      default: return <Newspaper className="w-5 h-5" />;
    }
  };

  // Helper to get category specific color for tags
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Weather': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Market': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Accidents': return 'bg-red-100 text-red-800 border-red-200';
      case 'Technology': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Crops': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Function to render a single news article block
  const NewsBlock: React.FC<{ item: NewsItem; large?: boolean }> = ({ item, large = false }) => (
    <div className={`
      relative group border-b border-gray-300 dark:border-gray-700 pb-6 mb-6 last:border-0 last:mb-0
      ${large ? 'col-span-full mb-8' : ''}
    `}>
      <div className="flex justify-between items-center mb-2">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getCategoryColor(item.category)}`}>
           {item.category}
        </span>
        {item.date && (
           <span className="text-xs text-gray-500 font-serif italic">{item.date}</span>
        )}
      </div>

      <h3 className={`font-serif font-bold text-gray-900 dark:text-gray-100 leading-tight group-hover:text-red-800 dark:group-hover:text-red-400 transition-colors ${large ? 'text-3xl md:text-4xl mb-4' : 'text-xl mb-2'}`}>
        {item.title}
      </h3>

      {large && (
        <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 mb-4 rounded-sm overflow-hidden relative">
          {/* Placeholder for images if not provided */}
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
             {getCategoryIcon(item.category)}
          </div>
          {/* If we had real images, they would go here. For now, use a thematic gradient/pattern */}
           <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${item.category === 'Accidents' ? 'from-red-500 to-orange-500' : 'from-leaf-500 to-emerald-700'}`}></div>
        </div>
      )}

      <p className={`font-serif text-gray-700 dark:text-gray-300 leading-relaxed ${large ? 'text-lg' : 'text-base'}`}>
        {item.summary}
      </p>

      {item.source && (
        <div className="mt-3 flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
           <Globe className="w-3 h-3" /> {item.source}
           {item.link && (
             <a href={item.link} target="_blank" rel="noopener noreferrer" className="ml-auto text-blue-600 hover:underline flex items-center gap-1">
               Read More <ExternalLink className="w-3 h-3" />
             </a>
           )}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full animate-fade-up max-w-6xl mx-auto w-full bg-[#fdfbf7] dark:bg-[#1a1a1a] min-h-screen">
      
      {/* 1. TOP TICKER - BREAKING NEWS */}
      <div className="bg-red-700 text-white overflow-hidden py-2 relative shadow-md z-10 h-10 flex items-center">
         <div className="flex items-center absolute left-0 top-0 bottom-0 bg-red-800 px-4 z-20 font-bold uppercase tracking-widest text-xs shadow-md">
            <span className="animate-pulse mr-2">●</span> LIVE
         </div>
         
         <div className="w-full overflow-hidden relative">
            <div className="whitespace-nowrap animate-ticker inline-block pl-20 text-sm font-medium text-white">
                {data ? (
                  <div className="inline-flex gap-12">
                     {data.news.map((n, i) => (
                      <span key={i} className="inline-flex items-center gap-2 text-white">
                        <span className="text-red-200 uppercase font-bold text-xs bg-red-800/50 px-2 py-0.5 rounded">[{n.category}]</span> 
                        {n.title}
                      </span>
                     ))}
                  </div>
                ) : (
                  <span className="text-white">Fetching latest agricultural updates from across India... Weather, Markets, Schemes, and more...</span>
                )}
            </div>
         </div>
      </div>

      {/* 2. NEWSPAPER HEADER */}
      <header className="border-b-4 border-double border-gray-800 dark:border-gray-500 py-6 px-4 md:px-8 text-center mb-6 bg-white dark:bg-[#1a1a1a]">
         <div className="flex justify-between items-end border-b border-gray-300 dark:border-gray-700 pb-2 mb-4">
            <span className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-widest">{location || 'India Edition'}</span>
            <span className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-widest">{getCurrentDate()}</span>
            <span className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-widest">Vol. I, No. 1</span>
         </div>
         
         <h1 className="font-serif text-5xl md:text-7xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2 transform scale-y-110">
            The Agri Daily
         </h1>
         <p className="font-serif italic text-gray-600 dark:text-gray-400 text-sm md:text-base">
            "Official Voice of the Indian Farmer - Powered by AI"
         </p>
      </header>

      {/* 3. SEARCH BAR (Styled like a classifieds section) */}
      <div className="px-4 md:px-8 mb-8">
        <div className="max-w-xl mx-auto border-2 border-gray-800 dark:border-gray-500 p-1 flex relative bg-white dark:bg-[#2a2a2a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
           <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
           <input 
             type="text" 
             placeholder={text.locationPlaceholder}
             value={location}
             onChange={(e) => setLocation(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && handleFetchNews()}
             className="w-full pl-10 pr-4 py-2 bg-transparent border-none outline-none font-serif text-lg placeholder:italic text-gray-800 dark:text-white"
           />
           <button 
             onClick={handleFetchNews}
             disabled={loading}
             className="bg-gray-900 dark:bg-white text-white dark:text-black px-6 font-bold uppercase tracking-wider hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
           >
             {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Read'}
           </button>
        </div>
      </div>

      {/* 4. MAIN CONTENT AREA (Columns) */}
      <div className="px-4 md:px-8 pb-12">
        {loading && !data ? (
           <div className="animate-pulse space-y-8">
              <div className="h-64 bg-gray-200 dark:bg-gray-800 w-full rounded-sm"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                 <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                 <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
              </div>
           </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             
             {/* LEFT COLUMN - MAIN STORY (Cols 1-8) */}
             <div className="lg:col-span-8">
               {data?.news.length ? (
                 <>
                   {/* Headline Story */}
                   <NewsBlock item={data.news[0]} large />
                   
                   {/* Sub Stories - 2 Columns */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t-2 border-gray-800 dark:border-gray-500 pt-6 mt-6">
                      {data.news.slice(1, 5).map((item, idx) => (
                         <NewsBlock key={idx} item={item} />
                      ))}
                   </div>
                 </>
               ) : (
                 <div className="text-center py-20 font-serif italic text-gray-500">
                    No news available for this edition. Try searching for a specific district.
                 </div>
               )}
             </div>

             {/* RIGHT COLUMN - SIDEBAR (Cols 9-12) */}
             <div className="lg:col-span-4 border-l-0 lg:border-l border-gray-300 dark:border-gray-700 pl-0 lg:pl-8">
                
                {/* Weather Widget */}
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 p-4 mb-8">
                   <h4 className="font-bold uppercase tracking-widest text-xs text-blue-800 dark:text-blue-300 border-b border-blue-200 pb-2 mb-2 flex items-center gap-2">
                     <CloudSun className="w-4 h-4" /> Weather Outlook
                   </h4>
                   <div className="text-center py-4">
                      {data?.news.find(n => n.category === 'Weather') ? (
                         <div className="font-serif italic text-gray-700 dark:text-gray-300">
                            "{data.news.find(n => n.category === 'Weather')?.summary}"
                         </div>
                      ) : (
                        <div className="text-gray-400 italic text-sm">See main reports for forecast</div>
                      )}
                   </div>
                </div>

                {/* Market Ticker (Vertical) */}
                <div className="mb-8">
                   <h4 className="font-bold uppercase tracking-widest text-xs text-gray-500 border-b-2 border-black dark:border-white pb-1 mb-4">
                      Market Watch
                   </h4>
                   <div className="space-y-4">
                      {data?.news.filter(n => n.category === 'Market').slice(0, 3).map((item, idx) => (
                        <div key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-2">
                           <span className="text-emerald-700 font-bold text-xs uppercase block mb-1">↑ Trending</span>
                           <a href={item.link || '#'} className="font-serif font-bold hover:underline text-sm block leading-snug text-gray-800 dark:text-white">
                             {item.title}
                           </a>
                        </div>
                      ))}
                      {(!data?.news.filter(n => n.category === 'Market').length) && (
                        <span className="text-xs text-gray-500 italic">No specific market data in top stories.</span>
                      )}
                   </div>
                </div>

                {/* Remaining Stories List */}
                <div>
                   <h4 className="font-bold uppercase tracking-widest text-xs text-gray-500 border-b-2 border-black dark:border-white pb-1 mb-4">
                      In Other News
                   </h4>
                   <ul className="space-y-4">
                      {data?.news.slice(5).map((item, idx) => (
                        <li key={idx}>
                           <span className="text-[10px] font-bold text-gray-400 uppercase">{item.category}</span>
                           <h5 className="font-serif font-medium text-sm hover:text-red-700 cursor-pointer leading-tight mt-0.5 text-gray-800 dark:text-gray-300">
                             {item.title}
                           </h5>
                        </li>
                      ))}
                   </ul>
                </div>

             </div>
          </div>
        )}

        {/* 5. FOOTER / SOURCES */}
        {data?.sources && data.sources.length > 0 && (
          <div className="mt-12 border-t-4 border-gray-800 dark:border-gray-500 pt-6">
            <h4 className="text-center font-bold uppercase tracking-widest text-xs text-gray-500 mb-4">
               Data Sourced From Official Channels
            </h4>
            <div className="flex flex-wrap justify-center gap-4 text-xs font-serif italic text-gray-600 dark:text-gray-400">
               {data.sources.map((source, idx) => (
                 <a 
                   key={idx}
                   href={source.uri}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="flex items-center gap-1 hover:text-black dark:hover:text-white hover:underline"
                 >
                   <Globe className="w-3 h-3" /> {source.title}
                   {idx < data.sources.length - 1 && <span className="no-underline ml-4 text-gray-300">|</span>}
                 </a>
               ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsFeed;