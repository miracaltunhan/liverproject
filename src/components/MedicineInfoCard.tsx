import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {Colors, Typography, Spacing, Radius, Shadow} from '../theme';

// ── İlaç verisi tipi ──────────────────────────────────────────────────────────
export interface MedicineInfo {
  id: string;
  name: string;
  genericName: string;
  category: string;
  icon: string;
  purpose: string;
  dosage: string;
  frequency: string;
  timing: string;
  howToTake: string;
  warnings: string[];
  sideEffects: string[];
  interactions: string[];
  color: string;
  imageTargetName: string;
}

interface MedicineInfoCardProps {
  /** Gösterilecek ilaç verisi */
  medicine: MedicineInfo;
  /** Kapat butonu callback'i */
  onClose: () => void;
  /** Kart arka plan opaklığı (AR modunda yarı saydam olabilir) */
  translucent?: boolean;
  /** Hatırlatıcı oluştur butonu callback'i */
  onReminderPress?: () => void;
}

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

/**
 * AR Bilgi Kartı — İlaç tanındığında ekranda görünen detaylı bilgi paneli.
 * Fade-in animasyonu ile belirir, kaydırılabilir içeriğe sahiptir.
 */
const MedicineInfoCard: React.FC<MedicineInfoCardProps> = ({
  medicine,
  onClose,
  translucent = false,
  onReminderPress,
}) => {
  // ── Fade-in animasyonu ────────────────────────────────────────────────────
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        translucent && styles.containerTranslucent,
        {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
      ]}>
      {/* ── Başlık Alanı ──────────────────────────────────────────────────── */}
      <View style={[styles.header, {borderLeftColor: medicine.color}]}>
        <View style={styles.headerContent}>
          <Text style={styles.medicineIcon}>{medicine.icon}</Text>
          <View style={styles.headerText}>
            <Text style={styles.medicineName}>{medicine.name}</Text>
            <Text style={styles.genericName}>{medicine.genericName}</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.categoryBadge, {backgroundColor: medicine.color + '33'}]}>
          <Text style={[styles.categoryText, {color: medicine.color}]}>
            {medicine.category}
          </Text>
        </View>
      </View>

      {/* ── Bilgi İçeriği (Kaydırılabilir) ────────────────────────────────── */}
      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Kullanım Amacı */}
        <InfoSection
          icon="🎯"
          title="Kullanım Amacı"
          color={medicine.color}>
          <Text style={styles.infoText}>{medicine.purpose}</Text>
        </InfoSection>

        {/* Dozaj ve Sıklık */}
        <InfoSection icon="💊" title="Dozaj Bilgisi" color={medicine.color}>
          <View style={styles.dosageRow}>
            <View style={styles.dosageItem}>
              <Text style={styles.dosageLabel}>Sıklık</Text>
              <Text style={styles.dosageValue}>{medicine.frequency}</Text>
            </View>
            <View style={styles.dosageDivider} />
            <View style={styles.dosageItem}>
              <Text style={styles.dosageLabel}>Zamanlama</Text>
              <Text style={styles.dosageValue}>{medicine.timing}</Text>
            </View>
          </View>
          <Text style={[styles.infoText, {marginTop: Spacing.sm}]}>
            {medicine.dosage}
          </Text>
        </InfoSection>

        {/* Nasıl Alınacağı */}
        <InfoSection icon="🥛" title="Nasıl Alınır?" color={medicine.color}>
          <Text style={styles.infoText}>{medicine.howToTake}</Text>
          {/* Görsel temsil */}
          <View style={styles.howToVisual}>
            <Text style={styles.howToVisualIcon}>🥛💊➡️😊</Text>
            <Text style={styles.howToVisualText}>Su ile birlikte yutun</Text>
          </View>
        </InfoSection>

        {/* Uyarılar */}
        <InfoSection icon="⚠️" title="Uyarılar" color={Colors.arYellow}>
          <View style={styles.warningBox}>
            {medicine.warnings.map((warning, index) => (
              <View key={index} style={styles.warningItem}>
                <View style={styles.warningBulletWrapper}>
                  <Text style={styles.warningBullet}>!</Text>
                </View>
                <Text style={styles.warningText}>{warning}</Text>
              </View>
            ))}
          </View>
        </InfoSection>

        {/* Yan Etkiler */}
        <InfoSection icon="📋" title="Olası Yan Etkiler" color={Colors.info}>
          <View style={styles.tagContainer}>
            {medicine.sideEffects.map((effect, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{effect}</Text>
              </View>
            ))}
          </View>
        </InfoSection>

        {/* İlaç Etkileşimleri */}
        <InfoSection
          icon="🔄"
          title="İlaç Etkileşimleri"
          color={Colors.arRed}>
          {medicine.interactions.map((interaction, index) => (
            <View key={index} style={styles.interactionItem}>
              <Text style={styles.interactionBullet}>•</Text>
              <Text style={styles.interactionText}>{interaction}</Text>
            </View>
          ))}
        </InfoSection>

        {/* ── Hatırlatıcı Butonu ───────────────────────────────────────────── */}
        {onReminderPress && (
          <TouchableOpacity
            style={[styles.reminderBtn, {backgroundColor: medicine.color}]}
            activeOpacity={0.8}
            onPress={onReminderPress}>
            <Text style={styles.reminderBtnIcon}>⏰</Text>
            <View style={styles.reminderBtnTextBlock}>
              <Text style={styles.reminderBtnTitle}>
                Hatırlatıcı Oluştur
              </Text>
              <Text style={styles.reminderBtnSubtitle}>
                Bu ilacın kullanım saatlerinde bildirim al
              </Text>
            </View>
            <Text style={styles.reminderBtnArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* Alt boşluk */}
        <View style={{height: Spacing.xxl}} />
      </ScrollView>
    </Animated.View>
  );
};

