import { auth, db, isConfigured } from '../firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  User
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query,
  orderBy
} from 'firebase/firestore';

// --- Types ---
export interface ChatSession {
  id: string;
  title: string;
  messages: any[];
  updatedAt: number;
}

// --- MOCK STATE MANAGEMENT (For when Firebase keys are missing) ---
// Simple event system for mock updates
const mockListeners: Record<string, Function[]> = {};
const triggerMockUpdate = (key: string, data: any) => {
  if (mockListeners[key]) {
    mockListeners[key].forEach(cb => cb(data));
  }
};

const getMockChats = (userId: string) => {
  return JSON.parse(localStorage.getItem(`chats_${userId}`) || '[]');
};

// --- AUTH SERVICE ---
export const authService = {
  login: async (email, password) => {
    if (isConfigured && auth) {
      return signInWithEmailAndPassword(auth, email, password);
    }
    // Mock Login
    return new Promise((resolve) => {
       setTimeout(() => {
          const mockUser = { uid: 'mock-user-123', email, displayName: email.split('@')[0] };
          localStorage.setItem('mock_session', JSON.stringify(mockUser));
          // Trigger auth state change manually for the app
          window.dispatchEvent(new Event('mock-auth-change'));
          resolve({ user: mockUser });
       }, 800);
    });
  },

  signup: async (email, password, username) => {
    if (isConfigured && auth) {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (username) await updateProfile(cred.user, { displayName: username });
      return cred;
    }
    // Mock Signup
    return new Promise((resolve) => {
       setTimeout(() => {
          const mockUser = { uid: 'mock-user-123', email, displayName: username || email.split('@')[0] };
          localStorage.setItem('mock_session', JSON.stringify(mockUser));
          window.dispatchEvent(new Event('mock-auth-change'));
          resolve({ user: mockUser });
       }, 800);
    });
  },

  logout: async () => {
    if (isConfigured && auth) {
      return signOut(auth);
    }
    // Mock Logout
    localStorage.removeItem('mock_session');
    window.dispatchEvent(new Event('mock-auth-change'));
    return Promise.resolve();
  },

  onAuthStateChanged: (callback: (user: any) => void) => {
    if (isConfigured && auth) {
      return onAuthStateChanged(auth, callback);
    }
    
    // Mock Listener
    const checkAuth = () => {
       const user = JSON.parse(localStorage.getItem('mock_session') || 'null');
       callback(user);
    };
    
    // Check immediately
    checkAuth();
    
    // Listen for custom mock events
    window.addEventListener('mock-auth-change', checkAuth);
    return () => window.removeEventListener('mock-auth-change', checkAuth);
  }
};

// --- DB SERVICE ---
export const dbService = {
  subscribeToChats: (userId: string, callback: (chats: ChatSession[]) => void) => {
    if (isConfigured && db) {
      const q = query(collection(db, 'users', userId, 'chats')); // Add orderBy('updatedAt', 'desc') if indexed
      return onSnapshot(q, (snapshot) => {
        const chats = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ChatSession));
        chats.sort((a, b) => b.updatedAt - a.updatedAt);
        callback(chats);
      });
    }

    // Mock Subscription
    const key = `chats_${userId}`;
    const update = () => {
        const chats = getMockChats(userId);
        chats.sort((a: any, b: any) => b.updatedAt - a.updatedAt);
        callback(chats);
    };
    
    update(); // Initial
    
    if (!mockListeners[key]) mockListeners[key] = [];
    mockListeners[key].push(update);

    return () => {
       mockListeners[key] = mockListeners[key].filter(cb => cb !== update);
    };
  },

  saveChat: async (userId: string, chat: ChatSession) => {
    if (isConfigured && db) {
      return setDoc(doc(db, 'users', userId, 'chats', chat.id), chat, { merge: true });
    }

    // Mock Save
    const chats = getMockChats(userId);
    const idx = chats.findIndex((c: any) => c.id === chat.id);
    if (idx >= 0) {
        chats[idx] = chat;
    } else {
        chats.push(chat);
    }
    localStorage.setItem(`chats_${userId}`, JSON.stringify(chats));
    triggerMockUpdate(`chats_${userId}`, chats);
  },

  deleteChat: async (userId: string, chatId: string) => {
    if (isConfigured && db) {
      return deleteDoc(doc(db, 'users', userId, 'chats', chatId));
    }

    // Mock Delete
    let chats = getMockChats(userId);
    chats = chats.filter((c: any) => c.id !== chatId);
    localStorage.setItem(`chats_${userId}`, JSON.stringify(chats));
    triggerMockUpdate(`chats_${userId}`, chats);
  }
};
