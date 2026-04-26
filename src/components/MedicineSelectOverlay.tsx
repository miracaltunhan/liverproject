import React, {useRef, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import {Colors, Typography, Spacing, Radius, Shadow} from '../theme';
import {MedicineInfo} from './MedicineInfoCard';

interface MedicineSelectOverlayProps {
  /** Tüm ilaç listesi */
  medicines: MedicineInfo[];
  /** İlaç seçildiğinde çağrılır */
  onSelect: (medicine: MedicineInfo) => void;
  /** Overlay kapatıldığında çağrılır */
  onClose: () => void;
}

const {width: SCREEN_WIDTH} = Dimensions.get('window');

/**
 * Expo Go'da kamera üzerinde gösterilen ilaç seçim overlay'i.
 * Gerçek cihazda Vuforia Image Target ile ilaç tanınır;
 * Expo Go'da ise kullanıcı bu listeden ilaç seçer.
 */
const MedicineSelectOverlay: React.FC<MedicineSelectOverlayProps> = ({
  medicines,
  onSelect,
  onClose,
}) => {
  // ── Fade-in animasyonu ────────────────────────────────────────────────────
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.overlay,
        {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
      ]}>
      {/* ── Başlık ──────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>📋</Text>
          <View>
            <Text style={styles.headerTitle}>İlaç Seçin</Text>
            <Text style={styles.headerSubtitle}>
              Bilgi kartını görmek için ilaca dokunun
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* ── İlaç Listesi ────────────────────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {medicines.map(medicine => (
          <TouchableOpacity
            key={medicine.id}
            style={[styles.medicineChip, {borderColor: medicine.color + '66'}]}
            activeOpacity={0.7}
            onPress={() => onSelect(medicine)}>
            {/* Üst renkli çizgi */}
            <View
              style={[styles.chipAccent, {backgroundColor: medicine.color}]}
            />

            {/* İkon */}
            <View
              style={[
                styles.chipIconWrapper,
                {backgroundColor: medicine.color + '22'},
              ]}>
              <Text style={styles.chipIcon}>{medicine.icon}</Text>
            </View>

            {/* İlaç Adı */}
            <Text style={styles.chipName} numberOfLines={1}>
              {medicine.name}
            </Text>
            <Text style={styles.chipGeneric} numberOfLines={1}>
              {medicine.genericName}
            </Text>

            {/* Kategori */}
            <View
              style={[
                styles.chipCategory,
                {backgroundColor: medicine.color + '1A'},
              ]}>
              <Text
                style={[styles.chipCategoryText, {color: medicine.color}]}
                numberOfLines={1}>
                {medicine.category}
              </Text>
            </View>

            {/* Tara butonu */}
            <View style={[styles.chipBtn, {backgroundColor: medicine.color}]}>
              <Text style={styles.chipBtnText}>Bilgi Gör</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Alt bilgi ───────────────────────────────────────────────────────── */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          📱 Expo Go modunda çalışıyorsunuz • Gerçek AR için EAS build alın
        </Text>
      </View>
    </Animated.View>
  );
};

// ── Stiller ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(13, 27, 42, 0.92)',
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingBottom: Spacing.lg,
    ...Shadow.high,
  },

  // ── Başlık ─────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  headerTitle: {
    ...Typography.headingSmall,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: Radius.round,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },

  // ── Yatay Kaydırma ─────────────────────────────────────────────────────────
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },

  // ── İlaç Kartı ─────────────────────────────────────────────────────────────
  medicineChip: {
    width: SCREEN_WIDTH * 0.35,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    alignItems: 'center',
    paddingBottom: Spacing.md,
    ...Shadow.low,
  },
  chipAccent: {
    height: 3,
    width: '100%',
  },
  chipIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: Radius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  chipIcon: {
    fontSize: 22,
  },
  chipName: {
    ...Typography.labelLarge,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    textAlign: 'center',
  },
  chipGeneric: {
    ...Typography.caption,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.sm,
    textAlign: 'center',
    marginTop: 2,
  },
  chipCategory: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.round,
  },
  chipCategoryText: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  chipBtn: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.round,
  },
  chipBtnText: {
    ...Typography.caption,
    color: Colors.textOnBrand,
    fontWeight: '700',
  },

  // ── Alt Bilgi ──────────────────────────────────────────────────────────────
  footer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerText: {
    ...Typography.caption,
    color: Colors.textDisabled,
    textAlign: 'center',
  },
});

export default MedicineSelectOverlay;
