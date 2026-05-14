# BusNow — Claude Code Context

## Project Overview
Singapore bus & train arrival app. React Native + Expo. Dark theme with red (`#E8003D`) accent.
Data source: LTA DataMall API (free, requires registration).

## Stack
- Expo ~54 / Expo Router ~6 / React Native 0.81
- @gorhom/bottom-sheet v5 (Reanimated 4 + react-native-worklets)
- react-native-maps (PROVIDER_DEFAULT — Google Maps on Android via native build)
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
- `/v3/TrainArrival?StationCode=XXXXX` — real-time MRT arrivals. **StationCode is required** — calling without it returns 404.

### Nearby bus stops
`fetchAllBusStops()` in `lib/lta.ts` fetches all ~5,200 stops across multiple pages.
Filter uses Euclidean distance < 0.007 degrees (~700m radius), sorted by proximity, capped at 20.
Android emulator defaults to California — set latitude/longitude manually in emulator settings.

### Nearby MRT stations
`constants/mrtStations.ts` has a static list of all ~140 MRT/LRT stations with coordinates.
`nearbyMrtStations(lat, lng)` filters by Euclidean distance < 0.012 degrees (~1.2km), sorted by proximity.
`TrainTab` calls `fetchTrainArrivals(apiKey, stationCode)` per nearby station in parallel using `Promise.allSettled`.

### Map pins
`app/index.tsx` renders a `<Marker>` from `react-native-maps` for each stop in `nearbyStops`.
Pins use `pinColor={Colors.accent}` (red). Tap a pin to see stop name, code, and road.

### Bottom sheet
Uses `@gorhom/bottom-sheet` v5. Snap points: `[72, '50%', '92%']`.
Must be wrapped in `GestureHandlerRootView` (done in `app/_layout.tsx`).
`BottomSheetView` (not plain `View`) is required for the sheet content wrapper.
Tabs: Nearby · Favourites · Train · Settings (Search tab removed — use the ⌕ map button instead).

### Google Maps (Android native build)
`react-native-maps` on Android requires a Google Maps API key in `AndroidManifest.xml`:
```xml
<meta-data android:name="com.google.android.geo.API_KEY" android:value="YOUR_KEY"/>
```
Enable **Maps SDK for Android** in Google Cloud Console first.

### Splash screen
`expo-splash-screen` is used. `SplashScreen.preventAutoHideAsync()` is called at module level in
`app/_layout.tsx`. `SplashScreen.hideAsync()` is called after `hydrate()` completes.

## File Map

| File | Purpose |
|---|---|
| `app/_layout.tsx` | Root: GestureHandlerRootView, StatusBar, SplashScreen, hydrate |
| `app/index.tsx` | MapView + Marker pins for nearby stops + search FAB + MainBottomSheet |
| `components/MainBottomSheet.tsx` | Sheet + tab bar (Nearby/Favourites/Train/Settings) |
| `components/BusStopRow.tsx` | List row: badge, name (long-press to rename), heart, chevron, inline arrivals |
| `components/ArrivalCard.tsx` | Per-service row: bus no, colour-coded mins, load, type |
| `components/SearchOverlay.tsx` | Full-screen modal: search stops by code/name/road |
| `components/tabs/NearbyTab.tsx` | GPS stops, all pages, 700m filter, sorted by proximity, max 20, refresh button |
| `components/tabs/FavouritesTab.tsx` | Saved stops, fetches full stop info by code |
| `components/tabs/TrainTab.tsx` | Nearby MRT/LRT stations (static coords), per-station LTA API calls, line colours |
| `components/tabs/SettingsTab.tsx` | API key TextInput + save + link to DataMall |
| `constants/theme.ts` | Colors, Fonts, Spacing, Radius, badgeColor() function |
| `constants/singapore.ts` | Default map region (centre SG) |
| `constants/mrtStations.ts` | Static MRT/LRT station list with coords, line colours, nearbyMrtStations() helper |
| `lib/lta.ts` | makeClient(), fetchBusArrivals(), fetchBusStops(), fetchAllBusStops(), fetchTrainArrivals(apiKey, stationCode), minsToArrival(), loadLabel(), typeLabel() |
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
npx expo prebuild --platform android   # regenerate android/ native folder
```

## Development Notes
- Long-press a stop name in BusStopRow to rename it (stored in AsyncStorage as customNames)
- Heart icon toggles favourite; favourites are stop codes stored as string[]
- expandedStop in Zustand is a single stop code — only one stop expands at a time
- The ⌕ search button on the map opens SearchOverlay which navigates to SearchTab on select
- Nearby stops: sorted by proximity, max 20, ~700m radius
- Nearby MRT stations: sorted by proximity, ~1.2km radius, fetched in parallel per station
