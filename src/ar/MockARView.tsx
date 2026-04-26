import React, {useState, useEffect, useRef} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ViewStyle, Animated, Easing} from 'react-native';
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

  // ── Animasyon değerleri ─────────────────────────────────────────────────
  const cornerPulse   = useRef(new Animated.Value(1)).current;
  const trackingBlink = useRef(new Animated.Value(1)).current;
  const sweepAnim     = useRef(new Animated.Value(0)).current;
  const dotOpacity    = useRef(new Animated.Value(0.3)).current;
  const [trackingLocked, setTrackingLocked] = useState(false);

  useEffect(() => {
    // Köşe braketleri pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(cornerPulse, {toValue: 1.08, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true}),
        Animated.timing(cornerPulse, {toValue: 1.0,  duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true}),
      ]),
    ).start();

    // TRACKING yanıp sönme
    Animated.loop(
      Animated.sequence([
        Animated.timing(trackingBlink, {toValue: 0.15, duration: 500, useNativeDriver: true}),
        Animated.timing(trackingBlink, {toValue: 1.0,  duration: 500, useNativeDriver: true}),
      ]),
    ).start();

    // Tam ekran yatay tarama süpürmesi
    Animated.loop(
      Animated.sequence([
        Animated.timing(sweepAnim, {toValue: 1, duration: 3500, easing: Easing.linear, useNativeDriver: true}),
        Animated.timing(sweepAnim, {toValue: 0, duration: 0, useNativeDriver: true}),
        Animated.delay(1200),
      ]),
    ).start();

    // Derinlik noktaları titreme
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity, {toValue: 0.7, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true}),
        Animated.timing(dotOpacity, {toValue: 0.15, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true}),
      ]),
    ).start();

    // 2.5s sonra "yüzey tespit edildi" kilitleme
    const lockTimer = setTimeout(() => setTrackingLocked(true), 2500);
    return () => clearTimeout(lockTimer);
  }, []);

  const sweepTranslateY = sweepAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 800],
  });

  const cornerColor = trackingLocked ? Colors.arGreen ?? '#00E676' : Colors.arBlue;

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

      {/* ── Tam ekran tarama süpürmesi ────────────────────────────────── */}
      <Animated.View
        pointerEvents="none"
        style={[styles.globalSweep, {transform: [{translateY: sweepTranslateY}]}]}
      />

      {/* ── Derinlik nokta ızgarası ───────────────────────────────────── */}
      <Animated.View pointerEvents="none" style={[styles.depthGrid, {opacity: dotOpacity}]}>
        {DEPTH_DOTS.map((d, i) => (
          <View key={i} style={[styles.depthDot, {top: d.top, left: d.left, width: d.size, height: d.size, borderRadius: d.size}]} />
        ))}
      </Animated.View>

      {/* ── Köşe tarama çerçevesi ─────────────────────────────────────── */}
      <View style={styles.scanFrameWrapper} pointerEvents="none">
        <Animated.View style={[styles.scanFrame, {transform: [{scale: cornerPulse}]}]}>
          <View style={[styles.corner, styles.cornerTL, {borderColor: cornerColor}]} />
          <View style={[styles.corner, styles.cornerTR, {borderColor: cornerColor}]} />
          <View style={[styles.corner, styles.cornerBL, {borderColor: cornerColor}]} />
          <View style={[styles.corner, styles.cornerBR, {borderColor: cornerColor}]} />
          {/* Orta crosshair */}
          <View style={styles.crossH} />
          <View style={styles.crossV} />
        </Animated.View>
      </View>

      {/* ── Üst bilgi bandı ───────────────────────────────────────────── */}
      <View style={[styles.topBanner, {paddingTop: insets.top + Spacing.sm}]}>
        <View style={styles.topRow}>
          {/* Sol: Tracking durumu */}
          <View style={styles.trackingBadge}>
            <Animated.View style={[styles.trackingDot, {opacity: trackingBlink, backgroundColor: trackingLocked ? '#00E676' : '#FFD740'}]} />
            <Text style={[styles.trackingText, {color: trackingLocked ? '#00E676' : '#FFD740'}]}>
              {trackingLocked ? 'LOCKED' : 'TRACKING'}
            </Text>
          </View>
          {/* Orta: Başlık */}
          <Text style={styles.topTitle}>{moduleTitle}</Text>
          {/* Sağ: AR etiketi */}
          <View style={styles.arBadge}>
            <Text style={styles.arBadgeText}>AR</Text>
          </View>
        </View>
        <Text style={styles.topSubtitle}>Hologram Simülasyonu</Text>
      </View>

      {/* ── Sol kenar dikey veri çizgisi ──────────────────────────────── */}
      <View style={styles.sideBar} pointerEvents="none">
        <Text style={styles.sideBarText}>SYS:OK</Text>
        <View style={styles.sideBarDivider} />
        <Text style={styles.sideBarText}>DEPTH</Text>
        <View style={styles.sideBarDivider} />
        <Text style={styles.sideBarText}>PLANE</Text>
        <View style={styles.sideBarDivider} />
        <Text style={styles.sideBarText}>SENS</Text>
      </View>

      {/* ── Kapat butonu ──────────────────────────────────────────────── */}
      <TouchableOpacity style={[styles.closeBtn, {top: insets.top + Spacing.sm}]} onPress={onClose}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      {/* ── Slot: şişe vb. içerik ─────────────────────────────────────── */}
      {children}

      {/* ── Alt HUD bandı ─────────────────────────────────────────────── */}
      <View style={[styles.hintBox, {paddingBottom: insets.bottom + Spacing.md}]}>
        <Text style={styles.hintText}>{hint}</Text>
      </View>
    </View>
  );
};

