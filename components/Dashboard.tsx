import React from 'react';
import { Translation } from '../types';
import {
  LayoutDashboard,
  UploadCloud,
  MessageSquare,
  LogOut,
  ChevronRight,
  Sprout,
  Moon,
  Sun,
  ArrowLeft,
  BarChart3,
  Newspaper,
  Landmark,
  Zap,
  Leaf,
  MessagesSquare
  , MapPin, CloudSun
} from 'lucide-react';

interface Props {
  text: Translation;
  onNavigate: (view: 'home' | 'upload' | 'chat' | 'news' | 'schemes' | 'soil_guide' | 'nearby_labs') => void;
  onLogout: () => void;
  activeView: 'home' | 'upload' | 'chat' | 'news' | 'schemes' | 'soil_guide' | 'nearby_labs';
  children: React.ReactNode;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Dashboard: React.FC<Props> = ({
  text,
  onNavigate,
  onLogout,
  activeView,
  children,
  isDarkMode,
  toggleTheme
}) => {

  const navItems = [
    { id: 'home', label: text.dashboardHome, icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'news', label: text.dashboardNews, icon: <Newspaper className="w-5 h-5" /> },
    { id: 'schemes', label: text.dashboardSchemes, icon: <Landmark className="w-5 h-5" /> },
    { id: 'upload', label: text.dashboardAnalysis, icon: <UploadCloud className="w-5 h-5" /> },
    { id: 'chat', label: text.directChatBtn, icon: <MessageSquare className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-[#FDFBF9] dark:bg-slate-900 transition-colors duration-300 overflow-hidden font-sans">

      {/* LEFT SIDEBAR - Persistent */}
      <aside className="w-72 bg-[#F8F3F0] dark:bg-slate-800 border-r border-earth-100 dark:border-slate-700 flex flex-col h-full shrink-0 transition-colors duration-300">

        {/* Logo Section */}
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-leaf-600 dark:bg-leaf-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-leaf-600/20">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl text-earth-900 dark:text-white leading-tight">
                Kisan Setu
              </h1>
              <p className="text-xs text-earth-500 dark:text-slate-400 font-medium">AI Soil Test Analyst</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as any)}
                className={`
                  w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200 group relative overflow-hidden
                  ${isActive
                    ? 'bg-leaf-100 dark:bg-leaf-900/30 text-leaf-800 dark:text-leaf-300 font-bold shadow-sm'
                    : 'text-earth-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-earth-900 dark:hover:text-white font-medium'
                  }
                `}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`transition-colors ${isActive ? 'text-leaf-600 dark:text-leaf-400' : 'text-earth-400 dark:text-slate-500 group-hover:text-earth-600 dark:group-hover:text-white'}`}>
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </div>

                {isActive && (
                  <ChevronRight className="w-4 h-4 text-leaf-600 dark:text-leaf-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="p-4 mt-auto">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 p-4 rounded-2xl bg-[#EFEDE9] dark:bg-slate-700/50 text-earth-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 font-bold transition-all duration-200 text-sm group"
          >
            <LogOut className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
            {text.logout}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full min-w-0 relative">

        {/* Top Header */}
        <header className="h-20 px-8 flex items-center justify-between shrink-0 bg-[#FDFBF9]/80 dark:bg-slate-900/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            {activeView !== 'home' ? (
              <button
                onClick={() => onNavigate('home')}
                className="flex items-center gap-2 text-earth-500 hover:text-earth-800 dark:text-slate-400 dark:hover:text-white transition-colors font-bold text-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <span className="text-earth-400 dark:text-slate-500 font-medium text-sm">Dashboard</span>
            )}
            {activeView !== 'home' && (
              <>
                <span className="text-earth-300 dark:text-slate-600">/</span>
                <span className="text-earth-800 dark:text-white font-bold text-lg capitalize">
                  {navItems.find(i => i.id === activeView)?.label}
                </span>
              </>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-earth-200 dark:border-slate-700 flex items-center justify-center text-earth-600 dark:text-yellow-400 shadow-sm hover:shadow-md hover:scale-105 transition-all"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-0">
          {activeView === 'home' ? (
            <div className="max-w-6xl mx-auto space-y-16 animate-fade-up pt-10 pb-20">

              {/* Minimalist Hero Section */}
              <div className="text-center space-y-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-leaf-600 to-emerald-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-leaf-500/30 transform rotate-3">
                  <Sprout className="w-12 h-12 text-white" />
                </div>

                <div className="space-y-4">
                  <h1 className="text-5xl md:text-6xl font-black text-earth-900 dark:text-white tracking-tight">
                    Kisan <span className="text-leaf-600 dark:text-leaf-400">Setu</span>
                  </h1>
                  <p className="text-xl md:text-2xl font-medium text-earth-500 dark:text-slate-400 tracking-wide">
                    {text.subtitle}
                  </p>
                </div>

                <p className="max-w-2xl mx-auto text-lg text-earth-600 dark:text-slate-300 leading-relaxed">
                  {text.appDescription}
                </p>
              </div>

              {/* Professional Feature List */}
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-center gap-4 mb-12">
                  <div className="h-px w-12 bg-earth-200 dark:bg-slate-700"></div>
                  <span className="text-sm font-bold uppercase tracking-[0.2em] text-earth-400 dark:text-slate-500">{text.features}</span>
                  <div className="h-px w-12 bg-earth-200 dark:bg-slate-700"></div>
                </div>


                <div className="space-y-6">
                  {/** Feature: Instant Soil Analysis */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-leaf-50 dark:bg-slate-800 rounded-lg flex items-center justify-center text-leaf-600 dark:text-leaf-400">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-earth-900 dark:text-white">{text.feature1}</h4>
                      <p className="text-earth-600 dark:text-slate-400">{text.feature1Desc}</p>
                    </div>
                  </div>

                  {/** Feature: Fertilizer Plans */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-slate-800 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Leaf className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-earth-900 dark:text-white">{text.feature2}</h4>
                      <p className="text-earth-600 dark:text-slate-400">{text.feature2Desc}</p>
                    </div>
                  </div>

                  {/** Feature: 24/7 Agri-Chat */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-teal-50 dark:bg-slate-800 rounded-lg flex items-center justify-center text-teal-600 dark:text-teal-400">
                      <MessagesSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-earth-900 dark:text-white">{text.feature3}</h4>
                      <p className="text-earth-600 dark:text-slate-400">{text.feature3Desc}</p>
                    </div>
                  </div>

                  {/** Feature: Agri News */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-50 dark:bg-slate-800 rounded-lg flex items-center justify-center text-orange-600">
                      <Newspaper className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-earth-900 dark:text-white">{text.newsTitle}</h4>
                      <p className="text-earth-600 dark:text-slate-400">{text.newsSubtitle}</p>
                    </div>
                  </div>

                  {/** Feature: Government Schemes */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-violet-50 dark:bg-slate-800 rounded-lg flex items-center justify-center text-violet-600">
                      <Landmark className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-earth-900 dark:text-white">{text.schemesTitle}</h4>
                      <p className="text-earth-600 dark:text-slate-400">{text.schemesSubtitle}</p>
                    </div>
                  </div>

                  {/** Feature: Upload Soil Report */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-slate-800 rounded-lg flex items-center justify-center text-emerald-600">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-earth-900 dark:text-white">{text.uploadReport}</h4>
                      <p className="text-earth-600 dark:text-slate-400">{text.dragDrop}</p>
                    </div>
                  </div>

                  {/** Feature: Nearby Labs */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-leaf-50 dark:bg-slate-800 rounded-lg flex items-center justify-center text-leaf-600">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-earth-900 dark:text-white">{text.nearbyLabsTitle}</h4>
                      <p className="text-earth-600 dark:text-slate-400">{text.nearbyLabsSubtitle}</p>
                    </div>
                  </div>

                  {/** Feature: Soil Testing Guide */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-slate-800 rounded-lg flex items-center justify-center text-blue-600">
                      <CloudSun className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-earth-900 dark:text-white">{text.guideTitle}</h4>
                      <p className="text-earth-600 dark:text-slate-400">{text.guideSubtitle}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full animate-fade-up">
              {children}
            </div>
          )}
        </div>
      </main >

    </div >
  );
};

export default Dashboard;