import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ViewStyle} from 'react-native';
import {CameraView, useCameraPermissions} from 'expo-camera';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Colors, Typography, Spacing, Radius} from '../theme';

export interface MockARViewProps {
  /** AR modülünü açıklayan başlık (overlay'de gösterilir) */
  moduleTitle: string;
  /** Kamera altında gösterilecek ipucu */
  hint: string;
  /** Kapat butonu */
  onClose: () => void;
  /** Kamera üzerine ek UI eklemek için slot */
  children?: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Expo Go'da ViroReact çalışmadığından, bu bileşen gerçek kamera önizlemesini
 * açar ve üzerine AR etkisini taklit eden bir overlay katar.
 *
 * Gerçek AR build'lerde (EAS Dev Client / RN CLI) bu bileşen kullanılmaz;
 * asıl ViroARSceneNavigator devreye girer.
 */
const MockARView: React.FC<MockARViewProps> = ({
  moduleTitle,
  hint,
  onClose,
  children,
  style,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const insets = useSafeAreaInsets();

  // ── İzin durumları ──────────────────────────────────────────────────────
  if (!permission) {
    return (
      <View style={[styles.center, style]}>
        <Text style={styles.loadingText}>Kamera izni kontrol ediliyor…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.center, style]}>
        <Text style={styles.permIcon}>📷</Text>
        <Text style={styles.permTitle}>Kamera İzni Gerekli</Text>
        <Text style={styles.permSubtitle}>
          AR özelliklerini kullanmak için kamera erişimine ihtiyaç var.
        </Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>İzin Ver</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={styles.skipBtn}>
          <Text style={styles.skipText}>Şimdi değil</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Kamera + Mock AR overlay ────────────────────────────────────────────
  return (
    <View style={[styles.container, style]}>
      <CameraView style={StyleSheet.absoluteFill} facing="back" />

      {/* Köşe tarama çerçevesi */}
      <View style={styles.scanFrameWrapper} pointerEvents="none">
        <View style={styles.scanFrame}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>
      </View>

      {/* Üst bilgi bandı */}
      <View style={[styles.topBanner, {paddingTop: insets.top + Spacing.sm}]}>
        <View style={styles.expoBadge}>
          <Text style={styles.expoBadgeText}>📱 EXPO GO</Text>
        </View>
        <Text style={styles.topTitle}>{moduleTitle}</Text>
        <Text style={styles.topSubtitle}>AR Simülasyonu</Text>
      </View>

      {/* Kapat butonu */}
      <TouchableOpacity style={[styles.closeBtn, {top: insets.top + Spacing.sm}]} onPress={onClose}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      {/* Slot: ekran bazlı ek içerik (liste, progress vb.) */}
      {children}

      {/* Alt ipucu */}
      <View style={[styles.hintBox, {paddingBottom: insets.bottom + Spacing.md}]}>
        <Text style={styles.hintText}>{hint}</Text>
        <Text style={styles.hintNote}>
          Tam AR deneyimi için EAS Dev Client ile build alın →{' '}
          <Text style={styles.hintLink}>eas build --profile development</Text>
        </Text>
      </View>
    </View>
  );
};

const CORNER_SIZE = 20;

const styles = StyleSheet.create({
  container: {flex: 1, position: 'relative', backgroundColor: '#000'},

  // ── İzin ekranı ──────────────────────────────────────────────────────────
  center: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  loadingText: {...Typography.bodyMedium, color: Colors.textSecondary},
  permIcon: {fontSize: 52, marginBottom: Spacing.md},
  permTitle: {
    ...Typography.headingMedium,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  permSubtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  permBtn: {
    backgroundColor: Colors.brandBlue,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.round,
    marginBottom: Spacing.md,
  },
  permBtnText: {...Typography.labelLarge, color: Colors.textOnBrand},
  skipBtn: {padding: Spacing.md},
  skipText: {...Typography.bodySmall, color: Colors.textSecondary},

  // ── AR overlay ───────────────────────────────────────────────────────────
  scanFrameWrapper: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 240,
    height: 240,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: Colors.arBlue,
    borderWidth: 2.5,
  },
  cornerTL: {top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 4},
  cornerTR: {top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 4},
  cornerBL: {bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 4},
  cornerBR: {bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 4},

  topBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(13,27,42,0.8)',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    alignItems: 'center',
  },
  expoBadge: {
    backgroundColor: Colors.brandBlue + 'AA',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.round,
    marginBottom: Spacing.xs,
  },
  expoBadgeText: {
    ...Typography.caption,
    color: Colors.textOnBrand,
    fontWeight: '700',
    letterSpacing: 1,
  },
  topTitle: {...Typography.headingSmall, color: Colors.textPrimary},
  topSubtitle: {...Typography.caption, color: Colors.textSecondary, marginTop: 1},

  closeBtn: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 34,
    height: 34,
    borderRadius: Radius.round,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {color: '#fff', fontSize: 15, fontWeight: '700'},

  hintBox: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(13,27,42,0.85)',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  hintText: {
    ...Typography.bodySmall,
    color: Colors.arBlue,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  hintNote: {
    ...Typography.caption,
    color: Colors.textDisabled,
    textAlign: 'center',
    lineHeight: 16,
  },
  hintLink: {
    color: Colors.brandTeal,
    fontWeight: '600',
  },
});

export default MockARView;
