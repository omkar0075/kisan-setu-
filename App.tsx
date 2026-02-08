import React, { useState, useEffect } from 'react';
import { AppScreen, LanguageCode, AnalysisResponse } from './types';
import { TRANSLATIONS } from './constants';
import { fileToGenerativePart, analyzeSoilReport } from './services/geminiService';
import { Moon, Sun, Loader2 } from 'lucide-react';
import { authService } from './services/db';

// Components
import LanguageSelection from './components/LanguageSelection';
import Login from './components/Login';
import ReportUpload from './components/ReportUpload';
import AnalysisResult from './components/AnalysisResult';
import ChatInterface from './components/ChatInterface';
import SplashScreen from './components/SplashScreen';
import Dashboard from './components/Dashboard';
import NewsFeed from './components/NewsFeed';
import SchemesFeed from './components/SchemesFeed';
import SoilTestingGuide from './components/SoilTestingGuide';
import NearbyLabs from './components/NearbyLabs';

function App() {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.SPLASH);
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  
  // Dashboard view state
  const [dashboardView, setDashboardView] = useState<'home' | 'upload' | 'chat' | 'news' | 'schemes' | 'soil_guide' | 'nearby_labs'>('home');

  // Dark Mode Effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((currentUser) => {
      setUser(currentUser);

      // If a user is present, show dashboard (unless still on splash)
      if (currentUser) {
        setScreen(prev => (prev === AppScreen.SPLASH ? prev : AppScreen.DASHBOARD));
      } else {
        // If signed out while on dashboard, go to login
        setScreen(prev => (prev === AppScreen.DASHBOARD ? AppScreen.LOGIN : prev));
      }
      setAuthInitialized(true);
    });
    return () => unsubscribe();
  }, [authInitialized, screen]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const text = TRANSLATIONS[language];

  const handleSplashComplete = () => {
    // Determine where to go based on auth state
    if (user) {
      setScreen(AppScreen.DASHBOARD);
    } else {
      setScreen(AppScreen.LANGUAGE_SELECT);
    }
  };

  const handleLanguageSelect = (lang: LanguageCode) => {
    setLanguage(lang);
    if (user) {
      setScreen(AppScreen.DASHBOARD);
    } else {
      setScreen(AppScreen.LOGIN);
    }
  };

  const handleLogin = () => {
    // Triggered by Login component on success
    setScreen(AppScreen.DASHBOARD);
    setDashboardView('home');
  };
  
  const handleLogout = async () => {
    try {
      await authService.logout();
      setScreen(AppScreen.LOGIN);
      setDashboardView('home');
      setAnalysisResult(null);
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    try {
      const base64Data = await fileToGenerativePart(file);
      // Pass the actual MIME type of the file
      const result = await analyzeSoilReport(base64Data, file.type, language);
      setAnalysisResult(result);
      // Move from Dashboard Upload view to Full Analysis Screen
      setScreen(AppScreen.ANALYSIS);
    } catch (error) {
      alert("Analysis failed. Please try a clearer image or PDF.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setAnalysisResult(null);
    setScreen(AppScreen.DASHBOARD);
    setDashboardView('upload');
  };

  const handleDashboardNavigate = (view: 'home' | 'upload' | 'chat' | 'news' | 'schemes') => {
    setDashboardView(view);
  };

  // Render logic
  const renderScreen = () => {
    switch (screen) {
      case AppScreen.SPLASH:
        return <SplashScreen onComplete={handleSplashComplete} />;

      case AppScreen.LANGUAGE_SELECT:
        return <LanguageSelection onSelect={handleLanguageSelect} />;
      
      case AppScreen.LOGIN:
        return (
          <Login 
            text={text} 
            onLogin={handleLogin} 
            onBack={() => setScreen(AppScreen.LANGUAGE_SELECT)} 
          />
        );
      
      case AppScreen.DASHBOARD:
        return (
          <Dashboard 
             text={text} 
             onNavigate={handleDashboardNavigate} 
             onLogout={handleLogout}
             activeView={(dashboardView === 'soil_guide' || dashboardView === 'nearby_labs') ? 'upload' : dashboardView} 
             isDarkMode={darkMode}
             toggleTheme={toggleTheme}
          >
             {/* Render Sub-Views inside Dashboard Layout */}
             {dashboardView === 'upload' && (
                <ReportUpload 
                  text={text} 
                  onUpload={handleFileUpload} 
                  isLoading={loading}
                  onGuide={() => setDashboardView('soil_guide')}
                />
             )}
             
             {dashboardView === 'soil_guide' && (
                <SoilTestingGuide 
                   text={text}
                   onBack={() => setDashboardView('upload')}
                   onFindLabs={() => setDashboardView('nearby_labs')}
                />
             )}

             {dashboardView === 'nearby_labs' && (
                <NearbyLabs
                   text={text}
                   language={language}
                   onBack={() => setDashboardView('soil_guide')}
                />
             )}
             
             {dashboardView === 'chat' && (
                <ChatInterface 
                  text={text} 
                  language={language}
                  onBack={() => setDashboardView('home')}
                  userId={user?.uid}
                />
             )}

             {dashboardView === 'news' && (
                <NewsFeed
                  text={text}
                  language={language}
                />
             )}

             {dashboardView === 'schemes' && (
                <SchemesFeed
                  text={text}
                  language={language}
                />
             )}
             
             {dashboardView === 'home' && (
               <div className="h-full"></div>
             )}
          </Dashboard>
        );
      
      case AppScreen.ANALYSIS:
        if (!analysisResult) return null;
        return (
          <AnalysisResult 
            text={text} 
            data={analysisResult} 
            onRetry={handleRetry} 
          />
        );
      
      case AppScreen.CHAT:
        return (
          <ChatInterface 
            text={text} 
            language={language}
            onBack={() => setScreen(AppScreen.DASHBOARD)}
            userId={user?.uid}
          />
        );
        
      default:
        return <div className="p-4 text-center">Error: Unknown Screen</div>;
    }
  };

  return (
    <div className="relative min-h-screen transition-colors duration-500 overflow-x-hidden">
      {/* Global Theme Toggle - Hidden on Splash and Dashboard (moved inside Dashboard) */}
      {screen !== AppScreen.SPLASH && screen !== AppScreen.DASHBOARD && (
        <button 
          onClick={toggleTheme}
          className="fixed bottom-4 left-4 z-50 p-3 rounded-full shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-earth-200 dark:border-slate-700 text-earth-600 dark:text-yellow-400 hover:scale-110 active:scale-95 transition-all duration-300 group print:hidden"
          aria-label="Toggle Dark Mode"
        >
          <div className="group-hover:rotate-45 transition-transform duration-500">
             {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </div>
        </button>
      )}

      {/* 
        Professional Page Transition Wrapper 
      */}
      <div key={screen} className="animate-page-enter">
        {renderScreen()}
      </div>
    </div>
  );
}

export default App;