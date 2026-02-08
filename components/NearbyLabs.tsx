import React, { useState, useEffect } from 'react';
import { Translation, LanguageCode, LabItem } from '../types';
import { findNearbyPlaces } from '../services/geminiService';
import { ChevronLeft, MapPin, FlaskConical, Building2, Navigation, Star, Loader2, AlertCircle, Search, LocateFixed } from 'lucide-react';

interface Props {
   text: Translation;
   language: LanguageCode;
   onBack: () => void;
}

const NearbyLabs: React.FC<Props> = ({ text, language, onBack }) => {
   const [loading, setLoading] = useState(true);
   const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
   const [searchLocation, setSearchLocation] = useState<string>('');
   const [places, setPlaces] = useState<LabItem[]>([]);
   const [mapCategory, setMapCategory] = useState<'labs' | 'kendras'>('labs');
   const [hasLocation, setHasLocation] = useState(false);

   useEffect(() => {
      attemptGeolocation();
   }, [language]);

   const attemptGeolocation = () => {
      setLoading(true);
      if (!navigator.geolocation) {
         setLoading(false);
         return;
      }

      navigator.geolocation.getCurrentPosition(
         async (position) => {
            const { latitude, longitude } = position.coords;
            setCoords({ lat: latitude, lng: longitude });
            setHasLocation(true);
            fetchPlaces({ lat: latitude, lng: longitude });
         },
         (err) => {
            console.warn("Geolocation denied or failed", err);
            setLoading(false);
            // Don't show blocking error, just allow manual search
         }
      );
   };

   const fetchPlaces = async (loc: string | { lat: number; lng: number }) => {
      setLoading(true);
      try {
         const results = await findNearbyPlaces(loc, language);
         setPlaces(results);
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
   };

   const handleManualSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if (searchLocation.trim()) {
         setHasLocation(true);
         setCoords(null); // Clear exact coords to rely on search term
         fetchPlaces(searchLocation);
      }
   };

   const labs = places.filter(p => p.type === 'Lab' || p.type.toLowerCase().includes('lab') || p.name.toLowerCase().includes('lab'));
   const centers = places.filter(p => !labs.includes(p));

   const getMapQuery = () => {
      const categoryQuery = mapCategory === 'labs' ? 'Soil Testing Laboratory' : 'Krushi Seva Kendra';

      if (coords) {
         return `${categoryQuery} near ${coords.lat},${coords.lng}`;
      } else if (searchLocation) {
         return `${categoryQuery} near ${searchLocation}`;
      }
      return '';
   };

   return (
      <div className="flex flex-col h-full animate-fade-up w-full bg-[#fdfbf7] dark:bg-slate-900 absolute inset-0 z-20 overflow-y-auto">

         {/* Header */}
         <div className="sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-30 px-6 py-4 border-b border-earth-200 dark:border-slate-700 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
               <button
                  onClick={onBack}
                  className="p-2 hover:bg-earth-100 dark:hover:bg-slate-800 rounded-full transition-colors"
               >
                  <ChevronLeft className="w-6 h-6 text-earth-600 dark:text-slate-300" />
               </button>
               <div>
                  <h2 className="text-xl font-bold text-earth-900 dark:text-white hidden md:block">{text.nearbyLabsTitle}</h2>
                  <p className="text-xs text-earth-500 dark:text-slate-400 hidden md:block">{text.nearbyLabsSubtitle}</p>
               </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleManualSearch} className="flex-1 max-w-md flex items-center gap-2">
               <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-400" />
                  <input
                     type="text"
                     placeholder={text.enterLocation || "Enter your city/district"}
                     value={searchLocation}
                     onChange={(e) => setSearchLocation(e.target.value)}
                     className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-earth-200 dark:border-slate-600 rounded-full text-sm outline-none focus:ring-2 focus:ring-leaf-500"
                  />
               </div>
               <button
                  type="submit"
                  className="p-2 bg-leaf-600 text-white rounded-full hover:bg-leaf-700 disabled:opacity-50"
                  disabled={loading}
               >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
               </button>
               <button
                  type="button"
                  onClick={attemptGeolocation}
                  className="p-2 text-earth-500 hover:bg-earth-100 dark:hover:bg-slate-800 rounded-full"
                  title="Use current location"
               >
                  <LocateFixed className="w-5 h-5" />
               </button>
            </form>
         </div>

         {/* Main Content */}
         <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto w-full">

            {!hasLocation && !loading ? (
               <div className="flex flex-col items-center justify-center py-20 text-center animate-pop-in">
                  <div className="w-24 h-24 bg-leaf-50 dark:bg-leaf-900/20 rounded-full flex items-center justify-center mb-6">
                     <MapPin className="w-12 h-12 text-leaf-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-earth-800 dark:text-white mb-2">{text.allowLocation}</h3>
                  <p className="text-earth-600 dark:text-slate-400 max-w-sm mb-6">
                     Enter your location manually above or allow location access to find soil testing labs near you.
                  </p>
                  <button
                     onClick={() => document.querySelector('input')?.focus()}
                     className="px-6 py-3 bg-leaf-600 text-white font-bold rounded-xl hover:bg-leaf-700 transition-colors shadow-lg"
                  >
                     Enter Location Manually
                  </button>
               </div>
            ) : (
               <>
                  {/* Map Controls */}
                  <div className="flex gap-2 justify-center">
                     <button
                        onClick={() => setMapCategory('labs')}
                        className={`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-all ${mapCategory === 'labs'
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-white dark:bg-slate-800 text-earth-600 dark:text-slate-300 border border-earth-200 dark:border-slate-700'
                           }`}
                     >
                        <FlaskConical className="w-4 h-4" /> {text.labsSection}
                     </button>
                     <button
                        onClick={() => setMapCategory('kendras')}
                        className={`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-all ${mapCategory === 'kendras'
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'bg-white dark:bg-slate-800 text-earth-600 dark:text-slate-300 border border-earth-200 dark:border-slate-700'
                           }`}
                     >
                        <Building2 className="w-4 h-4" /> {text.kendrasSection}
                     </button>
                  </div>

                  {/* Map Section */}
                  <div className="w-full h-64 md:h-96 bg-gray-200 dark:bg-slate-800 rounded-3xl overflow-hidden shadow-card border border-earth-100 dark:border-slate-700 relative">
                     {getMapQuery() ? (
                        <iframe
                           key={mapCategory + (searchLocation || 'coords')} // Force re-render on changes
                           width="100%"
                           height="100%"
                           style={{ border: 0 }}
                           loading="lazy"
                           allowFullScreen
                           referrerPolicy="no-referrer-when-downgrade"
                           src={`https://maps.google.com/maps?q=${encodeURIComponent(getMapQuery())}&t=&z=12&ie=UTF8&iwloc=&output=embed`}
                           className="dark:filter dark:invert dark:hue-rotate-180"
                        ></iframe>
                     ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-earth-100 dark:bg-slate-800">
                           <div className="flex flex-col items-center animate-pulse">
                              <MapPin className="w-10 h-10 text-leaf-500 mb-2" />
                              <p className="text-earth-500 font-bold">{text.locating}</p>
                           </div>
                        </div>
                     )}
                  </div>

                  {/* Loading State for List */}
                  {loading && (
                     <div className="flex items-center justify-center py-10">
                        <Loader2 className="w-8 h-8 text-leaf-600 animate-spin" />
                        <span className="ml-3 font-bold text-earth-600 dark:text-slate-400">{text.nearbyLabsSubtitle}</span>
                     </div>
                  )}

                  {/* Results List */}
                  {!loading && (
                     <div className="grid md:grid-cols-2 gap-8">

                        {/* Labs Column */}
                        <div className={`transition-opacity duration-300 ${mapCategory === 'labs' ? 'opacity-100' : 'opacity-50 md:opacity-100'}`}>
                           <h3 className="text-lg font-bold text-earth-900 dark:text-white mb-4 flex items-center gap-2">
                              <FlaskConical className="w-5 h-5 text-blue-600" /> {text.labsSection}
                           </h3>
                           <div className="space-y-4">
                              {labs.length > 0 ? labs.map((item, i) => (
                                 <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-earth-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                                    <h4 className="font-bold text-earth-800 dark:text-white">{item.name}</h4>
                                    <p className="text-sm text-earth-500 dark:text-slate-400 mt-1 mb-3">{item.address}</p>
                                    <div className="flex items-center justify-between">
                                       <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">
                                          <Star className="w-3 h-3 fill-current" /> {item.rating || 'N/A'}
                                       </span>
                                       <a
                                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ' ' + item.address)}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                       >
                                          <Navigation className="w-3 h-3" /> {text.getDirections}
                                       </a>
                                    </div>
                                 </div>
                              )) : (
                                 <p className="text-sm text-earth-500 italic p-4 bg-earth-50 dark:bg-slate-800 rounded-xl">No specific labs found. Check the map above.</p>
                              )}
                           </div>
                        </div>

                        {/* Centers Column */}
                        <div className={`transition-opacity duration-300 ${mapCategory === 'kendras' ? 'opacity-100' : 'opacity-50 md:opacity-100'}`}>
                           <h3 className="text-lg font-bold text-earth-900 dark:text-white mb-4 flex items-center gap-2">
                              <Building2 className="w-5 h-5 text-emerald-600" /> {text.kendrasSection}
                           </h3>
                           <div className="space-y-4">
                              {centers.length > 0 ? centers.map((item, i) => (
                                 <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-earth-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                                    <h4 className="font-bold text-earth-800 dark:text-white">{item.name}</h4>
                                    <p className="text-sm text-earth-500 dark:text-slate-400 mt-1 mb-3">{item.address}</p>
                                    <div className="flex items-center justify-between">
                                       <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">
                                          <Star className="w-3 h-3 fill-current" /> {item.rating || 'N/A'}
                                       </span>
                                       <a
                                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ' ' + item.address)}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                       >
                                          <Navigation className="w-3 h-3" /> {text.getDirections}
                                       </a>
                                    </div>
                                 </div>
                              )) : (
                                 <p className="text-sm text-earth-500 italic p-4 bg-earth-50 dark:bg-slate-800 rounded-xl">No centers found. Check the map above.</p>
                              )}
                           </div>
                        </div>

                     </div>
                  )}
               </>
            )}
         </div>
      </div>
   );
};

export default NearbyLabs;