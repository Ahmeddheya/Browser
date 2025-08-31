import { create } from 'zustand';
import { StorageManager, BrowserSettings, HistoryItem, BookmarkItem } from '../utils/storage';
import SearchIndexManager from '../utils/searchIndex';
import DownloadManager from '../utils/downloadManager';

interface BrowserState {
  // Settings
  settings: BrowserSettings;
  loadSettings: () => Promise<void>;
  updateSetting: <K extends keyof BrowserSettings>(key: K, value: BrowserSettings[K]) => Promise<void>;
  
  // Ad blocking
  isAdBlockEnabled: boolean;
  toggleAdBlock: () => Promise<void>;
  
  // Tabs management
  tabs: string[];
  activeTab: number;
  addTab: () => void;
  closeTab: (index: number) => void;
  switchTab: (index: number) => void;
  
  // Theme and appearance
  darkMode: boolean;
  toggleDarkMode: () => Promise<void>;
  
  // Night mode
  nightMode: boolean;
  toggleNightMode: () => Promise<void>;
  
  // Desktop mode
  desktopMode: boolean;
  toggleDesktopMode: () => Promise<void>;
  
  // Incognito mode
  incognitoMode: boolean;
  toggleIncognitoMode: () => Promise<void>;
  
  // History management
  history: HistoryItem[];
  loadHistory: () => Promise<void>;
  addToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp' | 'visitCount'>) => Promise<void>;
  clearHistory: () => Promise<void>;
  searchHistory: (query: string) => Promise<HistoryItem[]>;
  
  // Bookmarks management
  bookmarks: BookmarkItem[];
  loadBookmarks: () => Promise<void>;
  addBookmark: (item: Omit<BookmarkItem, 'id' | 'dateAdded'>) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  updateBookmark: (id: string, updates: Partial<BookmarkItem>) => Promise<void>;
  searchBookmarks: (query: string) => Promise<BookmarkItem[]>;
  
  // Search functionality
  initializeSearch: () => Promise<void>;
  performSearch: (query: string, options?: any) => Promise<any[]>;
  
  // Downloads
  initializeDownloads: () => Promise<void>;
  
  // Initialization
  initialize: () => Promise<void>;
}