// ── Bilgi Bölümü Alt Bileşeni ─────────────────────────────────────────────────
interface InfoSectionProps {
  icon: string;
  title: string;
  color: string;
  children: React.ReactNode;
}

const InfoSection: React.FC<InfoSectionProps> = ({icon, title, color, children}) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionIcon}>{icon}</Text>
      <Text style={[styles.sectionTitle, {color}]}>{title}</Text>
    </View>
    <View style={styles.sectionBody}>{children}</View>
  </View>
);

// ── Stiller ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: SCREEN_HEIGHT * 0.82,
    ...Shadow.high,
  },
  containerTranslucent: {
    backgroundColor: 'rgba(13, 27, 42, 0.95)',
  },

  // ── Başlık ─────────────────────────────────────────────────────────────────
  header: {
    padding: Spacing.base,
    borderLeftWidth: 4,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    backgroundColor: Colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medicineIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  medicineName: {
    ...Typography.headingLarge,
    color: Colors.textPrimary,
  },
  genericName: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: Radius.round,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.round,
  },
  categoryText: {
    ...Typography.labelSmall,
    fontWeight: '700',
  },

  // ── Kaydırılabilir İçerik ──────────────────────────────────────────────────
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
  },

  // ── Bölüm ─────────────────────────────────────────────────────────────────
  section: {
    marginBottom: Spacing.lg,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.bgElevated,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.headingSmall,
  },
  sectionBody: {
    padding: Spacing.md,
  },

  // ── Bilgi Metni ────────────────────────────────────────────────────────────
  infoText: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    lineHeight: 22,
  },

  // ── Dozaj ──────────────────────────────────────────────────────────────────
  dosageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dosageItem: {
    flex: 1,
    alignItems: 'center',
  },
  dosageLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  dosageValue: {
    ...Typography.labelLarge,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  dosageDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.border,
  },

  // ── Nasıl Alınır Görseli ───────────────────────────────────────────────────
  howToVisual: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  howToVisualIcon: {
    fontSize: 22,
    marginRight: Spacing.md,
    letterSpacing: 4,
  },
  howToVisualText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    flex: 1,
  },

  // ── Uyarılar ───────────────────────────────────────────────────────────────
  warningBox: {
    backgroundColor: 'rgba(255, 234, 0, 0.06)',
    borderRadius: Radius.md,
    padding: Spacing.sm,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  warningBulletWrapper: {
    width: 20,
    height: 20,
    borderRadius: Radius.round,
    backgroundColor: 'rgba(255, 234, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
    marginTop: 1,
  },
  warningBullet: {
    color: Colors.arYellow,
    fontWeight: '700',
    fontSize: 11,
  },
  warningText: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: 20,
  },

  // ── Tag'lar (Yan Etkiler) ──────────────────────────────────────────────────
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  tag: {
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.round,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  tagText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },

  // ── Etkileşimler ──────────────────────────────────────────────────────────
  interactionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  interactionBullet: {
    color: Colors.arRed,
    fontWeight: '700',
    fontSize: 16,
    marginRight: Spacing.sm,
    lineHeight: 20,
  },
  interactionText: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: 20,
  },

  // ── Hatırlatıcı Butonu ─────────────────────────────────────────────────────
  reminderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    ...Shadow.medium,
  },
  reminderBtnIcon: {
    fontSize: 28,
    marginRight: Spacing.md,
  },
  reminderBtnTextBlock: {
    flex: 1,
  },
  reminderBtnTitle: {
    ...Typography.headingSmall,
    color: Colors.textOnBrand,
  },
  reminderBtnSubtitle: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  reminderBtnArrow: {
    fontSize: 28,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '300',
  },
});

export default MedicineInfoCard;
