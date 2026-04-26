import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {Colors, Typography, Spacing, Radius, Shadow} from '../theme';
import Header from '../components/Header';
import AROverlay from '../components/AROverlay';
import MedicineAR from '../ar/MedicineAR';
import {RootStackParamList} from '../navigation/types';
import {MedicineInfo} from '../components/MedicineInfoCard';

// ── İlaç verileri ─────────────────────────────────────────────────────────────
import medicationsData from '../data/medications.json';
const allMedicines: MedicineInfo[] = medicationsData.medicines as MedicineInfo[];

// ── Kategorileri çıkar ────────────────────────────────────────────────────────
const ALL_CATEGORIES = ['Tümü', ...new Set(allMedicines.map(m => m.category))];

type NavProp = StackNavigationProp<RootStackParamList, 'Medicine'>;

const MedicineScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const [arActive, setArActive] = useState(false);
  const [alertMed, setAlertMed] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Tümü');

  // Kategoriye göre filtreleme
  const filteredMedicines = useMemo(() => {
    if (selectedCategory === 'Tümü') return allMedicines;
    return allMedicines.filter(m => m.category === selectedCategory);
  }, [selectedCategory]);

  // Kategorilere göre gruplama
  const groupedMedicines = useMemo(() => {
    const groups: Record<string, MedicineInfo[]> = {};
    filteredMedicines.forEach(med => {
      if (!groups[med.category]) groups[med.category] = [];
      groups[med.category].push(med);
    });
    return groups;
  }, [filteredMedicines]);

  return (
    <View style={styles.screen}>
      <Header
        title="İlaç Rehberi"
        subtitle="Karaciğer Nakli İlaçları"
        onBack={() => navigation.goBack()}
        rightAction={{icon: '📷', onPress: () => setArActive(v => !v)}}
      />

      {/* ── AR Kamera Görünümü — tam ekran overlay ─────────────────────────── */}
      {arActive && (
        <View style={styles.arOverlay}>
          <MedicineAR
            onMedicineDetected={id => {
              // Kamera ekranını kapat
              setArActive(false);
              // İlaç detay sayfasına git ve otomatik hatırlatıcı sormasını sağla
              navigation.navigate('MedicineDetail', {
                medicineId: id,
                autoPromptReminder: true,
              });
            }}
            onClose={() => setArActive(false)}
          />
        </View>
      )}

      {/* ── Kategori Filtreleme ────────────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}>
        {ALL_CATEGORIES.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(category)}>
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === category && styles.categoryChipTextActive,
              ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── İlaç listesi ───────────────────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}>
        {Object.entries(groupedMedicines).map(([category, medicines]) => (
          <View key={category}>
            {/* Kategori başlığı (sadece "Tümü" seçiliyken göster) */}
            {selectedCategory === 'Tümü' && (
              <Text style={styles.groupTitle}>{category}</Text>
            )}

            {medicines.map(med => (
              <TouchableOpacity
                key={med.id}
                style={styles.medCard}
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate('MedicineDetail', {medicineId: med.id})
                }>
                {/* Sol renkli bar */}
                <View
                  style={[styles.cardAccent, {backgroundColor: med.color}]}
                />

                <View style={styles.cardContent}>
                  {/* Üst satır */}
                  <View style={styles.cardTopRow}>
                    <View
                      style={[
                        styles.cardIconWrapper,
                        {backgroundColor: med.color + '22'},
                      ]}>
                      <Text style={styles.cardIcon}>{med.icon}</Text>
                    </View>
                    <View style={styles.cardTextBlock}>
                      <Text style={styles.cardName}>{med.name}</Text>
                      <Text style={styles.cardGeneric}>
                        {med.genericName}
                      </Text>
                    </View>
                    <Text style={[styles.cardArrow, {color: med.color}]}>
                      ›
                    </Text>
                  </View>

                  {/* Alt bilgi satırı */}
                  <View style={styles.cardInfoRow}>
                    <View style={styles.cardInfoItem}>
                      <Text style={styles.cardInfoIcon}>🕐</Text>
                      <Text style={styles.cardInfoText}>
                        {med.frequency}
                      </Text>
                    </View>
                    <View style={styles.cardInfoDot} />
                    <View style={styles.cardInfoItem}>
                      <Text style={styles.cardInfoIcon}>🍽️</Text>
                      <Text style={styles.cardInfoText} numberOfLines={1}>
                        {med.timing}
                      </Text>
                    </View>
                  </View>

                  {/* Kategori badge */}
                  <View
                    style={[
                      styles.cardBadge,
                      {backgroundColor: med.color + '1A'},
                    ]}>
                    <Text
                      style={[styles.cardBadgeText, {color: med.color}]}>
                      {med.category}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Alt boşluk */}
        <View style={{height: Spacing.xxxl + Spacing.xl}} />
      </ScrollView>

      {/* ── AR başlatma FAB ────────────────────────────────────────────────── */}
      {!arActive && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setArActive(true)}>
          <Text style={styles.fabIcon}>📷</Text>
          <Text style={styles.fabLabel}>AR Tara</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ── Stiller ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: Colors.bgPrimary},
  arOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    backgroundColor: '#000',
  },
  arAlertWrapper: {
    position: 'absolute',
    bottom: Spacing.base,
    left: Spacing.base,
    right: Spacing.base,
  },

  // ── Kategori Filtreleme ────────────────────────────────────────────────────
  categoryScroll: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.round,
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  categoryChipActive: {
    backgroundColor: Colors.brandBlue,
    borderColor: Colors.brandBlue,
  },
  categoryChipText: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
    textTransform: 'none',
  },
  categoryChipTextActive: {
    color: Colors.textOnBrand,
  },

  // ── İlaç Listesi ───────────────────────────────────────────────────────────
  list: {
    padding: Spacing.base,
    paddingTop: 0,
  },
  groupTitle: {
    ...Typography.headingSmall,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    paddingLeft: Spacing.xs,
  },

  // ── İlaç Kartı ─────────────────────────────────────────────────────────────
  medCard: {
    flexDirection: 'row',
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadow.low,
  },
  cardAccent: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    padding: Spacing.md,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  cardIcon: {
    fontSize: 20,
  },
  cardTextBlock: {
    flex: 1,
  },
  cardName: {
    ...Typography.headingSmall,
    color: Colors.textPrimary,
  },
  cardGeneric: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  cardArrow: {
    fontSize: 24,
    fontWeight: '300',
  },

  // ── Bilgi Satırı ───────────────────────────────────────────────────────────
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingLeft: Spacing.xs,
  },
  cardInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInfoIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  cardInfoText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  cardInfoDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.textDisabled,
    marginHorizontal: Spacing.sm,
  },

  // ── Badge ──────────────────────────────────────────────────────────────────
  cardBadge: {
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.round,
  },
  cardBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // ── FAB ────────────────────────────────────────────────────────────────────
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brandBlue,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.round,
    ...Shadow.medium,
  },
  fabIcon: {fontSize: 18, marginRight: Spacing.sm},
  fabLabel: {
    ...Typography.labelLarge,
    color: Colors.textOnBrand,
  },
});

export default MedicineScreen;
