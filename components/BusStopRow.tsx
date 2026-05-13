import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { BusStop, BusService, fetchBusArrivals } from '../lib/lta';
import { toggleFavourite, setCustomName } from '../lib/storage';
import { useAppStore } from '../store/useAppStore';
import { badgeColor, Colors, Fonts, Radius, Spacing } from '../constants/theme';
import { ArrivalCard } from './ArrivalCard';

interface Props {
  stop: BusStop;
}

function badgeCode(description: string): string {
  const words = description.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function BusStopRow({ stop }: Props) {
  const { apiKey, favourites, customNames, expandedStop, setExpandedStop, setFavourites, setCustomNames } =
    useAppStore();
  const [services, setServices] = useState<BusService[]>([]);
  const [loading, setLoading] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState('');

  const isFav = favourites.includes(stop.BusStopCode);
  const isExpanded = expandedStop === stop.BusStopCode;
  const displayName = customNames[stop.BusStopCode] ?? stop.Description;
  const code = badgeCode(stop.Description);
  const color = badgeColor(code);

  const handleToggle = useCallback(async () => {
    if (isExpanded) {
      setExpandedStop(null);
      return;
    }
    setExpandedStop(stop.BusStopCode);
    if (!apiKey) {
      Alert.alert('No API Key', 'Add your LTA API key in Settings.');
      return;
    }
    setLoading(true);
    try {
      const data = await fetchBusArrivals(stop.BusStopCode, apiKey);
      setServices(data);
    } catch (e) {
      Alert.alert('Error', 'Could not fetch arrivals. Check your API key.');
    } finally {
      setLoading(false);
    }
  }, [isExpanded, stop.BusStopCode, apiKey]);

  const handleFav = useCallback(async () => {
    const next = await toggleFavourite(stop.BusStopCode);
    setFavourites(next);
  }, [stop.BusStopCode]);

  const handleRename = useCallback(() => {
    setDraftName(customNames[stop.BusStopCode] ?? '');
    setRenaming(true);
  }, [customNames, stop.BusStopCode]);

  const commitRename = useCallback(async () => {
    await setCustomName(stop.BusStopCode, draftName);
    const next = { ...customNames, [stop.BusStopCode]: draftName };
    if (!draftName.trim()) delete next[stop.BusStopCode];
    setCustomNames(next);
    setRenaming(false);
  }, [draftName, stop.BusStopCode, customNames]);

  return (
    <View style={styles.wrapper}>
      {/* Main row */}
      <TouchableOpacity
        style={styles.row}
        onPress={handleToggle}
        activeOpacity={0.75}
      >
        {/* Badge */}
        <View style={[styles.badge, { backgroundColor: color }]}>
          <Text style={styles.badgeText}>{code}</Text>
        </View>

        {/* Info */}
        <View style={styles.info}>
          {renaming ? (
            <TextInput
              style={styles.renameInput}
              value={draftName}
              onChangeText={setDraftName}
              onBlur={commitRename}
              onSubmitEditing={commitRename}
              autoFocus
              placeholder={stop.Description}
              placeholderTextColor={Colors.textMuted}
              returnKeyType="done"
            />
          ) : (
            <TouchableOpacity onLongPress={handleRename} activeOpacity={0.8}>
              <Text style={styles.name} numberOfLines={1}>
                {displayName}
              </Text>
            </TouchableOpacity>
          )}
          <Text style={styles.sub}>
            {stop.BusStopCode} · {stop.RoadName}
          </Text>
        </View>

        {/* Heart */}
        <TouchableOpacity
          onPress={handleFav}
          style={styles.iconBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.heart, isFav && styles.heartActive]}>
            {isFav ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>

        {/* Chevron */}
        <Text style={[styles.chevron, isExpanded && styles.chevronUp]}>›</Text>
      </TouchableOpacity>

      {/* Expanded arrivals */}
      {isExpanded && (
        <View>
          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={Colors.accent} />
            </View>
          ) : services.length === 0 ? (
            <Text style={styles.empty}>No services found.</Text>
          ) : (
            services.map((svc) => (
              <ArrivalCard
                key={svc.ServiceNo}
                serviceNo={svc.ServiceNo}
                nextBus={svc.NextBus}
                nextBus2={svc.NextBus2}
                nextBus3={svc.NextBus3}
              />
            ))
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  badgeText: {
    color: '#fff',
    fontSize: Fonts.size.sm,
    fontWeight: Fonts.weight.bold,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: Colors.text,
    fontSize: Fonts.size.md,
    fontWeight: Fonts.weight.semibold,
  },
  sub: {
    color: Colors.textSub,
    fontSize: Fonts.size.sm,
  },
  renameInput: {
    color: Colors.text,
    fontSize: Fonts.size.md,
    fontWeight: Fonts.weight.semibold,
    borderBottomWidth: 1,
    borderBottomColor: Colors.accent,
    paddingVertical: 0,
  },
  iconBtn: {
    paddingHorizontal: Spacing.xs,
  },
  heart: {
    fontSize: 20,
    color: Colors.textMuted,
  },
  heartActive: {
    color: Colors.accent,
  },
  chevron: {
    fontSize: 22,
    color: Colors.textSub,
    marginLeft: Spacing.xs,
    transform: [{ rotate: '0deg' }],
  },
  chevronUp: {
    transform: [{ rotate: '90deg' }],
  },
  loading: {
    padding: Spacing.xl,
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
  },
  empty: {
    color: Colors.textSub,
    textAlign: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.surfaceAlt,
    fontSize: Fonts.size.sm,
  },
});
