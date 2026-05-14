import { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { BusStop, fetchAllBusStops } from '../../lib/lta';
import { useAppStore } from '../../store/useAppStore';
import { BusStopRow } from '../BusStopRow';
import { Colors, Fonts, Radius, Spacing } from '../../constants/theme';

export function NearbyTab() {
  const { apiKey, nearbyStops, setNearbyStops } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Finding nearby stops…');

  useEffect(() => {
    if (!apiKey) return;
    // Always reload when the tab gains an apiKey (first time or change)
    if (nearbyStops.length === 0) loadNearby();
  }, [apiKey]);

  async function loadNearby() {
    if (!apiKey) {
      Alert.alert('No API Key', 'Add your LTA API key in Settings first.');
      return;
    }
    setLoading(true);
    setLoadingMsg('Requesting location…');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location denied', 'Grant location permission to find nearby stops.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLoadingMsg('Downloading bus stops…');
      const allStops = await fetchAllBusStops(apiKey);
      setLoadingMsg('Filtering nearby stops…');
      const nearby = allStops
        .filter((s: BusStop) => {
          const dlat = s.Latitude - loc.coords.latitude;
          const dlng = s.Longitude - loc.coords.longitude;
          return Math.sqrt(dlat * dlat + dlng * dlng) < 0.007; // ~700m radius
        })
        .sort((a, b) => {
          const da = Math.sqrt(
            Math.pow(a.Latitude - loc.coords.latitude, 2) +
            Math.pow(a.Longitude - loc.coords.longitude, 2)
          );
          const db = Math.sqrt(
            Math.pow(b.Latitude - loc.coords.latitude, 2) +
            Math.pow(b.Longitude - loc.coords.longitude, 2)
          );
          return da - db;
        })
        .slice(0, 20);
      setNearbyStops(nearby);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to load nearby stops.');
    } finally {
      setLoading(false);
    }
  }

  if (!apiKey) {
    return (
      <View style={styles.center}>
        <Text style={styles.icon}>🔑</Text>
        <Text style={styles.hint}>Add your LTA API key in Settings.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.accent} size="large" />
        <Text style={styles.hint}>{loadingMsg}</Text>
      </View>
    );
  }

  if (nearbyStops.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.icon}>📍</Text>
        <Text style={styles.hint}>No nearby stops found.</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={loadNearby} activeOpacity={0.8}>
          <Text style={styles.refreshText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={nearbyStops}
      keyExtractor={(s) => s.BusStopCode}
      renderItem={({ item }) => <BusStopRow stop={item} />}
      ListHeaderComponent={
        <View style={styles.listHeader}>
          <Text style={styles.listHeaderText}>{nearbyStops.length} stops nearby</Text>
          <TouchableOpacity onPress={() => { setNearbyStops([]); loadNearby(); }}>
            <Text style={styles.refreshLink}>↻ Refresh</Text>
          </TouchableOpacity>
        </View>
      }
      contentContainerStyle={{ paddingBottom: 40 }}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.xl,
  },
  icon: { fontSize: 40 },
  hint: {
    color: Colors.textSub,
    fontSize: Fonts.size.md,
    textAlign: 'center',
  },
  refreshBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  refreshText: {
    color: Colors.text,
    fontWeight: Fonts.weight.bold,
    fontSize: Fonts.size.md,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  listHeaderText: {
    color: Colors.textSub,
    fontSize: Fonts.size.sm,
  },
  refreshLink: {
    color: Colors.accent,
    fontSize: Fonts.size.sm,
    fontWeight: Fonts.weight.medium,
  },
});
