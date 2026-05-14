# BusNow 🚌

A Singapore bus & train arrival app built with React Native (Expo). Real-time data from the [LTA DataMall v3 API](https://datamall.lta.gov.sg).

Dark theme · Red accent · Clean sans-serif · Apple Maps-style layout

---

## Screenshots

> Map background with draggable bottom sheet, colour-coded arrival times, coloured stop badges, and red map pins for nearby stops.

---

## Features

- **Full-screen map** — Google Maps background centred on Singapore, follows your GPS
- **Map pins** — Red pins mark all nearby bus stops directly on the map
- **Draggable bottom sheet** — 3 snap points: minimised handle, half-screen list, full-screen
- **Nearby tab** — automatically loads the 20 closest bus stops within ~700m, sorted by distance
- **Favourites tab** — heart any stop to save it; persisted across sessions
- **Train tab** — nearby MRT/LRT stations within ~1.2km with real-time arrivals, sorted by proximity
- **Inline arrivals** — tap a stop row to expand next 3 buses per service
- **Colour-coded timings** — 🟢 >6 min · 🟡 3–6 min · 🔴 ≤3 min · **Arr** = arriving now
- **Load indicator** — Seats / Standing / Limited per bus
- **Bus type badge** — Single / Double / Bendy
- **Custom stop names** — long-press any stop name to rename it
- **Settings tab** — enter and save your LTA API key

---

## Tech Stack

| Package | Purpose |
|---|---|
| [Expo](https://expo.dev) ~54 | Framework + build tooling |
| [Expo Router](https://expo.github.io/router) ~6 | File-based navigation |
| [@gorhom/bottom-sheet](https://gorhom.dev/react-native-bottom-sheet) v5 | Draggable sheet |
| [react-native-maps](https://github.com/react-native-maps/react-native-maps) | Map view + markers |
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
- [Android Studio](https://developer.android.com/studio) with a Pixel emulator **or** a physical Android/iOS device
- A free [LTA DataMall API key](https://datamall.lta.gov.sg/content/datamall/en/request-for-api.html)
- A [Google Maps API key](https://console.cloud.google.com) with **Maps SDK for Android** enabled (required for the native build)

### Install

```bash
git clone https://github.com/YOUR_USERNAME/BusNow.git
cd BusNow
npm install --legacy-peer-deps
npx expo install react-native-worklets expo-splash-screen
```

> `--legacy-peer-deps` is required because `react-dom` (a transitive peer of `expo-router`) expects React 19.2.x while the project uses React 19.1.x.

### Add your Google Maps API key

Open `android/app/src/main/AndroidManifest.xml` and add inside `<application>`:

```xml
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="YOUR_GOOGLE_MAPS_API_KEY"/>
```

### Run (development build via Android Studio)

```bash
npx expo prebuild --platform android   # generate native android/ folder
npx expo start                         # start Metro bundler
```

Then open the `android/` folder in Android Studio and press **Run ▶**.

### Run (Expo Go — quick preview)

```bash
npx expo start --clear
```

Press `s` to switch to Expo Go mode, then scan the QR code. Note: map pins are not supported in Expo Go.

### First-time setup in the app

1. Open the **Settings tab** (⚙)
2. Paste your LTA DataMall `AccountKey`
3. Tap **Save API Key** — the status dot turns green
4. Open the **Nearby tab** — grant location permission and stops will load automatically

---

## Project Structure

```
BusNow/
├── app/
│   ├── _layout.tsx          # Root layout: GestureHandlerRootView + SplashScreen
│   └── index.tsx            # Main screen: MapView + map pins + search button + bottom sheet
├── components/
│   ├── MainBottomSheet.tsx  # Bottom sheet with 3 snap points + tab bar
│   ├── BusStopRow.tsx       # Stop list item: badge, name, heart, chevron, arrivals
│   ├── ArrivalCard.tsx      # Per-service arrival row: mins (colour-coded), load, type
│   ├── SearchOverlay.tsx    # Full-screen modal stop search (launched from map ⌕ button)
│   └── tabs/
│       ├── NearbyTab.tsx    # 20 closest GPS-filtered bus stops, sorted by distance
│       ├── FavouritesTab.tsx
│       ├── TrainTab.tsx     # Nearby MRT/LRT stations with real-time arrivals
│       └── SettingsTab.tsx  # API key input + app info
├── constants/
│   ├── theme.ts             # Colors, Fonts, Spacing, Radius, badge colour palette
│   ├── singapore.ts         # Default map region
│   └── mrtStations.ts       # Static list of all ~140 MRT/LRT stations with coordinates
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
| `GET /v3/TrainArrival?StationCode=XXXXX` | Live MRT arrival times for a station |

**Notes:**
- The `/BusStops` endpoint uses **no version prefix** — `/v3/BusStops` returns 404.
- `/v3/TrainArrival` requires a `StationCode` query parameter.
- The `AccountKey` header is required on every request.

---

## Known Limitations

- **Google Maps API key required** for the Android native build — add it to `AndroidManifest.xml` as shown above
- **Emulator location** — Android emulator defaults to Mountain View, CA; set a Singapore coordinate manually via the emulator's Location panel (Lat `1.3340`, Lng `103.8470` for Toa Payoh)
- **Train live data coverage** — The LTA TrainArrival endpoint has limited coverage; not all lines/stations return real-time data. Stations with no data show "No live data available"
- **Expo Go** — Map markers are not fully supported in Expo Go; use a development build via Android Studio for the full experience

---

## License

MIT
