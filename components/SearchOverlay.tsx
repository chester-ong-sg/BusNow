import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BusStop, fetchBusStops } from '../lib/lta';
import { useAppStore } from '../store/useAppStore';
import { Colors, Fonts, Radius, Spacing } from '../constants/theme';

interface Props {
  onClose: () => void;
  onSelect: (code: string) => void;
}

export function SearchOverlay({ onClose, onSelect }: Props) {
  const insets = useSafeAreaInsets();
  const { apiKey } = useAppStore();
  const [query, setQuery] = useState('');
  const [allStops, setAllStops] = useState<BusStop[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    inputRef.current?.focus();
    if (apiKey && allStops.length === 0) {
      loadStops();
    }
  }, []);

  async function loadStops() {
    setLoading(true);
    try {
      const stops = await fetchBusStops(apiKey);
      setAllStops(stops);
    } catch (_) {}
    setLoading(false);
  }

  const filtered = query.length < 2
    ? []
    : allStops.filter(
        (s) =>
          s.BusStopCode.includes(query) ||
          s.Description.toLowerCase().includes(query.toLowerCase()) ||
          s.RoadName.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 30);

  function handleSelect(stop: BusStop) {
    onSelect(stop.BusStopCode);
  }

  return (
    <Modal
      visible
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
          {/* Search bar */}
          <View style={styles.searchRow}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={query}
              onChangeText={setQuery}
              placeholder="Stop code, name or road…"
              placeholderTextColor={Colors.textMuted}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Results */}
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={Colors.accent} />
              <Text style={styles.hint}>Loading stops…</Text>
            </View>
          ) : query.length < 2 ? (
            <View style={styles.center}>
              <Text style={styles.hint}>Type a stop code, name, or road</Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.hint}>No stops found</Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(s) => s.BusStopCode}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.result}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.codeTag}>
                    <Text style={styles.codeText}>{item.BusStopCode}</Text>
                  </View>
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName} numberOfLines={1}>
                      {item.Description}
                    </Text>
                    <Text style={styles.resultRoad} numberOfLines={1}>
                      {item.RoadName}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surfaceAlt,
    color: Colors.text,
    fontSize: Fonts.size.md,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelBtn: {
    paddingHorizontal: Spacing.sm,
  },
  cancelText: {
    color: Colors.accent,
    fontSize: Fonts.size.md,
    fontWeight: Fonts.weight.medium,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  hint: {
    color: Colors.textSub,
    fontSize: Fonts.size.md,
    marginTop: Spacing.sm,
  },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  codeTag: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    minWidth: 56,
    alignItems: 'center',
  },
  codeText: {
    color: Colors.accent,
    fontSize: Fonts.size.sm,
    fontWeight: Fonts.weight.bold,
    fontVariant: ['tabular-nums'],
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    color: Colors.text,
    fontSize: Fonts.size.md,
    fontWeight: Fonts.weight.medium,
  },
  resultRoad: {
    color: Colors.textSub,
    fontSize: Fonts.size.sm,
  },
});
