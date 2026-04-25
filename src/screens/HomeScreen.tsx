import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {Colors, Typography, Spacing, Radius} from '../theme';
import FeatureCard from '../components/FeatureCard';
import {usePatient} from '../store/PatientContext';
import {RootStackParamList} from '../navigation/types';

type NavProp = StackNavigationProp<RootStackParamList, 'Home'>;

const FEATURES = [
  {
    screen: 'Medicine' as keyof RootStackParamList,
    icon: '💊',
    title: 'İlaç Kutusu Rehberi',
    subtitle: 'AR ile ilaç dozu ve zamanı görüntüle',
    color: Colors.brandBlue,
  },
  {
    screen: 'WaterTracker' as keyof RootStackParamList,
    icon: '💧',
    title: 'Su Tüketimi Takibi',
    subtitle: 'Günlük hedefini AR şişe ile izle',
    color: Colors.brandTeal,
  },
  {
    screen: 'Nutrition' as keyof RootStackParamList,
    icon: '🥗',
    title: 'Beslenme Rehberi',
    subtitle: 'İzinli ve yasaklı besinleri AR ile keşfet',
    color: Colors.success,
  },
  {
    screen: 'BagChecklist' as keyof RootStackParamList,
    icon: '🧳',
    title: 'Hastane Çantası',
    subtitle: 'Eşya listeni AR hologramla kontrol et',
    color: Colors.warning,
  },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const insets = useSafeAreaInsets();
  const {state} = usePatient();

  const waterProgress =
    state.waterGoalMl > 0 ? state.waterIntakeMl / state.waterGoalMl : 0;

  const packedCount = state.bagChecklist.filter(i => i.packed).length;
  const totalItems = state.bagChecklist.length;

  const getSurgeryCountdown = (): string => {
    if (!state.surgeryDate) return 'Tarih girilmedi';
    const diff = Math.ceil(
      (new Date(state.surgeryDate).getTime() - Date.now()) / 86_400_000,
    );
    if (diff < 0) return 'Ameliyat tamamlandı';
    if (diff === 0) return 'Bugün!';
    return `${diff} gün kaldı`;
  };

  return (
    <View style={[styles.screen, {paddingTop: insets.top}]}>
      {/* ── Header alanı ────────────────────────────── */}
      <View style={styles.heroSection}>
        <View style={styles.heroRow}>
          <View>
            <Text style={styles.greeting}>Merhaba 👋</Text>
            <Text style={styles.patientName}>
              {state.name || 'Hastamız'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('PatientProfile')}
            style={styles.profileBtn}>
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Ameliyat geri sayımı */}
        <View style={styles.countdownChip}>
          <Text style={styles.countdownLabel}>Ameliyat</Text>
          <Text style={styles.countdownValue}>{getSurgeryCountdown()}</Text>
        </View>
      </View>

      {/* ── Modül listesi ───────────────────────────── */}
      <ScrollView
        contentContainerStyle={[
          styles.list,
          {paddingBottom: insets.bottom + Spacing.xl},
        ]}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>AR Modülleri</Text>

        {FEATURES.map(feature => {
          let progress: number | undefined;
          if (feature.screen === 'WaterTracker') {
            progress = waterProgress;
          } else if (feature.screen === 'BagChecklist' && totalItems > 0) {
            progress = packedCount / totalItems;
          }

          return (
            <FeatureCard
              key={feature.screen}
              icon={feature.icon}
              title={feature.title}
              subtitle={feature.subtitle}
              accentColor={feature.color}
              progress={progress}
              badge={(feature as any).badge}
              onPress={() => navigation.navigate(feature.screen as any)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  heroSection: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  patientName: {
    ...Typography.displayMedium,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.round,
    backgroundColor: Colors.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  profileIcon: {
    fontSize: 20,
  },
  countdownChip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.brandBlue + '55',
  },
  countdownLabel: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
  },
  countdownValue: {
    ...Typography.labelLarge,
    color: Colors.brandBlue,
  },
  list: {
    padding: Spacing.base,
  },
  sectionTitle: {
    ...Typography.headingLarge,
    color: Colors.textPrimary,
    marginBottom: Spacing.base,
  },
});

export default HomeScreen;
