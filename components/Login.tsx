import React, { useState } from 'react';
import { Translation } from '../types';
import { Lock, Mail, ArrowRight, Loader2, User } from 'lucide-react';
import { authService } from '../services/db';

interface Props {
  text: Translation;
  onLogin: () => void;
  onBack: () => void;
}

const Login: React.FC<Props> = ({ text, onLogin, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setError(null);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await authService.login(email, password);
      } else {
        await authService.signup(email, password, username);
      }
      onLogin(); 
    } catch (err: any) {
      console.error(err);
      let msg = "Authentication failed.";
      if (err.code === 'auth/invalid-email') msg = "Invalid email address.";
      if (err.code === 'auth/user-not-found') msg = "No user found with this email.";
      if (err.code === 'auth/wrong-password') msg = "Incorrect password.";
      if (err.code === 'auth/email-already-in-use') msg = "Email already in use.";
      if (err.code === 'auth/weak-password') msg = "Password should be at least 6 characters.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
       {/* Ambient Background - Constant */}
       <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-gradient-to-b from-leaf-200/50 to-transparent dark:from-leaf-900/30 rounded-bl-full pointer-events-none -z-10"></div>
       <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-gradient-to-t from-earth-200/50 to-transparent dark:from-earth-900/30 rounded-tr-full pointer-events-none -z-10"></div>
       
      <div className="glass-panel w-full max-w-md rounded-[2.5rem] shadow-depth-lg p-8 md:p-12 relative overflow-hidden border border-white/70 dark:border-slate-600/50 hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] transition-all duration-700 animate-content-show">
        {/* Decorative circle */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-leaf-500/15 dark:bg-leaf-400/10 rounded-full blur-3xl animate-pulse-slow"></div>

        <div className="text-center mb-10 opacity-0 animate-content-show stagger-1">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-leaf-50 dark:bg-leaf-900/50 rounded-3xl mb-6 text-leaf-600 dark:text-leaf-400 shadow-glow ring-2 ring-leaf-100 dark:ring-leaf-800 transform transition-transform hover:scale-110 duration-500 hover:rotate-3">
            <User className="w-10 h-10 drop-shadow-md" />
          </div>
          <h2 className="text-4xl font-extrabold text-earth-900 dark:text-white transition-colors drop-shadow-sm">
            {isLogin ? text.loginBtn : text.signUpBtn}
          </h2>
          <p className="text-earth-500 dark:text-slate-400 mt-3 text-base font-medium">Welcome to Kisan Setu</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50/90 dark:bg-red-900/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 rounded-2xl text-sm text-center font-bold animate-bounce-slight shadow-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Sign Up: Username Field */}
          {!isLogin && (
            <div className="opacity-0 animate-content-show stagger-2">
              <label className="block text-xs font-bold text-earth-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1 transition-colors">{text.usernamePlaceholder}</label>
              <div className="relative group">
                <User className="absolute left-5 top-4 text-earth-400 dark:text-slate-500 w-5 h-5 group-focus-within:text-leaf-600 dark:group-focus-within:text-leaf-400 transition-colors duration-300" />
                <input
                  type="text"
                  className="w-full pl-14 pr-5 py-4 bg-white/60 dark:bg-slate-800/60 border border-earth-200 dark:border-slate-600 rounded-2xl focus:ring-4 focus:ring-leaf-500/20 dark:focus:ring-leaf-400/20 focus:border-leaf-500 dark:focus:border-leaf-400 outline-none transition-all duration-300 placeholder:text-earth-300 dark:placeholder:text-slate-600 font-bold text-earth-800 dark:text-white hover:bg-white dark:hover:bg-slate-800 shadow-sm focus:shadow-xl focus:-translate-y-1"
                  placeholder={text.usernamePlaceholder}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          {/* Email Field (Used for both) */}
          <div className="opacity-0 animate-content-show stagger-2">
            <label className="block text-xs font-bold text-earth-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1 transition-colors">{isLogin ? "Email" : text.emailPlaceholder}</label>
            <div className="relative group">
              <Mail className="absolute left-5 top-4 text-earth-400 dark:text-slate-500 w-5 h-5 group-focus-within:text-leaf-600 dark:group-focus-within:text-leaf-400 transition-colors duration-300" />
              <input
                type="email"
                className="w-full pl-14 pr-5 py-4 bg-white/60 dark:bg-slate-800/60 border border-earth-200 dark:border-slate-600 rounded-2xl focus:ring-4 focus:ring-leaf-500/20 dark:focus:ring-leaf-400/20 focus:border-leaf-500 dark:focus:border-leaf-400 outline-none transition-all duration-300 placeholder:text-earth-300 dark:placeholder:text-slate-600 font-bold text-earth-800 dark:text-white hover:bg-white dark:hover:bg-slate-800 shadow-sm focus:shadow-xl focus:-translate-y-1"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="opacity-0 animate-content-show stagger-3">
            <label className="block text-xs font-bold text-earth-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1 transition-colors">{text.passwordPlaceholder}</label>
            <div className="relative group">
              <Lock className="absolute left-5 top-4 text-earth-400 dark:text-slate-500 w-5 h-5 group-focus-within:text-leaf-600 dark:group-focus-within:text-leaf-400 transition-colors duration-300" />
              <input
                type="password"
                className="w-full pl-14 pr-5 py-4 bg-white/60 dark:bg-slate-800/60 border border-earth-200 dark:border-slate-600 rounded-2xl focus:ring-4 focus:ring-leaf-500/20 dark:focus:ring-leaf-400/20 focus:border-leaf-500 dark:focus:border-leaf-400 outline-none transition-all duration-300 placeholder:text-earth-300 dark:placeholder:text-slate-600 font-bold text-earth-800 dark:text-white hover:bg-white dark:hover:bg-slate-800 shadow-sm focus:shadow-xl focus:-translate-y-1"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="opacity-0 animate-content-show stagger-4 w-full bg-gradient-to-r from-leaf-600 to-emerald-600 dark:from-leaf-500 dark:to-emerald-500 text-white py-4 rounded-2xl font-extrabold text-lg hover:from-leaf-500 hover:to-emerald-500 dark:hover:from-leaf-400 dark:hover:to-emerald-400 hover:shadow-neon active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-6 shine-effect group relative overflow-hidden shadow-lg hover:-translate-y-1"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <span className="relative z-10 flex items-center gap-2">
                  {isLogin ? text.loginBtn : text.signUpBtn} 
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-earth-100 dark:border-slate-700 text-center opacity-0 animate-content-show stagger-4">
          <p className="text-earth-600 dark:text-slate-400 text-sm mb-4">
            {isLogin ? text.noAccount : text.haveAccount}
          </p>
          <button
            onClick={toggleMode}
            className="text-leaf-700 dark:text-leaf-400 font-extrabold hover:text-leaf-800 dark:hover:text-leaf-300 hover:underline transition-all hover:scale-105 inline-block drop-shadow-sm"
          >
            {isLogin ? text.signUpBtn : text.loginBtn}
          </button>
        </div>
        
        <button 
          onClick={onBack} 
          className="mt-6 w-full text-center text-earth-400 dark:text-slate-500 text-xs hover:text-earth-600 dark:hover:text-slate-300 transition-colors font-bold uppercase tracking-widest hover:tracking-[0.2em] duration-300 opacity-0 animate-content-show stagger-4"
        >
          {text.back}
        </button>
      </div>
    </div>
  );
};

export default Login;