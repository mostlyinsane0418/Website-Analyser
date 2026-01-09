// Fashion Resale Discovery Platform - Global State Store

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  Region,
  Currency,
  Listing,
  Collection,
  SearchHistoryItem,
  LookbookItem,
  PriceAlert,
  UserSizes,
  SearchFilters,
} from '@/types';
import { REGION_CURRENCY } from '@/lib/constants';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// User Preferences Store
// ============================================

interface UserPreferencesState {
  // Region & Currency
  region: Region;
  currency: Currency;
  setRegion: (region: Region) => void;
  setCurrency: (currency: Currency) => void;

  // Sizes
  sizes: UserSizes;
  setSizes: (sizes: UserSizes) => void;

  // Style Preferences
  favoriteBrands: string[];
  stylePreferences: string[];
  addFavoriteBrand: (brand: string) => void;
  removeFavoriteBrand: (brand: string) => void;
  setStylePreferences: (styles: string[]) => void;

  // UI Preferences
  showInternationalListings: boolean;
  setShowInternationalListings: (show: boolean) => void;
}

export const useUserPreferencesStore = create<UserPreferencesState>()(
  persist(
    (set) => ({
      // Defaults
      region: 'US',
      currency: 'USD',
      sizes: {},
      favoriteBrands: [],
      stylePreferences: [],
      showInternationalListings: false,

      // Actions
      setRegion: (region) =>
        set({
          region,
          currency: REGION_CURRENCY[region],
        }),

      setCurrency: (currency) => set({ currency }),

      setSizes: (sizes) => set({ sizes }),

      addFavoriteBrand: (brand) =>
        set((state) => ({
          favoriteBrands: state.favoriteBrands.includes(brand)
            ? state.favoriteBrands
            : [...state.favoriteBrands, brand],
        })),

      removeFavoriteBrand: (brand) =>
        set((state) => ({
          favoriteBrands: state.favoriteBrands.filter((b) => b !== brand),
        })),

      setStylePreferences: (styles) => set({ stylePreferences: styles }),

      setShowInternationalListings: (show) =>
        set({ showInternationalListings: show }),
    }),
    {
      name: 'user-preferences',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ============================================
// Saved Items Store
// ============================================

interface SavedItemsState {
  // Saved Items
  savedItems: string[]; // listing IDs
  isSaved: (listingId: string) => boolean;
  toggleSave: (listingId: string) => void;
  saveItem: (listingId: string) => void;
  unsaveItem: (listingId: string) => void;

  // Collections
  collections: Collection[];
  createCollection: (name: string) => Collection;
  deleteCollection: (collectionId: string) => void;
  renameCollection: (collectionId: string, name: string) => void;
  addToCollection: (collectionId: string, listingId: string) => void;
  removeFromCollection: (collectionId: string, listingId: string) => void;

  // Lookbook
  lookbook: LookbookItem[];
  addToLookbook: (item: Omit<LookbookItem, 'id' | 'timestamp'>) => void;
  removeFromLookbook: (itemId: string) => void;

  // Price Alerts
  priceAlerts: PriceAlert[];
  addPriceAlert: (listingId: string, targetPrice: number, currency: Currency) => void;
  removePriceAlert: (listingId: string) => void;
  hasPriceAlert: (listingId: string) => boolean;
}

export const useSavedItemsStore = create<SavedItemsState>()(
  persist(
    (set, get) => ({
      savedItems: [],
      collections: [],
      lookbook: [],
      priceAlerts: [],

      isSaved: (listingId) => get().savedItems.includes(listingId),

      toggleSave: (listingId) => {
        const state = get();
        if (state.savedItems.includes(listingId)) {
          set({ savedItems: state.savedItems.filter((id) => id !== listingId) });
        } else {
          set({ savedItems: [...state.savedItems, listingId] });
        }
      },

      saveItem: (listingId) =>
        set((state) => ({
          savedItems: state.savedItems.includes(listingId)
            ? state.savedItems
            : [...state.savedItems, listingId],
        })),

      unsaveItem: (listingId) =>
        set((state) => ({
          savedItems: state.savedItems.filter((id) => id !== listingId),
        })),

      createCollection: (name) => {
        const newCollection: Collection = {
          id: uuidv4(),
          name,
          items: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          collections: [...state.collections, newCollection],
        }));
        return newCollection;
      },

      deleteCollection: (collectionId) =>
        set((state) => ({
          collections: state.collections.filter((c) => c.id !== collectionId),
        })),

      renameCollection: (collectionId, name) =>
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === collectionId
              ? { ...c, name, updatedAt: new Date().toISOString() }
              : c
          ),
        })),

      addToCollection: (collectionId, listingId) =>
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === collectionId && !c.items.includes(listingId)
              ? {
                  ...c,
                  items: [...c.items, listingId],
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
        })),

      removeFromCollection: (collectionId, listingId) =>
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === collectionId
              ? {
                  ...c,
                  items: c.items.filter((id) => id !== listingId),
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
        })),

      addToLookbook: (item) => {
        const newItem: LookbookItem = {
          ...item,
          id: uuidv4(),
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          lookbook: [...state.lookbook, newItem],
        }));
      },

      removeFromLookbook: (itemId) =>
        set((state) => ({
          lookbook: state.lookbook.filter((item) => item.id !== itemId),
        })),

      addPriceAlert: (listingId, targetPrice, currency) =>
        set((state) => ({
          priceAlerts: [
            ...state.priceAlerts.filter((a) => a.listingId !== listingId),
            {
              listingId,
              targetPrice,
              currency,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      removePriceAlert: (listingId) =>
        set((state) => ({
          priceAlerts: state.priceAlerts.filter((a) => a.listingId !== listingId),
        })),

      hasPriceAlert: (listingId) =>
        get().priceAlerts.some((a) => a.listingId === listingId),
    }),
    {
      name: 'saved-items',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ============================================
// Search Store
// ============================================

interface SearchState {
  // Current Search
  query: string;
  filters: SearchFilters;
  setQuery: (query: string) => void;
  setFilters: (filters: SearchFilters) => void;
  updateFilter: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
  clearFilters: () => void;

  // Search History
  searchHistory: SearchHistoryItem[];
  addToHistory: (query: string, filters?: SearchFilters) => void;
  clearHistory: () => void;

  // Recent Searches
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      query: '',
      filters: {},
      searchHistory: [],
      recentSearches: [],

      setQuery: (query) => set({ query }),

      setFilters: (filters) => set({ filters }),

      updateFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        })),

      clearFilters: () => set({ filters: {} }),

      addToHistory: (query, filters) =>
        set((state) => ({
          searchHistory: [
            { query, filters, timestamp: new Date().toISOString() },
            ...state.searchHistory.slice(0, 99), // Keep last 100
          ],
        })),

      clearHistory: () => set({ searchHistory: [] }),

      addRecentSearch: (query) =>
        set((state) => ({
          recentSearches: [
            query,
            ...state.recentSearches.filter((s) => s !== query).slice(0, 9),
          ],
        })),
    }),
    {
      name: 'search-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        searchHistory: state.searchHistory,
        recentSearches: state.recentSearches,
      }),
    }
  )
);

