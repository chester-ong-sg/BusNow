# BusNow — Claude Code Context

## Project Overview
Singapore bus & train arrival app. React Native + Expo. Dark theme with red (`#E8003D`) accent.
Data source: LTA DataMall API (free, requires registration).

## Stack
- Expo ~54 / Expo Router ~6 / React Native 0.81
- @gorhom/bottom-sheet v5 (Reanimated 4 + react-native-worklets)
- react-native-maps (PROVIDER_DEFAULT — Apple Maps on iOS, Google Maps on Android)
- expo-location for GPS
- AsyncStorage for persistence
- zustand for global state
- axios for HTTP

## Key Quirks & Gotchas

### npm installs
Always use `--legacy-peer-deps`. A transitive `react-dom@19.2.6` conflicts with `react@19.1.0`.
Never run `npm audit fix --force` — it downgrades expo destructively.

```bash
npm install <package> --legacy-peer-deps
npx expo install <expo-package>   # use this for Expo SDK packages
```

### LTA DataMall API
Base URL: `https://datamall2.mytransport.sg/ltaodataservice`
Header: `AccountKey: <key>`

- `/BusStops` — paginated 500/page, use `$skip`. **No `/v3/` prefix** — that path 404s.
- `/v3/BusArrival?BusStopCode=XXXXX` — real-time bus arrivals
- `/v3/TrainArrival` — real-time MRT arrivals

### Nearby stops
`fetchAllBusStops()` in `lib/lta.ts` fetches all ~5,200 stops across multiple pages.
Filter uses Euclidean distance < 0.007 degrees (~700m radius).
Android emulator defaults to California — set latitude/longitude manually in emulator settings.

### Bottom sheet
Uses `@gorhom/bottom-sheet` v5. Snap points: `[72, '50%', '92%']`.
Must be wrapped in `GestureHandlerRootView` (done in `app/_layout.tsx`).
`BottomSheetView` (not plain `View`) is required for the sheet content wrapper.

### Splash screen
`expo-splash-screen` is used. `SplashScreen.preventAutoHideAsync()` is called at module level in
`app/_layout.tsx`. `SplashScreen.hideAsync()` is called after `hydrate()` completes.

## File Map

| File | Purpose |
|---|---|
| `app/_layout.tsx` | Root: GestureHandlerRootView, StatusBar, SplashScreen, hydrate |
| `app/index.tsx` | MapView + search FAB + MainBottomSheet |
| `components/MainBottomSheet.tsx` | Sheet + tab bar (Nearby/Favourites/Search/Train/Settings) |
| `components/BusStopRow.tsx` | List row: badge, name (long-press to rename), heart, chevron, inline arrivals |
| `components/ArrivalCard.tsx` | Per-service row: bus no, colour-coded mins, load, type |
| `components/SearchOverlay.tsx` | Full-screen modal: search stops by code/name/road |
| `components/tabs/NearbyTab.tsx` | GPS stops, loads all pages, 700m filter, refresh button |
| `components/tabs/FavouritesTab.tsx` | Saved stops, fetches full stop info by code |
| `components/tabs/SearchTab.tsx` | Manual stop-code arrival lookup |
| `components/tabs/TrainTab.tsx` | MRT arrivals, grouped by StationCode, line colours |
| `components/tabs/SettingsTab.tsx` | API key TextInput + save + link to DataMall |
| `constants/theme.ts` | Colors, Fonts, Spacing, Radius, badgeColor() function |
| `constants/singapore.ts` | Default map region (centre SG) |
| `lib/lta.ts` | makeClient(), fetchBusArrivals(), fetchBusStops(), fetchAllBusStops(), fetchTrainArrivals(), minsToArrival(), loadLabel(), typeLabel() |
| `lib/storage.ts` | getApiKey/saveApiKey, getFavourites/toggleFavourite, getCustomNames/setCustomName |
| `store/useAppStore.ts` | Zustand: apiKey, favourites, customNames, nearbyStops, expandedStop, searchQuery + hydrate() |

## Color Reference
```ts
bg:         '#000000'   // screen background
surface:    '#111111'   // sheet, cards
surfaceAlt: '#1C1C1E'   // arrival rows
border:     '#2C2C2E'
accent:     '#E8003D'   // red — primary brand colour
text:       '#FFFFFF'
textSub:    '#8E8E93'
textMuted:  '#48484A'
green:      '#30D158'   // >6 min
yellow:     '#FFD60A'   // 3-6 min
red:        '#FF453A'   // ≤3 min
```

## Common Commands
```bash
npx expo start --clear      # start Metro with cache cleared
npx expo start              # normal start
npx expo install <pkg>      # install Expo SDK packages (auto-matches SDK version)
npx expo doctor             # check dependency mismatches
```

## Development Notes
- Long-press a stop name in BusStopRow to rename it (stored in AsyncStorage as customNames)
- Heart icon toggles favourite; favourites are stop codes stored as string[]
- expandedStop in Zustand is a single stop code — only one stop expands at a time
- The ⌕ search button on the map opens SearchOverlay which navigates to SearchTab on select