// Derinlik nokta verisi
const DEPTH_DOTS: {top: string; left: string; size: number}[] = [
  {top: '12%', left: '8%',  size: 3},
  {top: '25%', left: '85%', size: 2},
  {top: '38%', left: '15%', size: 2},
  {top: '55%', left: '78%', size: 3},
  {top: '68%', left: '5%',  size: 2},
  {top: '72%', left: '90%', size: 2},
  {top: '82%', left: '20%', size: 3},
  {top: '15%', left: '55%', size: 2},
  {top: '45%', left: '92%', size: 2},
  {top: '30%', left: '42%', size: 2},
];

const CORNER_SIZE = 22;

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

  // ── Tam ekran tarama süpürmesi ───────────────────────────────────────────
  globalSweep: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(64,196,255,0.18)',
    shadowColor: '#40C4FF',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 6,
    zIndex: 5,
  },

  // ── Derinlik nokta ızgarası ──────────────────────────────────────────────
  depthGrid: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  depthDot: {
    position: 'absolute',
    backgroundColor: '#40C4FF',
  },

  // ── Köşe çerçeve ────────────────────────────────────────────────────────
  scanFrameWrapper: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  scanFrame: {
    width: 220,
    height: 280,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderWidth: 2.5,
  },
  cornerTL: {top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 4},
  cornerTR: {top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 4},
  cornerBL: {bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 4},
  cornerBR: {bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 4},
  crossH: {
    position: 'absolute',
    width: 16,
    height: 1,
    backgroundColor: 'rgba(64,196,255,0.4)',
  },
  crossV: {
    position: 'absolute',
    width: 1,
    height: 16,
    backgroundColor: 'rgba(64,196,255,0.4)',
  },

  // ── Üst banner ───────────────────────────────────────────────────────────
  topBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(7,15,25,0.75)',
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.base,
    alignItems: 'center',
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(64,196,255,0.2)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  trackingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trackingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  trackingText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  topTitle: {
    ...Typography.headingSmall,
    color: Colors.textPrimary,
    fontSize: 13,
  },
  arBadge: {
    borderWidth: 1,
    borderColor: Colors.arBlue,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  arBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.arBlue,
    letterSpacing: 1.5,
  },
  topSubtitle: {
    ...Typography.caption,
    color: Colors.textDisabled,
    letterSpacing: 0.5,
  },

  // ── Sol kenar veri çizgisi ───────────────────────────────────────────────
  sideBar: {
    position: 'absolute',
    left: 10,
    top: '35%',
    gap: 6,
    alignItems: 'center',
    zIndex: 6,
  },
  sideBarText: {
    fontSize: 7,
    color: 'rgba(64,196,255,0.55)',
    fontWeight: '700',
    letterSpacing: 0.8,
    transform: [{rotate: '-90deg'}],
  },
  sideBarDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(64,196,255,0.2)',
  },

  // ── Kapat butonu ─────────────────────────────────────────────────────────
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
    zIndex: 20,
  },
  closeText: {color: '#fff', fontSize: 15, fontWeight: '700'},

  // ── Alt HUD bandı ────────────────────────────────────────────────────────
  hintBox: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(7,15,25,0.82)',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(64,196,255,0.2)',
    zIndex: 10,
  },
  hintText: {
    ...Typography.bodySmall,
    color: Colors.arBlue,
    textAlign: 'center',
  },
});

export default MockARView;