// ============================================
// UI Store (non-persisted)
// ============================================

interface UIState {
  // Modals
  isSearchModalOpen: boolean;
  isFilterModalOpen: boolean;
  isVisualSearchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;
  setFilterModalOpen: (open: boolean) => void;
  setVisualSearchModalOpen: (open: boolean) => void;

  // Loading States
  isLoading: boolean;
  loadingMessage: string | null;
  setLoading: (loading: boolean, message?: string) => void;

  // Toast/Notifications
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;

  // Mobile Menu
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isSearchModalOpen: false,
  isFilterModalOpen: false,
  isVisualSearchModalOpen: false,
  isLoading: false,
  loadingMessage: null,
  toast: null,
  isMobileMenuOpen: false,

  setSearchModalOpen: (open) => set({ isSearchModalOpen: open }),
  setFilterModalOpen: (open) => set({ isFilterModalOpen: open }),
  setVisualSearchModalOpen: (open) => set({ isVisualSearchModalOpen: open }),

  setLoading: (loading, message) =>
    set({
      isLoading: loading,
      loadingMessage: message || null,
    }),

  showToast: (message, type = 'info') =>
    set({ toast: { message, type } }),

  hideToast: () => set({ toast: null }),

  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
}));

// ============================================
// Listings Cache Store (for client-side caching)
// ============================================

interface ListingsCacheState {
  listings: Record<string, Listing>;
  cacheListing: (listing: Listing) => void;
  cacheListings: (listings: Listing[]) => void;
  getListing: (id: string) => Listing | undefined;
  clearCache: () => void;
}

export const useListingsCacheStore = create<ListingsCacheState>()((set, get) => ({
  listings: {},

  cacheListing: (listing) =>
    set((state) => ({
      listings: { ...state.listings, [listing.id]: listing },
    })),

  cacheListings: (listings) =>
    set((state) => ({
      listings: {
        ...state.listings,
        ...Object.fromEntries(listings.map((l) => [l.id, l])),
      },
    })),

  getListing: (id) => get().listings[id],

  clearCache: () => set({ listings: {} }),
}));
