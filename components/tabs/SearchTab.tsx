import { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { BusService, fetchBusArrivals } from '../../lib/lta';
import { useAppStore } from '../../store/useAppStore';
import { ArrivalCard } from '../ArrivalCard';
import { Colors, Fonts, Radius, Spacing } from '../../constants/theme';

export function SearchTab() {
  const { apiKey, searchQuery, setSearchQuery } = useAppStore();
  const [input, setInput] = useState(searchQuery);
  const [services, setServices] = useState<BusService[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (searchQuery && searchQuery !== input) {
      setInput(searchQuery);
      doSearch(searchQuery);
    }
  }, [searchQuery]);

  async function doSearch(code?: string) {
    const query = (code ?? input).trim();
    if (!query) return;
    if (!apiKey) {
      Alert.alert('No API Key', 'Add your LTA API key in Settings.');
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const data = await fetchBusArrivals(query, apiKey);
      setServices(data);
    } catch {
      Alert.alert('Error', 'Could not fetch arrivals. Check the stop code and API key.');
      setServices([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Bus stop code (e.g. 83139)"
          placeholderTextColor={Colors.textMuted}
          keyboardType="number-pad"
          returnKeyType="search"
          onSubmitEditing={() => doSearch()}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={() => doSearch()} activeOpacity={0.8}>
          <Text style={styles.searchBtnText}>Go</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.accent} size="large" />
        </View>
      )}

      {!loading && searched && services.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.hint}>No services found for this stop.</Text>
        </View>
      )}

      {!loading && !searched && (
        <View style={styles.center}>
          <Text style={styles.icon}>🔎</Text>
          <Text style={styles.hint}>Enter a bus stop code to see live arrivals.</Text>
        </View>
      )}

      {!loading && services.length > 0 && (
        <FlatList
          data={services}
          keyExtractor={(s) => s.ServiceNo}
          renderItem={({ item }) => (
            <ArrivalCard
              serviceNo={item.ServiceNo}
              nextBus={item.NextBus}
              nextBus2={item.NextBus2}
              nextBus3={item.NextBus3}
            />
          )}
          ListHeaderComponent={
            <Text style={styles.stopHeader}>Stop {input}</Text>
          }
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.lg,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surfaceAlt,
    color: Colors.text,
    fontSize: Fonts.size.md,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  searchBtnText: {
    color: Colors.text,
    fontWeight: Fonts.weight.bold,
    fontSize: Fonts.size.md,
  },
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
  stopHeader: {
    color: Colors.textSub,
    fontSize: Fonts.size.sm,
    padding: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
});
