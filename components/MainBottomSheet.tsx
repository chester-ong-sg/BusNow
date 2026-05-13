import { forwardRef, useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackgroundProps,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing } from '../constants/theme';
import { NearbyTab } from './tabs/NearbyTab';
import { FavouritesTab } from './tabs/FavouritesTab';
import { SearchTab } from './tabs/SearchTab';
import { TrainTab } from './tabs/TrainTab';
import { SettingsTab } from './tabs/SettingsTab';

type Tab = 'nearby' | 'favourites' | 'search' | 'train' | 'settings';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'nearby', label: 'Nearby', icon: '📍' },
  { id: 'favourites', label: 'Favourites', icon: '♥' },
  { id: 'search', label: 'Search', icon: '🔎' },
  { id: 'train', label: 'Train', icon: '🚇' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
];

function SheetBackground({ style }: BottomSheetBackgroundProps) {
  return (
    <View
      style={[
        style,
        {
          backgroundColor: Colors.surface,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        },
      ]}
    />
  );
}

export const MainBottomSheet = forwardRef<BottomSheet>((_, ref) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>('nearby');

  const snapPoints = useMemo(() => [72, '50%', '92%'], []);

  const renderContent = useCallback(() => {
    switch (activeTab) {
      case 'nearby': return <NearbyTab />;
      case 'favourites': return <FavouritesTab />;
      case 'search': return <SearchTab />;
      case 'train': return <TrainTab />;
      case 'settings': return <SettingsTab />;
    }
  }, [activeTab]);

  return (
    <BottomSheet
      ref={ref}
      snapPoints={snapPoints}
      index={1}
      backgroundComponent={SheetBackground}
      handleIndicatorStyle={styles.handle}
      enablePanDownToClose={false}
    >
      <BottomSheetView style={[styles.container, { paddingBottom: insets.bottom }]}>
        {/* Tab bar */}
        <View style={styles.tabBar}>
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.tabItem}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabIcon, active && styles.tabIconActive]}>
                  {tab.icon}
                </Text>
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
                {active && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {renderContent()}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
});

MainBottomSheet.displayName = 'MainBottomSheet';

const styles = StyleSheet.create({
  handle: {
    backgroundColor: Colors.border,
    width: 40,
  },
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    position: 'relative',
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
    opacity: 0.4,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: Fonts.size.xs,
    color: Colors.textMuted,
    fontWeight: Fonts.weight.medium,
  },
  tabLabelActive: {
    color: Colors.accent,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 2,
    backgroundColor: Colors.accent,
    borderRadius: 1,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
});