export const useBrowserStore = create<BrowserState>((set, get) => ({
  // Settings state
  settings: {
    darkMode: false,
    nightMode: false,
    incognitoMode: false,
    desktopMode: false,
    adBlockEnabled: true,
    searchEngine: 'google',
    homepage: 'https://www.google.com',
    autoSaveHistory: true,
    maxHistoryItems: 1000,
  },
  
  loadSettings: async () => {
    try {
      const settings = await StorageManager.getSettings();
      set({ 
        settings,
        darkMode: settings.darkMode,
        nightMode: settings.nightMode,
        incognitoMode: settings.incognitoMode,
        desktopMode: settings.desktopMode,
        isAdBlockEnabled: settings.adBlockEnabled,
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  },
  
  updateSetting: async (key, value) => {
    try {
      const currentSettings = get().settings;
      const newSettings = { ...currentSettings, [key]: value };
      await StorageManager.updateSettings({ [key]: value });
      set({ settings: newSettings });
      
      // Update corresponding state variables
      if (key === 'darkMode') set({ darkMode: value as boolean });
      if (key === 'nightMode') set({ nightMode: value as boolean });
      if (key === 'incognitoMode') set({ incognitoMode: value as boolean });
      if (key === 'desktopMode') set({ desktopMode: value as boolean });
      if (key === 'adBlockEnabled') set({ isAdBlockEnabled: value as boolean });
    } catch (error) {
      console.error('Failed to update setting:', error);
    }
  },
  
  // Ad blocking state
  isAdBlockEnabled: true,
  toggleAdBlock: async () => {
    const newValue = !get().isAdBlockEnabled;
    await get().updateSetting('adBlockEnabled', newValue);
  },
  
  // Tabs state
  tabs: ['Home'],
  activeTab: 0,
  addTab: () => set((state) => ({ 
    tabs: [...state.tabs, `Tab ${state.tabs.length + 1}`],
    activeTab: state.tabs.length
  })),
  closeTab: (index) => set((state) => {
    const newTabs = state.tabs.filter((_, i) => i !== index);
    const newActiveTab = index === state.activeTab 
      ? Math.max(0, state.activeTab - 1)
      : state.activeTab > index 
        ? state.activeTab - 1 
        : state.activeTab;
    return { tabs: newTabs, activeTab: newActiveTab };
  }),
  switchTab: (index) => set({ activeTab: index }),
  
  // Theme state
  darkMode: false,
  toggleDarkMode: async () => {
    const newValue = !get().darkMode;
    await get().updateSetting('darkMode', newValue);
  },
  
  // Night mode state
  nightMode: false,
  toggleNightMode: async () => {
    const newValue = !get().nightMode;
    await get().updateSetting('nightMode', newValue);
  },
  
  // Desktop mode state
  desktopMode: false,
  toggleDesktopMode: async () => {
    const newValue = !get().desktopMode;
    await get().updateSetting('desktopMode', newValue);
  },
  
  // Incognito mode state
  incognitoMode: false,
  toggleIncognitoMode: async () => {
    const newValue = !get().incognitoMode;
    await get().updateSetting('incognitoMode', newValue);
  },
  
  // History state
  history: [],
  loadHistory: async () => {
    try {
      const history = await StorageManager.getHistory();
      set({ history });
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  },
  
  addToHistory: async (item) => {
    try {
      const settings = get().settings;
      if (!settings.autoSaveHistory || get().incognitoMode) {
        return;
      }
      
      await StorageManager.addHistoryItem(item);
      await SearchIndexManager.addToIndex({ ...item, id: '', timestamp: Date.now(), visitCount: 1 }, 'history');
      await get().loadHistory();
    } catch (error) {
      console.error('Failed to add to history:', error);
    }
  },
  
  clearHistory: async () => {
    try {
      await StorageManager.clearHistory();
      await get().loadHistory();
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  },
  
  searchHistory: async (query) => {
    try {
      return await StorageManager.searchHistory(query);
    } catch (error) {
      console.error('Failed to search history:', error);
      return [];
    }
  },
  
  // Bookmarks state
  bookmarks: [],
  loadBookmarks: async () => {
    try {
      const bookmarks = await StorageManager.getBookmarks();
      set({ bookmarks });
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    }
  },
  
  addBookmark: async (item) => {
    try {
      await StorageManager.addBookmark(item);
      await SearchIndexManager.addToIndex({ ...item, id: '', dateAdded: Date.now() }, 'bookmark');
      await get().loadBookmarks();
    } catch (error) {
      console.error('Failed to add bookmark:', error);
      throw error;
    }
  },
  
  removeBookmark: async (id) => {
    try {
      await StorageManager.removeBookmark(id);
      await SearchIndexManager.removeFromIndex(id);
      await get().loadBookmarks();
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
    }
  },
  
  updateBookmark: async (id, updates) => {
    try {
      await StorageManager.updateBookmark(id, updates);
      await get().loadBookmarks();
    } catch (error) {
      console.error('Failed to update bookmark:', error);
    }
  },
  
  searchBookmarks: async (query) => {
    try {
      return await StorageManager.searchBookmarks(query);
    } catch (error) {
      console.error('Failed to search bookmarks:', error);
      return [];
    }
  },
  
  // Search functionality
  initializeSearch: async () => {
    try {
      await SearchIndexManager.initialize();
    } catch (error) {
      console.error('Failed to initialize search:', error);
    }
  },
  
  performSearch: async (query, options = {}) => {
    try {
      return await SearchIndexManager.search(query, options);
    } catch (error) {
      console.error('Failed to perform search:', error);
      return [];
    }
  },
  
  // Downloads
  initializeDownloads: async () => {
    try {
      await DownloadManager.initialize();
    } catch (error) {
      console.error('Failed to initialize downloads:', error);
    }
  },
  
  // Initialization
  initialize: async () => {
    try {
      await get().loadSettings();
      await get().loadHistory();
      await get().loadBookmarks();
      await get().initializeSearch();
      await get().initializeDownloads();
    } catch (error) {
      console.error('Failed to initialize browser store:', error);
    }
  },
}));