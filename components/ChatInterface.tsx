import React, { useState, useEffect, useRef } from 'react';
import { Translation, LanguageCode } from '../types';
import { createAgriChatSession, fileToGenerativePart } from '../services/geminiService';

import { Send, Bot, Loader2, Sprout, Mic, Volume2, PlusCircle, X, Image as ImageIcon, Square, Menu, MessageSquare, Trash2, PanelLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { dbService, ChatSession as DbChatSession } from '../services/db';

interface Props {
  text: Translation;
  language: LanguageCode;
  onBack: () => void;
  userId?: string;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  image?: string; // base64 data url for display
}

// Extend Window interface for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const ChatInterface: React.FC<Props> = ({ text, language, onBack, userId }) => {
  const [sessions, setSessions] = useState<DbChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Sidebar states
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  const chatSession = useRef<any | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Persistence: Load Sessions
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = dbService.subscribeToChats(userId, (fetchedSessions) => {
      setSessions(fetchedSessions);
    });

    return () => unsubscribe();
  }, [userId]);

  // Initial New Chat if empty
  useEffect(() => {
    if (userId && sessions.length === 0 && !currentSessionId) {
      // We don't auto-create in DB yet, just UI state.
      // It will be saved on first message.
    }

    // Auto-collapse sidebar on small desktop screens
    if (window.innerWidth < 1024 && window.innerWidth >= 768) {
      setDesktopSidebarOpen(false);
    }
  }, [userId]);

  // Sync Current Messages to Local State from Session List
  useEffect(() => {
    if (currentSessionId) {
      const session = sessions.find(s => s.id === currentSessionId);
      if (session) {
        setMessages(session.messages);
      }
    } else {
      setMessages([]);
    }
  }, [currentSessionId, sessions]);

  // Initialize Gemini Chat Session (Logic mostly same, just history source changes)
  useEffect(() => {
    const langName = {
      en: 'English', hi: 'Hindi', mr: 'Marathi', ur: 'Urdu', kn: 'Kannada', te: 'Telugu'
    }[language];

    const geminiHistory: any[] = messages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    chatSession.current = createAgriChatSession(langName, geminiHistory) as any;
  }, [language, currentSessionId]); // Re-init when language or session changes

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, imagePreview]);

  // Voice Recognition Setup
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === 'en' ? 'en-US' : `${language}-IN`;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser.");
      return;
    }
    try {
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        setIsListening(true);
        recognitionRef.current.start();
      }
    } catch (e) {
      setIsListening(false);
    }
  };

  const handleSpeak = (messageId: string, textToSpeak: string) => {
    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }
    window.speechSynthesis.cancel();

    // Simple cleaning regex
    const cleanText = textToSpeak.replace(/[*#_`]/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9;

    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;
    if (language === 'en') {
      selectedVoice = voices.find(v => v.name.includes("Google US English")) || voices.find(v => v.lang === 'en-US');
    } else {
      selectedVoice = voices.find(v => v.lang.includes(language));
    }
    if (selectedVoice) utterance.voice = selectedVoice;

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleNewChat = () => {
    setCurrentSessionId(null); // Null ID means "New Chat" state
    setMessages([]);
    setMobileSidebarOpen(false);
  };

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id);
    setMobileSidebarOpen(false);
  };

  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Delete this chat?") && userId) {
      try {
        await dbService.deleteChat(userId, id);
        if (currentSessionId === id) {
          handleNewChat();
        }
      } catch (error) {
        console.error("Error deleting chat:", error);
      }
    }
  };

  const saveSession = async (newMessages: Message[]) => {
    if (!userId) return;

    let sessionId = currentSessionId;
    let title = 'New Conversation';

    // If starting a new session
    if (!sessionId) {
      sessionId = Date.now().toString();
      setCurrentSessionId(sessionId);

      // Generate Title from first message
      const firstMsg = newMessages[0];
      if (firstMsg) {
        title = firstMsg.content.substring(0, 30) + (firstMsg.content.length > 30 ? '...' : '');
      }
    } else {
      // Keep existing title if session exists
      const existingSession = sessions.find(s => s.id === sessionId);
      if (existingSession) title = existingSession.title;
    }

    try {
      await dbService.saveChat(userId, {
        id: sessionId,
        title,
        messages: newMessages,
        updatedAt: Date.now()
      });
    } catch (e) {
      console.error("Error saving chat:", e);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || !chatSession.current) return;

    const currentInput = input;
    const currentImage = imagePreview;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentInput,
      image: currentImage || undefined
    };

    // Update Local State Immediately
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    clearImage();
    setIsTyping(true);

    // Save User Msg
    await saveSession(updatedMessages);

    try {
      let result: any;

      if (selectedImage) {
        const imagePart = await fileToGenerativePart(selectedImage);
        const parts: any[] = [
          { text: currentInput || "Analyze this image" },
          imagePart
        ];
        result = await chatSession.current.sendMessage(parts);
      } else {
        result = await chatSession.current.sendMessage(currentInput);
      }

      const responseText = result.response.text();
      const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', content: responseText };

      const finalMessages = [...updatedMessages, botMsg];
      setMessages(finalMessages);

      // Save Bot Msg
      await saveSession(finalMessages);

    } catch (error) {
      console.error(error);
      const errorMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', content: "Network error. Please try again." };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full bg-earth-50 dark:bg-slate-900 overflow-hidden relative rounded-3xl border border-earth-100 dark:border-slate-700">

      {/* Sidebar Overlay (Mobile) */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden animate-fade-up"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - History & New Chat */}
      <aside
        className={`
          absolute z-40 h-full bg-white dark:bg-slate-800 border-r border-earth-100 dark:border-slate-700 
          transform transition-all duration-300 ease-in-out flex flex-col shadow-xl md:static
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          ${isDesktopSidebarOpen ? 'md:w-72' : 'md:w-0 md:border-none md:overflow-hidden'}
        `}
      >
        <div className="w-72 h-full flex flex-col">
          <div className="p-4 border-b border-earth-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-earth-800 dark:text-white text-lg drop-shadow-sm">Chat History</h2>
              <button onClick={() => setMobileSidebarOpen(false)} className="md:hidden text-earth-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 bg-leaf-600 hover:bg-leaf-700 text-white py-3 rounded-xl font-semibold transition-colors shadow-md hover:shadow-lg"
            >
              <PlusCircle className="w-5 h-5" /> New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {sessions.map(session => (
              <div
                key={session.id}
                onClick={() => handleSelectSession(session.id)}
                className={`
                   group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all
                   ${currentSessionId === session.id
                    ? 'bg-earth-100 dark:bg-slate-700 text-earth-900 dark:text-white font-medium shadow-inner'
                    : 'text-earth-600 dark:text-slate-400 hover:bg-earth-50 dark:hover:bg-slate-700/50 hover:text-earth-800 dark:hover:text-slate-200 hover:shadow-sm'}
                 `}
              >
                <MessageSquare className="w-5 h-5 shrink-0 opacity-70" />
                <span className="truncate flex-1 text-sm">{session.title}</span>
                <button
                  onClick={(e) => handleDeleteSession(e, session.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded transition-all"
                  title="Delete Chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="p-4 text-center text-earth-400 dark:text-slate-500 text-xs italic">
                No history found.
              </div>
            )}
          </div>

        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full w-full relative min-w-0 bg-white/50 dark:bg-slate-800/50">
        {/* Header */}
        <header className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 shadow-sm border-b border-earth-100 dark:border-slate-700 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Toggle */}
            <button onClick={() => setMobileSidebarOpen(true)} className="md:hidden p-2 -ml-2 rounded-full hover:bg-earth-100 dark:hover:bg-slate-700 text-earth-600 dark:text-slate-300">
              <Menu className="w-6 h-6" />
            </button>

            {/* Desktop Sidebar Toggle */}
            <button
              onClick={() => setDesktopSidebarOpen(!isDesktopSidebarOpen)}
              className="hidden md:flex p-2 -ml-2 rounded-full hover:bg-earth-100 dark:hover:bg-slate-700 text-earth-600 dark:text-slate-300 transition-colors"
              title={isDesktopSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
            >
              <PanelLeft className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3 ml-2">
              <div className="w-10 h-10 bg-leaf-100 dark:bg-leaf-900/40 rounded-full flex items-center justify-center border border-leaf-200 dark:border-leaf-700 relative shadow-sm">
                <Bot className="w-6 h-6 text-leaf-600 dark:text-leaf-400 drop-shadow-sm" />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full shadow-sm"></span>
              </div>
              <div>
                <h1 className="font-bold text-earth-800 dark:text-white text-lg leading-tight drop-shadow-sm">{text.chatTitle}</h1>
                <p className="text-xs text-earth-500 dark:text-slate-400 font-medium hidden sm:block">{text.chatSubtitle}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-60 animate-fade-up p-8">
              <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-md">
                <Sprout className="w-10 h-10 text-leaf-500 drop-shadow-sm" />
              </div>
              <p className="text-earth-400 dark:text-slate-500 text-sm max-w-xs">{text.chatPlaceholder}</p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-pop-in`}
            >
              <div className={`
                 max-w-[85%] md:max-w-[75%] p-4 rounded-2xl shadow-md text-base leading-relaxed relative group
                 ${msg.role === 'user'
                  ? 'bg-leaf-600 text-white rounded-br-none shadow-leaf-600/20'
                  : 'bg-white dark:bg-slate-800 text-earth-800 dark:text-slate-200 border border-earth-100 dark:border-slate-700 rounded-bl-none'}
               `}>
                {msg.image && (
                  <div className="mb-3 rounded-lg overflow-hidden border border-white/20 shadow-sm">
                    <img src={msg.image} alt="User upload" className="max-w-full h-auto max-h-60 object-cover" />
                  </div>
                )}

                {msg.role === 'model' ? (
                  <div className="markdown-body">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}

                {msg.role === 'model' && (
                  <div className="absolute -bottom-9 left-0 flex gap-2">
                    <button
                      onClick={() => handleSpeak(msg.id, msg.content)}
                      className={`
                         flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-sm hover:shadow-md
                         ${speakingMessageId === msg.id
                          ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-earth-100 text-earth-600 hover:bg-leaf-100 hover:text-leaf-700 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'}
                       `}
                    >
                      {speakingMessageId === msg.id ? (
                        <>
                          <Square className="w-3 h-3 fill-current" /> Stop
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" /> Speak
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start animate-fade-up">
              <div className="bg-white dark:bg-slate-800 border border-earth-100 dark:border-slate-700 p-4 rounded-2xl rounded-bl-none shadow-md flex items-center gap-2">
                <span className="w-2 h-2 bg-leaf-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-leaf-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-leaf-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-800 border-t border-earth-100 dark:border-slate-700 z-20 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)]">

          {imagePreview && (
            <div className="mb-3 flex items-center gap-3 bg-earth-50 dark:bg-slate-900 p-2 rounded-xl border border-earth-200 dark:border-slate-600 animate-fade-up shadow-sm">
              <div className="w-16 h-16 rounded-lg overflow-hidden relative shadow-sm">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-earth-700 dark:text-white truncate">{selectedImage?.name}</p>
                <p className="text-xs text-earth-500 dark:text-slate-400">Ready to send</p>
              </div>
              <button onClick={clearImage} className="p-1 hover:bg-earth-200 dark:hover:bg-slate-700 rounded-full text-earth-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="max-w-4xl mx-auto relative flex items-end gap-2">

            <div className="flex items-center gap-1 mb-2">
              <label className="p-3 text-earth-500 dark:text-slate-400 hover:bg-earth-100 dark:hover:bg-slate-700 rounded-full cursor-pointer transition-colors hover:shadow-sm">
                <ImageIcon className="w-6 h-6" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
              </label>
              <button
                onClick={toggleListening}
                className={`p-3 rounded-full transition-all hover:shadow-sm ${isListening ? 'bg-red-100 text-red-600 animate-pulse ring-2 ring-red-400 ring-opacity-50' : 'text-earth-500 dark:text-slate-400 hover:bg-earth-100 dark:hover:bg-slate-700'}`}
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                <Mic className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "Listening... (Speak now)" : text.chatPlaceholder}
                rows={1}
                className={`w-full bg-earth-50 dark:bg-slate-900 border rounded-3xl px-6 py-4 outline-none focus:ring-2 focus:ring-leaf-500/50 dark:focus:ring-leaf-400/50 text-earth-800 dark:text-white placeholder:text-earth-400 dark:placeholder:text-slate-500 transition-all shadow-inner resize-none min-h-[56px] max-h-32 ${isListening ? 'border-leaf-500 dark:border-leaf-500 bg-leaf-50/10' : 'border-earth-200 dark:border-slate-600'}`}
                style={{ paddingRight: '40px' }}
              />
            </div>

            <button
              onClick={handleSend}
              disabled={(!input.trim() && !selectedImage) || isTyping}
              className="p-4 bg-leaf-600 dark:bg-leaf-500 text-white rounded-full hover:bg-leaf-700 dark:hover:bg-leaf-400 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-md hover:shadow-lg hover:shadow-leaf-500/30 mb-1"
            >
              {isTyping ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatInterface;