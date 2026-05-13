import { create } from 'zustand';
import { BusStop } from '../lib/lta';
import { getFavourites, getCustomNames, getApiKey } from '../lib/storage';

interface AppState {
  apiKey: string;
  favourites: string[];
  customNames: Record<string, string>;
  nearbyStops: BusStop[];
  expandedStop: string | null;
  searchQuery: string;

  setApiKey: (key: string) => void;
  setFavourites: (favs: string[]) => void;
  setCustomNames: (names: Record<string, string>) => void;
  setNearbyStops: (stops: BusStop[]) => void;
  setExpandedStop: (code: string | null) => void;
  setSearchQuery: (q: string) => void;
  hydrate: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  apiKey: '',
  favourites: [],
  customNames: {},
  nearbyStops: [],
  expandedStop: null,
  searchQuery: '',

  setApiKey: (apiKey) => set({ apiKey }),
  setFavourites: (favourites) => set({ favourites }),
  setCustomNames: (customNames) => set({ customNames }),
  setNearbyStops: (nearbyStops) => set({ nearbyStops }),
  setExpandedStop: (expandedStop) => set({ expandedStop }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  hydrate: async () => {
    const [apiKey, favourites, customNames] = await Promise.all([
      getApiKey(),
      getFavourites(),
      getCustomNames(),
    ]);
    set({ apiKey, favourites, customNames });
  },
}));
