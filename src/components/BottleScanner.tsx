import React, {useState, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {CameraView, useCameraPermissions} from 'expo-camera';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Colors, Typography, Spacing, Radius} from '../theme';

const BOTTLE_SIZES = [
  {ml: 200, label: '200ml', icon: '🥤', desc: 'Bardak'},
  {ml: 330, label: '330ml', icon: '🧃', desc: 'Kutu'},
  {ml: 500, label: '500ml', icon: '🍶', desc: 'Küçük Şişe'},
  {ml: 1000, label: '1L', icon: '🧴', desc: 'Orta Şişe'},
  {ml: 1500, label: '1.5L', icon: '💧', desc: 'Büyük Şişe'},
  {ml: 2000, label: '2L', icon: '🫗', desc: 'Dev Şişe'},
];

const SLIDER_HEIGHT = 220;
const KNOB_SIZE = 32;

interface BottleScannerProps {
  onAddWater: (ml: number) => void;
  onClose: () => void;
}

const BottleScanner: React.FC<BottleScannerProps> = ({onAddWater, onClose}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const insets = useSafeAreaInsets();

  const [selectedSize, setSelectedSize] = useState(2);
  const [waterLevel, setWaterLevel] = useState(100);
  const [confirmed, setConfirmed] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const addBtnScale = useRef(new Animated.Value(1)).current;
  const sliderY = useRef(0);

  // Slider
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        Animated.spring(pulseAnim, {toValue: 1.2, useNativeDriver: true}).start();
      },
      onPanResponderMove: (_, g) => {
        const newY = Math.max(0, Math.min(SLIDER_HEIGHT, sliderY.current + g.dy));
        setWaterLevel(Math.round(100 - (newY / SLIDER_HEIGHT) * 100));
      },
      onPanResponderRelease: (_, g) => {
        sliderY.current = Math.max(0, Math.min(SLIDER_HEIGHT, sliderY.current + g.dy));
        Animated.spring(pulseAnim, {toValue: 1, useNativeDriver: true}).start();
      },
    }),
  ).current;

  const bottleSize = BOTTLE_SIZES[selectedSize];
  const calculatedMl = Math.round((waterLevel / 100) * bottleSize.ml);

  const getWaterColor = () => {
    if (waterLevel >= 75) return '#40C4FF';
    if (waterLevel >= 50) return '#29B6F6';
    if (waterLevel >= 25) return '#1976D2';
    return '#0D47A1';
  };
  const waterColor = getWaterColor();

  const handleAdd = useCallback(() => {
    if (calculatedMl <= 0) {
      Alert.alert('⚠️', 'Su seviyesini ayarla.');
      return;
    }
    Animated.sequence([
      Animated.spring(addBtnScale, {toValue: 0.9, useNativeDriver: true}),
      Animated.spring(addBtnScale, {toValue: 1, useNativeDriver: true}),
    ]).start();
    setConfirmed(true);
    onAddWater(calculatedMl);
    setTimeout(() => onClose(), 1200);
  }, [calculatedMl, onAddWater, onClose, addBtnScale]);

  // İzin kontrol
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#40C4FF" />
      </View>
    );
  }
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permIcon}>📷</Text>
        <Text style={styles.permTitle}>Kamera İzni Gerekli</Text>
        <Text style={styles.permSub}>Şişeyi görmek için kamera erişimi gerekli.</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>İzin Ver</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={styles.skipBtn}>
          <Text style={styles.skipText}>Vazgeç</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tam ekran kamera */}
      <CameraView style={StyleSheet.absoluteFill} facing="back" />

      {/* Kapat */}
      <TouchableOpacity style={[styles.closeBtn, {top: insets.top + 12}]} onPress={onClose}>
        <Text style={styles.closeBtnText}>✕</Text>
      </TouchableOpacity>

      {/* Üst banner */}
      <View style={[styles.topBanner, {paddingTop: insets.top + 8}]}>
        <Text style={styles.topTitle}>📏 Şişe Tarayıcı</Text>
        <Text style={styles.topSub}>
          {showPanel
            ? 'Şişene bakarak boyutu seç ve su seviyesini ayarla'
            : 'Şişeni kameraya tut, sonra aşağıdaki butona bas'}
        </Text>
      </View>

      {/* Onay overlay */}
      {confirmed && (
        <View style={styles.confirmedOverlay}>
          <Text style={styles.confirmedEmoji}>✅</Text>
          <Text style={styles.confirmedText}>+{calculatedMl} ml eklendi!</Text>
          <Text style={styles.confirmedSub}>Günlük toplama kaydedildi</Text>
        </View>
      )}

      {/* ── İlk ekran: "Şişeyi Gördüm" butonu ── */}
      {!showPanel && !confirmed && (
        <View style={[styles.readyArea, {bottom: insets.bottom + 40}]}>
          <View style={styles.guideFrame} pointerEvents="none">
            <View style={styles.guideCornerTL} />
            <View style={styles.guideCornerTR} />
            <View style={styles.guideCornerBL} />
            <View style={styles.guideCornerBR} />
          </View>
          <TouchableOpacity
            style={styles.readyBtn}
            onPress={() => setShowPanel(true)}
            activeOpacity={0.8}>
            <Text style={styles.readyBtnIcon}>👆</Text>
            <Text style={styles.readyBtnText}>Şişeyi Gördüm — Boyut Seç</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Panel: boyut + slider + ekle ── */}
      {showPanel && !confirmed && (
        <View style={[styles.bottomPanel, {paddingBottom: insets.bottom + 16}]}>
          {/* Boyut seçimi */}
          <Text style={styles.sectionLabel}>Şişe Boyutu</Text>
          <View style={styles.sizeRow}>
            {BOTTLE_SIZES.map((size, index) => (
              <TouchableOpacity
                key={size.ml}
                style={[
                  styles.sizeBtn,
                  selectedSize === index && styles.sizeBtnActive,
                  selectedSize === index && {borderColor: waterColor},
                ]}
                onPress={() => setSelectedSize(index)}>
                <Text style={styles.sizeIcon}>{size.icon}</Text>
                <Text
                  style={[
                    styles.sizeLabel,
                    selectedSize === index && {color: waterColor},
                  ]}>
                  {size.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Slider + sonuç */}
          <View style={styles.levelRow}>
            <View style={styles.sliderContainer}>
              <View style={styles.sliderTrack}>
                <View
                  style={[
                    styles.sliderFill,
                    {height: `${waterLevel}%`, backgroundColor: waterColor + 'CC'},
                  ]}
                />
                {[0, 25, 50, 75, 100].map(mark => (
                  <View key={mark} style={[styles.sliderMark, {bottom: `${mark}%`}]}>
                    <View style={styles.sliderMarkLine} />
                    <Text style={styles.sliderMarkText}>{mark}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.sliderTouchArea} {...panResponder.panHandlers}>
                <Animated.View
                  style={[
                    styles.sliderKnob,
                    {
                      bottom: `${waterLevel}%`,
                      backgroundColor: waterColor,
                      transform: [{scale: pulseAnim}],
                    },
                  ]}>
                  <Text style={styles.knobText}>≡</Text>
                </Animated.View>
              </View>
              <Text style={styles.sliderLabel}>Su Seviyesi</Text>
            </View>

            <View style={styles.resultContainer}>
              <View style={styles.resultCard}>
                <Text style={styles.resultIcon}>{bottleSize.icon}</Text>
                <Text style={styles.resultName}>{bottleSize.desc}</Text>
                <Text style={styles.resultSize}>{bottleSize.label}</Text>
                <View style={styles.resultDivider} />
                <Text style={styles.resultLevelLabel}>Doluluk</Text>
                <Text style={[styles.resultLevel, {color: waterColor}]}>
                  %{waterLevel}
                </Text>
                <View style={styles.resultDivider} />
                <Text style={styles.resultAmountLabel}>Hesaplanan</Text>
                <Text style={[styles.resultAmount, {color: waterColor}]}>
                  {calculatedMl} ml
                </Text>
              </View>
              <View style={styles.quickLevels}>
                {[25, 50, 75, 100].map(level => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.quickLevelBtn,
                      waterLevel === level && {backgroundColor: waterColor + '33'},
                    ]}
                    onPress={() => {
                      setWaterLevel(level);
                      sliderY.current = ((100 - level) / 100) * SLIDER_HEIGHT;
                    }}>
                    <Text
                      style={[
                        styles.quickLevelText,
                        waterLevel === level && {color: waterColor},
                      ]}>
                      {level === 25
                        ? '¼'
                        : level === 50
                          ? '½'
                          : level === 75
                            ? '¾'
                            : '⬆'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Ekle butonu */}
          <Animated.View style={{transform: [{scale: addBtnScale}]}}>
            <TouchableOpacity
              style={[styles.addButton, {backgroundColor: waterColor}]}
              onPress={handleAdd}
              activeOpacity={0.8}>
              <Text style={styles.addBtnIcon}>💧</Text>
              <Text style={styles.addBtnText}>+{calculatedMl} ml Ekle</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#000'},
  center: {
    flex: 1, backgroundColor: Colors.bgPrimary, alignItems: 'center',
    justifyContent: 'center', padding: Spacing.xl,
  },
  permIcon: {fontSize: 52, marginBottom: Spacing.md},
  permTitle: {...Typography.headingMedium, color: Colors.textPrimary, marginBottom: Spacing.sm},
  permSub: {...Typography.bodyMedium, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl},
  permBtn: {backgroundColor: Colors.brandBlue, paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.md, borderRadius: Radius.round, marginBottom: Spacing.md},
  permBtnText: {...Typography.labelLarge, color: Colors.textOnBrand},
  skipBtn: {padding: Spacing.md},
  skipText: {...Typography.bodySmall, color: Colors.textSecondary},

  closeBtn: {
    position: 'absolute', right: 16, width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)', justifyContent: 'center',
    alignItems: 'center', zIndex: 20,
  },
  closeBtnText: {color: '#fff', fontSize: 16, fontWeight: '700'},

  topBanner: {
    position: 'absolute', top: 0, left: 0, right: 0,
    backgroundColor: 'rgba(13,27,42,0.85)', paddingHorizontal: 16,
    paddingBottom: 12, alignItems: 'center', zIndex: 10,
  },
  topTitle: {...Typography.headingSmall, color: Colors.textPrimary, marginBottom: 2},
  topSub: {...Typography.caption, color: Colors.textSecondary, textAlign: 'center'},

  // Onay
  confirmedOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(13,27,42,0.92)',
    justifyContent: 'center', alignItems: 'center', zIndex: 30,
  },
  confirmedEmoji: {fontSize: 64, marginBottom: 16},
  confirmedText: {...Typography.displayLarge, color: '#00E676', marginBottom: 8},
  confirmedSub: {...Typography.bodyMedium, color: Colors.textSecondary},

  // İlk ekran — kılavuz çerçeve + buton
  readyArea: {position: 'absolute', alignSelf: 'center', alignItems: 'center', zIndex: 20, width: '100%'},
  guideFrame: {
    width: 200, height: 300, position: 'absolute', top: -380, alignSelf: 'center',
  },
  guideCornerTL: {position: 'absolute', top: 0, left: 0, width: 30, height: 30, borderTopWidth: 3, borderLeftWidth: 3, borderColor: '#40C4FF', borderTopLeftRadius: 8},
  guideCornerTR: {position: 'absolute', top: 0, right: 0, width: 30, height: 30, borderTopWidth: 3, borderRightWidth: 3, borderColor: '#40C4FF', borderTopRightRadius: 8},
  guideCornerBL: {position: 'absolute', bottom: 0, left: 0, width: 30, height: 30, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: '#40C4FF', borderBottomLeftRadius: 8},
  guideCornerBR: {position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderBottomWidth: 3, borderRightWidth: 3, borderColor: '#40C4FF', borderBottomRightRadius: 8},

  readyBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(64,196,255,0.9)',
    paddingHorizontal: 24, paddingVertical: 14, borderRadius: 28, gap: 8,
    elevation: 8, shadowColor: '#40C4FF', shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4, shadowRadius: 8,
  },
  readyBtnIcon: {fontSize: 20},
  readyBtnText: {...Typography.labelLarge, color: '#fff', fontWeight: '700'},

  // Alt panel
  bottomPanel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(13,27,42,0.93)', borderTopLeftRadius: 24,
    borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 16, zIndex: 15,
  },
  sectionLabel: {...Typography.labelSmall, color: Colors.textSecondary, marginBottom: 8, textAlign: 'center'},

  sizeRow: {flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 14, flexWrap: 'wrap'},
  sizeBtn: {
    alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12, paddingVertical: 6, paddingHorizontal: 8,
    borderWidth: 1.5, borderColor: 'transparent', minWidth: 52,
  },
  sizeBtnActive: {backgroundColor: 'rgba(64,196,255,0.12)'},
  sizeIcon: {fontSize: 18, marginBottom: 2},
  sizeLabel: {...Typography.caption, color: Colors.textSecondary, fontWeight: '600', fontSize: 11},

  levelRow: {flexDirection: 'row', gap: 14, marginBottom: 14},
  sliderContainer: {alignItems: 'center', width: 56},
  sliderTrack: {
    width: 26, height: SLIDER_HEIGHT, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)', overflow: 'hidden', position: 'relative',
  },
  sliderFill: {position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 6, borderTopRightRadius: 6},
  sliderMark: {position: 'absolute', right: -24, flexDirection: 'row', alignItems: 'center'},
  sliderMarkLine: {width: 5, height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginRight: 2},
  sliderMarkText: {fontSize: 7, color: 'rgba(255,255,255,0.3)', fontWeight: '600'},
  sliderTouchArea: {position: 'absolute', top: 0, left: -10, right: -10, bottom: 0},
  sliderKnob: {
    position: 'absolute', left: 10 - KNOB_SIZE / 2 + 13,
    width: KNOB_SIZE, height: KNOB_SIZE, borderRadius: KNOB_SIZE / 2,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2,
    borderColor: '#fff', elevation: 5,
  },
  knobText: {color: '#fff', fontSize: 14, fontWeight: '800'},
  sliderLabel: {...Typography.caption, color: Colors.textDisabled, marginTop: 6, textAlign: 'center'},

  resultContainer: {flex: 1, gap: 8},
  resultCard: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16,
    padding: 12, alignItems: 'center', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  resultIcon: {fontSize: 26, marginBottom: 2},
  resultName: {...Typography.labelLarge, color: Colors.textPrimary},
  resultSize: {...Typography.caption, color: Colors.textSecondary},
  resultDivider: {width: '80%', height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 6},
  resultLevelLabel: {...Typography.caption, color: Colors.textDisabled},
  resultLevel: {fontSize: 20, fontWeight: '700'},
  resultAmountLabel: {...Typography.caption, color: Colors.textDisabled},
  resultAmount: {fontSize: 26, fontWeight: '800', letterSpacing: -0.5},

  quickLevels: {flexDirection: 'row', justifyContent: 'center', gap: 6},
  quickLevelBtn: {
    width: 38, height: 34, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center',
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  quickLevelText: {fontSize: 15, color: Colors.textSecondary, fontWeight: '600'},

  addButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: Radius.round, paddingVertical: 14, gap: 8, elevation: 6,
  },
  addBtnIcon: {fontSize: 20},
  addBtnText: {...Typography.headingSmall, color: '#fff', fontWeight: '700'},
});

export default BottleScanner;
