import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { TrainArrivalStation, fetchTrainArrivals, minsToArrival } from '../../lib/lta';
import { MrtStation, nearbyMrtStations, lineColor } from '../../constants/mrtStations';
import { useAppStore } from '../../store/useAppStore';
import { Colors, Fonts, Radius, Spacing } from '../../constants/theme';

interface StationWithArrivals {
  station: MrtStation;
  arrivals: TrainArrivalStation[];
}

function minsColor(mins: number | null): string {
  if (mins === null) return Colors.textMuted;
  if (mins <= 3) return Colors.red;
  if (mins <= 6) return Colors.yellow;
  return Colors.green;
}

export function TrainTab() {
  const { apiKey } = useAppStore();
  const [data, setData] = useState<StationWithArrivals[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (apiKey) load();
  }, [apiKey]);

  async function load() {
    if (!apiKey) {
      Alert.alert('No API Key', 'Add your LTA API key in Settings.');
      return;
    }
    setLoading(true);
    try {
      // 1. Get location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location denied', 'Grant location permission to find nearby stations.');
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;

      // 2. Find nearby stations from static list (~1.2km radius)
      const nearby = nearbyMrtStations(latitude, longitude);

      if (nearby.length === 0) {
        setData([]);
        setLoaded(true);
        setLoading(false);
        return;
      }

      // 3. Fetch arrivals per nearby station in parallel
      const arrivalResults = await Promise.allSettled(
        nearby.map((s) => fetchTrainArrivals(apiKey, s.code))
      );

      const result: StationWithArrivals[] = nearby.map((s, i) => {
        const settled = arrivalResults[i];
        return {
          station: s,
          arrivals: settled.status === 'fulfilled' ? settled.value : [],
        };
      });

      setData(result);
      setLoaded(true);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not fetch train arrivals.');
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
        <Text style={styles.hint}>Finding nearby stations…</Text>
      </View>
    );
  }

  if (!loaded) {
    return (
      <View style={styles.center}>
        <Text style={styles.icon}>🚇</Text>
        <Text style={styles.hint}>Nearby MRT / LRT arrivals</Text>
        <TouchableOpacity style={styles.loadBtn} onPress={load} activeOpacity={0.8}>
          <Text style={styles.loadBtnText}>Load Train Times</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.icon}>🚇</Text>
        <Text style={styles.hint}>No MRT/LRT stations within 1.2 km.</Text>
        <TouchableOpacity style={styles.loadBtn} onPress={load} activeOpacity={0.8}>
          <Text style={styles.loadBtnText}>↻ Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nearby Trains</Text>
        <TouchableOpacity onPress={load}>
          <Text style={styles.refresh}>↻ Refresh</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => item.station.code}
        renderItem={({ item }) => <StationRow item={item} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

function StationRow({ item }: { item: StationWithArrivals }) {
  const { station, arrivals } = item;
  const color = lineColor(station.code);
  const hasArrivals = arrivals.length > 0;

  return (
    <View style={styles.stationRow}>
      {/* Line badge */}
      <View style={[styles.badge, { backgroundColor: color }]}>
        <Text style={styles.badgeCode}>{station.code}</Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name}>{station.name}</Text>

        {hasArrivals ? (
          <View style={styles.arrivalRow}>
            {arrivals.slice(0, 3).map((a, i) => {
              const mins = minsToArrival(a.EstArrival);
              const col = minsColor(mins);
              const label = mins === null ? '–' : mins === 0 ? 'Arr' : `${mins}m`;
              return (
                <View key={i} style={styles.arrPill}>
                  <Text style={[styles.arrMins, { color: col }]}>{label}</Text>
                  {!!a.Destination && (
                    <Text style={styles.arrDest} numberOfLines={1}>
                      → {a.Destination}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={styles.noData}>No live data available</Text>
        )}
      </View>
    </View>
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
  loadBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  loadBtnText: {
    color: Colors.text,
    fontWeight: Fonts.weight.bold,
    fontSize: Fonts.size.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: Fonts.size.lg,
    fontWeight: Fonts.weight.semibold,
  },
  refresh: {
    color: Colors.accent,
    fontSize: Fonts.size.md,
    fontWeight: Fonts.weight.medium,
  },
  stationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: Spacing.md,
  },
  badge: {
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    minWidth: 52,
    alignItems: 'center',
    marginTop: 2,
  },
  badgeCode: {
    color: '#fff',
    fontSize: Fonts.size.sm,
    fontWeight: Fonts.weight.bold,
  },
  info: { flex: 1 },
  name: {
    color: Colors.text,
    fontSize: Fonts.size.md,
    fontWeight: Fonts.weight.semibold,
    marginBottom: Spacing.xs,
  },
  arrivalRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    flexWrap: 'wrap',
  },
  arrPill: {
    alignItems: 'flex-start',
  },
  arrMins: {
    fontSize: Fonts.size.lg,
    fontWeight: Fonts.weight.bold,
  },
  arrDest: {
    color: Colors.textSub,
    fontSize: Fonts.size.xs,
    maxWidth: 100,
  },
  noData: {
    color: Colors.textMuted,
    fontSize: Fonts.size.sm,
    fontStyle: 'italic',
  },
});
