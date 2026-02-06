import React, { useState } from 'react';
import { Translation } from '../types';
import { UploadCloud, FileImage, Loader2, FileText, X, ScanLine, ChevronLeft, HelpCircle } from 'lucide-react';

interface Props {
  text: Translation;
  onUpload: (file: File) => void;
  isLoading: boolean;
  onBack?: () => void;
  onGuide?: () => void;
}

const ReportUpload: React.FC<Props> = ({ text, onUpload, isLoading, onBack, onGuide }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedFile(null);
    setPreview(null);
  };

  const handleProcess = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8 animate-fade-up min-h-full">
      <div className="w-full max-w-4xl">
        
        {/* Main Upload Card */}
        <div className="glass-panel w-full rounded-[2rem] shadow-depth p-8 md:p-12 relative overflow-hidden border border-white/60 dark:border-slate-600/40 transition-all duration-500 hover:shadow-depth-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-earth-900 dark:text-white transition-colors tracking-tight drop-shadow-md">{text.uploadReport}</h2>
            <p className="text-earth-500 dark:text-slate-400 mt-2 font-medium text-lg">Upload your soil test for instant AI analysis</p>
          </div>

          <div className="mb-8 relative">
            <label 
              htmlFor="file-upload"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative flex flex-col items-center justify-center w-full h-80 
                rounded-[2rem] cursor-pointer transition-all duration-500 group
                border-3 border-dashed overflow-hidden
                ${isDragging 
                  ? 'border-leaf-500 bg-leaf-50 dark:bg-leaf-900/20 scale-[1.03] shadow-glow-lg' 
                  : selectedFile 
                    ? 'border-leaf-300 dark:border-leaf-700 bg-white dark:bg-slate-800 shadow-card' 
                    : 'border-earth-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 hover:border-leaf-400 dark:hover:border-leaf-500 hover:shadow-2xl hover:shadow-leaf-500/20'
                }
              `}
            >
              {isLoading ? (
                <div className="flex flex-col items-center justify-center w-full h-full relative bg-slate-900 rounded-[2rem] overflow-hidden">
                  {/* Scanning Effect */}
                  {preview ? (
                     <img src={preview} alt="Scanning" className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm scale-105 animate-pulse-slow" />
                  ) : (
                     <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                  )}
                  
                  {/* Faster Scanning Animation */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-leaf-500/40 to-transparent animate-scan z-10 h-full border-b-4 border-leaf-400 shadow-[0_0_50px_rgba(74,222,128,0.8)] duration-[1s]"></div>
                  
                  <div className="relative z-20 flex flex-col items-center bg-black/60 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-neon">
                    <div className="relative">
                       <div className="absolute inset-0 bg-leaf-500/50 blur-2xl rounded-full animate-pulse"></div>
                       <ScanLine className="w-16 h-16 text-leaf-400 relative z-10 animate-bounce" />
                    </div>
                    <p className="text-leaf-200 font-bold mt-6 text-xl tracking-widest uppercase animate-pulse drop-shadow-lg">
                      Analyzing...
                    </p>
                  </div>
                </div>
              ) : selectedFile ? (
                 <div className="relative w-full h-full flex items-center justify-center p-4">
                   <button 
                    onClick={clearFile}
                    className="absolute top-6 right-6 bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-300 p-3 rounded-full hover:bg-red-200 dark:hover:bg-red-800 transition-all z-10 shadow-lg hover:shadow-red-500/30 hover:scale-110"
                   >
                     <X className="w-6 h-6" />
                   </button>

                   {selectedFile.type.startsWith('image/') && preview ? (
                     <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-sm group-hover:scale-[1.02] transition-transform duration-500">
                       <img src={preview} alt="Report Preview" className="w-full h-full object-contain drop-shadow-2xl" />
                     </div>
                   ) : (
                     <div className="flex flex-col items-center justify-center text-earth-700 dark:text-slate-200 animate-pop-in">
                       <div className="w-28 h-28 bg-earth-100 dark:bg-slate-700 rounded-3xl flex items-center justify-center mb-5 text-earth-500 dark:text-slate-400 shadow-inner ring-4 ring-white dark:ring-slate-600">
                          <FileText className="w-14 h-14" />
                       </div>
                       <p className="font-bold text-2xl text-earth-800 dark:text-white mb-2 drop-shadow-sm">{selectedFile.name}</p>
                       <span className="px-5 py-2 bg-earth-100 dark:bg-slate-700 text-earth-700 dark:text-slate-300 text-sm font-bold rounded-full uppercase tracking-wider shadow-sm">
                         {selectedFile.type.split('/')[1] || 'FILE'}
                       </span>
                     </div>
                   )}
                 </div>
              ) : (
                <div className="flex flex-col items-center p-8 text-center transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-2">
                  <div className="w-28 h-28 bg-leaf-50 dark:bg-leaf-900/30 rounded-full flex items-center justify-center mb-8 group-hover:bg-leaf-100 dark:group-hover:bg-leaf-800/40 transition-colors duration-300 shadow-inner relative">
                    <div className="absolute inset-0 bg-leaf-400/20 rounded-full animate-ping opacity-0 group-hover:opacity-100 duration-1000"></div>
                    <UploadCloud className="w-14 h-14 text-leaf-600 dark:text-leaf-400 relative z-10 drop-shadow-lg" />
                  </div>
                  <p className="mb-3 text-2xl text-earth-800 dark:text-white font-extrabold">{text.dragDrop}</p>
                  <p className="text-base text-earth-500 dark:text-slate-500 font-medium">Supported formats: JPG, PNG, PDF</p>
                </div>
              )}
              <input 
                id="file-upload" 
                type="file" 
                className="hidden" 
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                disabled={isLoading}
              />
            </label>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <button
              onClick={handleProcess}
              disabled={!selectedFile || isLoading}
              className="w-full md:w-auto px-12 bg-gradient-to-r from-leaf-600 to-emerald-600 dark:from-leaf-500 dark:to-emerald-500 text-white py-4 rounded-2xl font-bold text-xl hover:from-leaf-500 hover:to-emerald-500 dark:hover:from-leaf-400 dark:hover:to-emerald-400 hover:shadow-neon shadow-lg disabled:bg-none disabled:bg-earth-300 dark:disabled:bg-slate-700 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all active:scale-[0.98] duration-300 shine-effect relative overflow-hidden group hover:-translate-y-1 flex-1"
            >
              <span className="relative z-10 flex items-center gap-2">
                 {isLoading ? <Loader2 className="animate-spin w-6 h-6" /> : <FileImage className="w-6 h-6 group-hover:scale-110 transition-transform" />}
                 {text.submit}
              </span>
            </button>
            
            <button
              onClick={onGuide}
              className="w-full md:w-auto px-6 py-4 border-2 border-earth-200 dark:border-slate-600 text-earth-600 dark:text-slate-300 rounded-2xl font-bold text-lg hover:bg-earth-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 group whitespace-nowrap"
            >
              <HelpCircle className="w-5 h-5 group-hover:text-leaf-600 dark:group-hover:text-leaf-400 transition-colors" />
              {text.noReportBtn}
            </button>
          </div>
        </div>
      
      </div>
    </div>
  );
};

export default ReportUpload;