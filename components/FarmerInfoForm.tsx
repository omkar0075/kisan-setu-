import React, { useState } from 'react';
import { Translation, FarmerDetails } from '../types';
import { SOIL_TYPES, SOIL_TEXTURES, SOIL_COLORS } from '../constants';
import { MapPin, Sprout, Layers, Palette, ChevronLeft, Check, User } from 'lucide-react';

interface Props {
  text: Translation;
  onSubmit: (details: FarmerDetails) => void;
  onBack: () => void;
}

const FarmerInfoForm: React.FC<Props> = ({ text, onSubmit, onBack }) => {
  const [form, setForm] = useState<FarmerDetails>({
    village: '',
    taluka: '',
    district: '',
    state: '',
    crop: '',
    soilType: SOIL_TYPES[0],
    soilTexture: SOIL_TEXTURES[1],
    soilColor: SOIL_COLORS[0],
  });

  const handleChange = (field: keyof FarmerDetails, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="min-h-screen bg-earth-50 dark:bg-slate-900 p-4 pb-20 flex items-center justify-center">
      <div className="max-w-3xl w-full bg-white dark:bg-slate-800 rounded-[2rem] shadow-depth p-10 border border-earth-100 dark:border-slate-700 animate-fade-up">
        <h2 className="text-3xl font-bold text-earth-900 dark:text-white mb-8 flex items-center gap-4 pb-6 border-b border-earth-100 dark:border-slate-700">
          <div className="p-3 bg-leaf-100 dark:bg-leaf-900/40 rounded-2xl text-leaf-600 dark:text-leaf-400 shadow-sm">
             <User className="w-8 h-8" />
          </div>
          {text.title} - {text.subtitle}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Location Section */}
          <div className="bg-earth-50 dark:bg-slate-900/50 p-8 rounded-3xl border border-earth-100 dark:border-slate-700 hover:border-leaf-200 dark:hover:border-leaf-800 transition-colors duration-300 shadow-inner">
            <h3 className="text-xl font-bold text-earth-800 dark:text-white mb-6 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-leaf-600" /> Location Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="text-sm font-bold text-earth-600 dark:text-slate-400 mb-2 block">{text.village}</label>
                <input required type="text" value={form.village} onChange={e => handleChange('village', e.target.value)} className="w-full p-4 bg-white dark:bg-slate-800 border border-earth-300 dark:border-slate-600 rounded-2xl focus:border-leaf-500 focus:ring-4 focus:ring-leaf-500/10 outline-none transition-all dark:text-white hover:shadow-sm focus:shadow-md" />
              </div>
              <div className="group">
                <label className="text-sm font-bold text-earth-600 dark:text-slate-400 mb-2 block">{text.taluka}</label>
                <input required type="text" value={form.taluka} onChange={e => handleChange('taluka', e.target.value)} className="w-full p-4 bg-white dark:bg-slate-800 border border-earth-300 dark:border-slate-600 rounded-2xl focus:border-leaf-500 focus:ring-4 focus:ring-leaf-500/10 outline-none transition-all dark:text-white hover:shadow-sm focus:shadow-md" />
              </div>
              <div className="group">
                <label className="text-sm font-bold text-earth-600 dark:text-slate-400 mb-2 block">{text.district}</label>
                <input required type="text" value={form.district} onChange={e => handleChange('district', e.target.value)} className="w-full p-4 bg-white dark:bg-slate-800 border border-earth-300 dark:border-slate-600 rounded-2xl focus:border-leaf-500 focus:ring-4 focus:ring-leaf-500/10 outline-none transition-all dark:text-white hover:shadow-sm focus:shadow-md" />
              </div>
              <div className="group">
                <label className="text-sm font-bold text-earth-600 dark:text-slate-400 mb-2 block">{text.state}</label>
                <input required type="text" value={form.state} onChange={e => handleChange('state', e.target.value)} className="w-full p-4 bg-white dark:bg-slate-800 border border-earth-300 dark:border-slate-600 rounded-2xl focus:border-leaf-500 focus:ring-4 focus:ring-leaf-500/10 outline-none transition-all dark:text-white hover:shadow-sm focus:shadow-md" />
              </div>
            </div>
          </div>

          {/* Crop Section */}
          <div className="group">
             <label className="text-sm font-bold text-earth-600 dark:text-slate-400 mb-2 block flex items-center gap-2">
               <Sprout className="w-5 h-5" /> {text.crop}
             </label>
             <input 
               required 
               type="text" 
               placeholder="e.g., Cotton, Wheat, Sugarcane"
               value={form.crop} 
               onChange={e => handleChange('crop', e.target.value)} 
               className="w-full p-5 border border-earth-300 dark:border-slate-600 rounded-2xl focus:border-leaf-500 focus:ring-4 focus:ring-leaf-500/10 outline-none transition-all dark:bg-slate-800 dark:text-white text-lg font-medium shadow-sm hover:shadow-md focus:shadow-lg" 
             />
          </div>

          {/* Soil Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group">
              <label className="block text-sm font-bold text-earth-600 dark:text-slate-400 mb-2 flex items-center gap-2">
                <Layers className="w-4 h-4" /> {text.soilType}
              </label>
              <div className="relative">
                <select 
                  value={form.soilType} 
                  onChange={e => handleChange('soilType', e.target.value)}
                  className="w-full p-4 border border-earth-300 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-800 outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/20 appearance-none dark:text-white cursor-pointer hover:bg-earth-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                >
                  {SOIL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-earth-500">
                   <ChevronLeft className="w-5 h-5 -rotate-90" />
                </div>
              </div>
            </div>
            <div className="group">
              <label className="block text-sm font-bold text-earth-600 dark:text-slate-400 mb-2 flex items-center gap-2">
                <Layers className="w-4 h-4" /> {text.soilTexture}
              </label>
              <div className="relative">
                <select 
                  value={form.soilTexture} 
                  onChange={e => handleChange('soilTexture', e.target.value)}
                  className="w-full p-4 border border-earth-300 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-800 outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/20 appearance-none dark:text-white cursor-pointer hover:bg-earth-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                >
                  {SOIL_TEXTURES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-earth-500">
                   <ChevronLeft className="w-5 h-5 -rotate-90" />
                </div>
              </div>
            </div>
            <div className="group">
              <label className="block text-sm font-bold text-earth-600 dark:text-slate-400 mb-2 flex items-center gap-2">
                <Palette className="w-4 h-4" /> {text.soilColor}
              </label>
              <div className="relative">
                <select 
                  value={form.soilColor} 
                  onChange={e => handleChange('soilColor', e.target.value)}
                  className="w-full p-4 border border-earth-300 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-800 outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/20 appearance-none dark:text-white cursor-pointer hover:bg-earth-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                >
                  {SOIL_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-earth-500">
                   <ChevronLeft className="w-5 h-5 -rotate-90" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 flex gap-5">
             <button
              type="button"
              onClick={onBack}
              className="flex-1 py-4 border border-earth-300 dark:border-slate-600 text-earth-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-earth-50 dark:hover:bg-slate-700 transition-all active:scale-95 flex items-center justify-center gap-2 group shadow-sm hover:shadow-md"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> {text.back}
            </button>
            <button
              type="submit"
              className="flex-[2] bg-gradient-to-r from-leaf-600 to-emerald-600 dark:from-leaf-500 dark:to-emerald-500 text-white py-4 rounded-2xl font-bold text-xl hover:from-leaf-500 hover:to-emerald-500 hover:shadow-neon transition-all active:scale-[0.98] flex items-center justify-center gap-2 shine-effect relative overflow-hidden shadow-lg hover:-translate-y-1"
            >
              <span className="relative z-10 flex items-center gap-2">{text.next} <Check className="w-6 h-6" /></span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FarmerInfoForm;