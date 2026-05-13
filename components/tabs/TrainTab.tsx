import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { TrainArrivalStation, fetchTrainArrivals, minsToArrival } from '../../lib/lta';
import { useAppStore } from '../../store/useAppStore';
import { Colors, Fonts, Radius, Spacing } from '../../constants/theme';

interface StationGroup {
  code: string;
  name: string;
  arrivals: TrainArrivalStation[];
}

const MRT_LINE_COLORS: Record<string, string> = {
  NS: '#E8003D',
  EW: '#009645',
  CC: '#FA9E0D',
  DT: '#005EC4',
  TE: '#9D5B25',
  NE: '#9900AA',
  BP: '#748477',
  SK: '#748477',
  PE: '#748477',
  PW: '#748477',
  SE: '#748477',
  SW: '#748477',
};

function lineColor(code: string): string {
  const prefix = code.replace(/\d/g, '');
  return MRT_LINE_COLORS[prefix] ?? Colors.textSub;
}

function minsColor(mins: number | null): string {
  if (mins === null) return Colors.textMuted;
  if (mins <= 3) return Colors.red;
  if (mins <= 6) return Colors.yellow;
  return Colors.green;
}

export function TrainTab() {
  const { apiKey } = useAppStore();
  const [stations, setStations] = useState<StationGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    if (!apiKey) {
      Alert.alert('No API Key', 'Add your LTA API key in Settings.');
      return;
    }
    setLoading(true);
    try {
      const data = await fetchTrainArrivals(apiKey);
      const map = new Map<string, StationGroup>();
      for (const item of data) {
        if (!map.has(item.StationCode)) {
          map.set(item.StationCode, {
            code: item.StationCode,
            name: item.StationName,
            arrivals: [],
          });
        }
        map.get(item.StationCode)!.arrivals.push(item);
      }
      setStations(Array.from(map.values()));
      setLoaded(true);
    } catch {
      Alert.alert('Error', 'Could not fetch train arrivals.');
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
        <Text style={styles.hint}>Loading train arrivals…</Text>
      </View>
    );
  }

  if (!loaded) {
    return (
      <View style={styles.center}>
        <Text style={styles.icon}>🚇</Text>
        <Text style={styles.hint}>MRT real-time arrival times</Text>
        <TouchableOpacity style={styles.loadBtn} onPress={load} activeOpacity={0.8}>
          <Text style={styles.loadBtnText}>Load Train Times</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (stations.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.hint}>No train data available right now.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MRT Arrivals</Text>
        <TouchableOpacity onPress={load}>
          <Text style={styles.refresh}>↻ Refresh</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={stations}
        keyExtractor={(s) => s.code}
        renderItem={({ item }) => <StationRow station={item} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

function StationRow({ station }: { station: StationGroup }) {
  const color = lineColor(station.code);
  return (
    <View style={styles.stationRow}>
      <View style={[styles.stationBadge, { backgroundColor: color }]}>
        <Text style={styles.stationCode}>{station.code}</Text>
      </View>
      <View style={styles.stationInfo}>
        <Text style={styles.stationName}>{station.name}</Text>
        <View style={styles.arrivalRow}>
          {station.arrivals.slice(0, 3).map((a, i) => {
            const mins = minsToArrival(a.EstArrival);
            const color = minsColor(mins);
            const label = mins === null ? '–' : mins === 0 ? 'Arr' : `${mins}m`;
            return (
              <View key={i} style={styles.arrPill}>
                <Text style={[styles.arrMins, { color }]}>{label}</Text>
                {!!a.Destination && (
                  <Text style={styles.arrDest} numberOfLines={1}>
                    → {a.Destination}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
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
  stationBadge: {
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    minWidth: 48,
    alignItems: 'center',
    marginTop: 2,
  },
  stationCode: {
    color: '#fff',
    fontSize: Fonts.size.sm,
    fontWeight: Fonts.weight.bold,
  },
  stationInfo: { flex: 1 },
  stationName: {
    color: Colors.text,
    fontSize: Fonts.size.md,
    fontWeight: Fonts.weight.semibold,
    marginBottom: Spacing.xs,
  },
  arrivalRow: {
    flexDirection: 'row',
    gap: Spacing.md,
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
});
