import { View, Text, StyleSheet } from 'react-native';
import { BusArrival, minsToArrival, loadLabel, typeLabel } from '../lib/lta';
import { Colors, Fonts, Spacing, Radius } from '../constants/theme';

interface Props {
  arrival: BusArrival;
  isFirst?: boolean;
}

function minsColor(mins: number | null): string {
  if (mins === null) return Colors.textMuted;
  if (mins <= 3) return Colors.red;
  if (mins <= 6) return Colors.yellow;
  return Colors.green;
}

function minsText(mins: number | null): string {
  if (mins === null) return '–';
  if (mins === 0) return 'Arr';
  return `${mins}`;
}

export function ArrivalPill({ arrival }: Props) {
  const mins = minsToArrival(arrival.EstimatedArrival);
  const color = minsColor(mins);
  const isWheelchair = arrival.Feature === 'WAB';

  return (
    <View style={styles.pill}>
      <Text style={[styles.mins, { color }]}>{minsText(mins)}</Text>
      {mins !== null && mins !== 0 && (
        <Text style={styles.minLabel}> min</Text>
      )}
      {isWheelchair && <Text style={styles.wab}> ♿</Text>}
    </View>
  );
}

interface CardProps {
  serviceNo: string;
  nextBus: BusArrival;
  nextBus2: BusArrival;
  nextBus3: BusArrival;
}

export function ArrivalCard({ serviceNo, nextBus, nextBus2, nextBus3 }: CardProps) {
  const type = typeLabel(nextBus.Type);
  const load = loadLabel(nextBus.Load);

  return (
    <View style={styles.card}>
      <View style={styles.serviceNo}>
        <Text style={styles.serviceText}>{serviceNo}</Text>
      </View>

      <View style={styles.arrivals}>
        <ArrivalPill arrival={nextBus} isFirst />
        <ArrivalPill arrival={nextBus2} />
        <ArrivalPill arrival={nextBus3} />
      </View>

      <View style={styles.meta}>
        {!!load && (
          <View style={[styles.badge, { backgroundColor: loadBg(nextBus.Load) }]}>
            <Text style={styles.badgeText}>{load}</Text>
          </View>
        )}
        {type !== 'Single' && (
          <View style={[styles.badge, { backgroundColor: Colors.border }]}>
            <Text style={styles.badgeText}>{type}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function loadBg(load: BusArrival['Load']): string {
  switch (load) {
    case 'SEA': return '#1A3A2A';
    case 'SDA': return '#3A2A1A';
    case 'LSD': return '#3A1A1A';
    default: return Colors.border;
  }
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    minWidth: 48,
  },
  mins: {
    fontSize: Fonts.size.lg,
    fontWeight: Fonts.weight.bold,
  },
  minLabel: {
    fontSize: Fonts.size.xs,
    color: Colors.textSub,
  },
  wab: {
    fontSize: Fonts.size.xs,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surfaceAlt,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  serviceNo: {
    width: 52,
    backgroundColor: Colors.accent,
    borderRadius: Radius.sm,
    paddingVertical: 3,
    paddingHorizontal: 6,
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  serviceText: {
    color: Colors.text,
    fontSize: Fonts.size.md,
    fontWeight: Fonts.weight.bold,
  },
  arrivals: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  meta: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  badge: {
    borderRadius: Radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: Colors.textSub,
    fontSize: Fonts.size.xs,
    fontWeight: Fonts.weight.medium,
  },
});
