import { useRef, useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import BottomSheet from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SINGAPORE_REGION } from '../constants/singapore';
import { Colors } from '../constants/theme';
import { MainBottomSheet } from '../components/MainBottomSheet';
import { SearchOverlay } from '../components/SearchOverlay';
import { useAppStore } from '../store/useAppStore';
import { fetchAllBusStops } from '../lib/lta';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const sheetRef = useRef<BottomSheet>(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const { apiKey, setNearbyStops } = useAppStore();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      mapRef.current?.animateToRegion(
        {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        800
      );

      if (apiKey) {
        try {
          const stops = await fetchAllBusStops(apiKey);
          const nearby = stops
            .filter((s) => {
              const dlat = s.Latitude - loc.coords.latitude;
              const dlng = s.Longitude - loc.coords.longitude;
              return Math.sqrt(dlat * dlat + dlng * dlng) < 0.007;
            })
            .slice(0, 30);
          setNearbyStops(nearby);
        } catch (_) {}
      }
    })();
  }, [apiKey]);

  const handleSearchStop = useCallback((code: string) => {
    setSearchVisible(false);
    useAppStore.getState().setSearchQuery(code);
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_DEFAULT}
        initialRegion={SINGAPORE_REGION}
        showsUserLocation
        showsMyLocationButton={false}
        userInterfaceStyle="dark"
        mapType="standard"
      />

      {/* Search button top-right */}
      <TouchableOpacity
        style={[styles.searchBtn, { top: insets.top + 12 }]}
        onPress={() => setSearchVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.searchIcon}>⌕</Text>
      </TouchableOpacity>

      {searchVisible && (
        <SearchOverlay
          onClose={() => setSearchVisible(false)}
          onSelect={handleSearchStop}
        />
      )}

      <MainBottomSheet ref={sheetRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  searchBtn: {
    position: 'absolute',
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  searchIcon: {
    color: Colors.text,
    fontSize: 22,
    lineHeight: 26,
  },
});
