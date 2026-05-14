# BusNow 🚌

A Singapore bus & train arrival app built with React Native (Expo). Real-time data from the [LTA DataMall v3 API](https://datamall.lta.gov.sg).

Dark theme · Red accent · Clean sans-serif · Apple Maps-style layout

---

## Screenshots

> Map background with draggable bottom sheet, colour-coded arrival times, and coloured stop badges.

---

## Features

- **Full-screen map** — Apple Maps-style background centred on Singapore, follows your GPS
- **Draggable bottom sheet** — 3 snap points: minimised handle, half-screen list, full-screen
- **Nearby tab** — automatically loads bus stops within ~700m of your current location
- **Favourites tab** — heart any stop to save it; persisted across sessions
- **Search tab** — enter any bus stop code for live arrivals
- **Map search overlay** — tap the ⌕ icon to search stops by code, name, or road
- **Inline arrivals** — tap a stop row to expand next 3 buses per service
- **Colour-coded timings** — 🟢 >6 min · 🟡 3–6 min · 🔴 ≤3 min · **Arr** = arriving now
- **Load indicator** — Seats / Standing / Limited per bus
- **Bus type badge** — Single / Double / Bendy
- **Train tab** — real-time MRT arrivals grouped by station with line colours
- **Custom stop names** — long-press any stop name to rename it
- **Settings tab** — enter and save your LTA API key

---

## Tech Stack

| Package | Purpose |
|---|---|
| [Expo](https://expo.dev) ~54 | Framework + build tooling |
| [Expo Router](https://expo.github.io/router) ~6 | File-based navigation |
| [@gorhom/bottom-sheet](https://gorhom.dev/react-native-bottom-sheet) v5 | Draggable sheet |
| [react-native-maps](https://github.com/react-native-maps/react-native-maps) | Map view |
| [expo-location](https://docs.expo.dev/versions/latest/sdk/location/) | GPS |
| [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) | Favourites & API key persistence |
| [axios](https://axios-http.com) | HTTP client for LTA API |
| [zustand](https://zustand-demo.pmnd.rs) | Global state |
| [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/) v4 | Animations |
| [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/) | Gesture recognition |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18+
- [Expo Go](https://expo.dev/go) on your phone **or** an Android emulator via [Android Studio](https://developer.android.com/studio)
- A free [LTA DataMall API key](https://datamall.lta.gov.sg/content/datamall/en/request-for-api.html)

### Install

```bash
git clone https://github.com/YOUR_USERNAME/BusNow.git
cd BusNow
npm install --legacy-peer-deps
npx expo install react-native-worklets expo-splash-screen
```

> `--legacy-peer-deps` is required because `react-dom` (a transitive peer of `expo-router`) expects React 19.2.x while the project uses React 19.1.x.

### Run

```bash
npx expo start --clear
```

Then:
- **Android emulator** — press `a`
- **iPhone / Android device** — press `s` to switch to Expo Go, then scan the QR code

### First-time setup in the app

1. Open the **Settings tab** (⚙)
2. Paste your LTA DataMall `AccountKey`
3. Tap **Save API Key** — the status dot turns green
4. Open the **Nearby tab** and grant location permission

---

## Project Structure

```
BusNow/
├── app/
│   ├── _layout.tsx          # Root layout: GestureHandlerRootView + SplashScreen
│   └── index.tsx            # Main screen: MapView + search button + bottom sheet
├── components/
│   ├── MainBottomSheet.tsx  # Bottom sheet with 3 snap points + tab bar
│   ├── BusStopRow.tsx       # Stop list item: badge, name, heart, chevron, arrivals
│   ├── ArrivalCard.tsx      # Per-service arrival row: mins (colour-coded), load, type
│   ├── SearchOverlay.tsx    # Full-screen modal stop search
│   └── tabs/
│       ├── NearbyTab.tsx    # GPS-filtered nearby stops
│       ├── FavouritesTab.tsx
│       ├── SearchTab.tsx    # Direct stop-code arrival lookup
│       ├── TrainTab.tsx     # MRT arrivals grouped by station
│       └── SettingsTab.tsx  # API key input + app info
├── constants/
│   ├── theme.ts             # Colors, Fonts, Spacing, Radius, badge colour palette
│   └── singapore.ts         # Default map region
├── lib/
│   ├── lta.ts               # LTA DataMall API client + helpers
│   └── storage.ts           # AsyncStorage helpers (API key, favourites, custom names)
└── store/
    └── useAppStore.ts       # Zustand global store
```

---

## API Reference

All data comes from the [LTA DataMall v3 API](https://datamall.lta.gov.sg/content/datamall/en/dynamic-data.html).

| Endpoint | Used for |
|---|---|
| `GET /BusStops` | Download all ~5,200 bus stops (paginated, 500/page) |
| `GET /v3/BusArrival?BusStopCode=XXXXX` | Live arrivals for a stop |
| `GET /v3/TrainArrival` | Live MRT arrival times |

**Note:** The `/BusStops` endpoint uses no version prefix — `/v3/BusStops` returns 404.
The `AccountKey` header is required on every request.

---

## Known Limitations

- **Expo Go only** — `react-native-maps` and `@gorhom/bottom-sheet` work in Expo Go but a native development build (`npx expo run:android`) is needed for full map features on Android
- **Emulator location** — Android emulator defaults to Mountain View, CA; set a Singapore coordinate manually via the emulator's Location panel (Lat `1.3048`, Lng `103.8318` for Orchard Road)
- **Train arrivals** — The LTA TrainArrival endpoint has limited coverage; not all stations/lines return real-time data

---

## License

MIT
