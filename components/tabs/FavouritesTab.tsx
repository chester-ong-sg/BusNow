import { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { BusStop, fetchBusStops } from '../../lib/lta';
import { useAppStore } from '../../store/useAppStore';
import { BusStopRow } from '../BusStopRow';
import { Colors, Fonts, Spacing } from '../../constants/theme';

export function FavouritesTab() {
  const { apiKey, favourites } = useAppStore();
  const [stops, setStops] = useState<BusStop[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (favourites.length === 0 || !apiKey) return;
    loadFavStops();
  }, [favourites, apiKey]);

  async function loadFavStops() {
    setLoading(true);
    try {
      // Fetch pages until we've seen all favourites or run out of data
      let skip = 0;
      const found: BusStop[] = [];
      const favSet = new Set(favourites);
      while (found.length < favSet.size) {
        const page = await fetchBusStops(apiKey, skip);
        if (page.length === 0) break;
        found.push(...page.filter((s: BusStop) => favSet.has(s.BusStopCode)));
        skip += 500;
        if (skip > 5000) break;
      }
      setStops(found);
    } catch {
      Alert.alert('Error', 'Could not load favourite stops.');
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
      </View>
    );
  }

  if (favourites.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.icon}>♡</Text>
        <Text style={styles.hint}>
          Tap the heart on any stop to save it here.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={stops}
      keyExtractor={(s) => s.BusStopCode}
      renderItem={({ item }) => <BusStopRow stop={item} />}
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
  icon: {
    fontSize: 40,
  },
  hint: {
    color: Colors.textSub,
    fontSize: Fonts.size.md,
    textAlign: 'center',
  },
});
