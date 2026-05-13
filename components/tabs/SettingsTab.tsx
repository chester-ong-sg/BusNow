import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Linking,
} from 'react-native';
import { saveApiKey } from '../../lib/storage';
import { useAppStore } from '../../store/useAppStore';
import { Colors, Fonts, Radius, Spacing } from '../../constants/theme';

export function SettingsTab() {
  const { apiKey, setApiKey } = useAppStore();
  const [draft, setDraft] = useState(apiKey);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(apiKey);
  }, [apiKey]);

  async function handleSave() {
    const trimmed = draft.trim();
    if (!trimmed) {
      Alert.alert('Empty key', 'Please paste your LTA DataMall API key.');
      return;
    }
    await saveApiKey(trimmed);
    setApiKey(trimmed);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.sectionTitle}>LTA DataMall API Key</Text>
      <Text style={styles.desc}>
        BusNow uses the LTA DataMall v3 API for live bus and train arrivals.
        {'\n\n'}
        Get your free API key at{' '}
        <Text
          style={styles.link}
          onPress={() => Linking.openURL('https://datamall.lta.gov.sg/content/datamall/en/request-for-api.html')}
        >
          datamall.lta.gov.sg
        </Text>
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>API Key</Text>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={(t) => { setDraft(t); setSaved(false); }}
          placeholder="Paste your AccountKey here"
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={false}
          multiline={false}
        />
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, saved && styles.saveBtnDone]}
        onPress={handleSave}
        activeOpacity={0.8}
      >
        <Text style={styles.saveBtnText}>{saved ? '✓ Saved' : 'Save API Key'}</Text>
      </TouchableOpacity>

      {apiKey ? (
        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>API key configured</Text>
        </View>
      ) : (
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: Colors.textMuted }]} />
          <Text style={styles.statusText}>No API key set</Text>
        </View>
      )}

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>About</Text>
      <Text style={styles.desc}>
        BusNow — Singapore Bus & Train Arrivals{'\n'}
        Data provided by LTA DataMall v3{'\n'}
        Long-press any stop name to rename it.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 60,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: Fonts.size.lg,
    fontWeight: Fonts.weight.bold,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  desc: {
    color: Colors.textSub,
    fontSize: Fonts.size.sm,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  link: {
    color: Colors.accent,
    textDecorationLine: 'underline',
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    color: Colors.textSub,
    fontSize: Fonts.size.sm,
    marginBottom: Spacing.xs,
    fontWeight: Fonts.weight.medium,
  },
  input: {
    backgroundColor: Colors.surfaceAlt,
    color: Colors.text,
    fontSize: Fonts.size.md,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  saveBtnDone: {
    backgroundColor: Colors.green,
  },
  saveBtnText: {
    color: Colors.text,
    fontWeight: Fonts.weight.bold,
    fontSize: Fonts.size.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.green,
  },
  statusText: {
    color: Colors.textSub,
    fontSize: Fonts.size.sm,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginVertical: Spacing.lg,
  },
});
