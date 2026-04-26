import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import {CameraView, useCameraPermissions} from 'expo-camera';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import MedicineInfoCard, {MedicineInfo} from '../components/MedicineInfoCard';
import {Colors, Typography, Spacing, Radius} from '../theme';
import {scheduleMedicineReminder} from '../utils/notifications';

// ── İlaç verileri ─────────────────────────────────────────────────────────────
import medicationsData from '../data/medications.json';
const allMedicines: MedicineInfo[] = medicationsData.medicines as MedicineInfo[];

// ── ViroReact yükleme (Expo Go'da çalışmaz) ─────────────────────────────────
let ViroARSceneNavigator: any = null;
let ViroARScene: any = null;
let ViroAmbientLight: any = null;
let ViroARImageMarker: any = null;
let ViroARTrackingTargets: any = null;
let ViroText: any = null;
let ViroMaterials: any = null;
let viroReady = false;

try {
  const V = require('@viro-community/react-viro');
  ViroARSceneNavigator = V.ViroARSceneNavigator;
  ViroARScene = V.ViroARScene;
  ViroAmbientLight = V.ViroAmbientLight;
  ViroARImageMarker = V.ViroARImageMarker;
  ViroARTrackingTargets = V.ViroARTrackingTargets;
  ViroText = V.ViroText;
  ViroMaterials = V.ViroMaterials;

  // Her ilaç için Image Target tanımı
  const targets: Record<string, any> = {};
  allMedicines.forEach(med => {
    targets[med.imageTargetName] = {
      source: {uri: `asset:/markers/${med.imageTargetName}.jpg`},
      orientation: 'Up',
      physicalWidth: 0.1,
    };
  });
  ViroARTrackingTargets.createTargets(targets);
  ViroMaterials.createMaterials({
    arInfoPanel: {diffuseColor: 'rgba(25, 118, 210, 0.85)'},
  });
  viroReady = true;
} catch {
  // Expo Go — ViroReact modülleri yok
}

// ── Gerçek Türkiye EAN-13 barkod numaraları → İlaç ID eşleştirmesi ──────────
// Her ilacın farklı dozaj ve ambalaj formları için barkod numaraları
const BARCODE_TO_MEDICINE: Record<string, string> = {
  // Prograf (Takrolimus)
  '8699043890321': 'prograf',   // 0.5 mg 50 Kapsül
  '8699043890338': 'prograf',   // 1 mg 50 Kapsül
  '8699043890345': 'prograf',   // 5 mg 50 Kapsül
  '8699043890352': 'prograf',   // 5 mg/mL 10 Ampul

  // CellCept (Mikofenolat Mofetil)
  '8699505092768': 'cellcept',  // 500 mg 50 Film Tablet
  '8699505152752': 'cellcept',  // 250 mg 100 Kapsül

  // Sandimmun Neoral (Siklosporin)
  '8699504190052': 'sandimmun', // 100 mg 50 Kapsül
  '8699504590005': 'sandimmun', // 100 mg/ml 50 ml Oral Solüsyon
  '8699504190007': 'sandimmun', // 25 mg 50 Kapsül

  // Medrol (Metilprednizolon)
  '8681308779991': 'medrol',    // Depo-Medrol 40 mg/ml Flakon

  // Ursofalk (Ursodeoksikolik Asit)
  '8699543700052': 'ursofalk',  // 250 mg/5 ml 250 ml Süspansiyon
  '8699543150031': 'ursofalk',  // 250 mg 100 Kapsül

  // Duphalac (Laktuloz)
  '8699820570217': 'duphalac',  // 667 mg/ml 300 ml Şurup

  // Aldactone (Spironolakton)
  '8699543010021': 'aldactone', // 25 mg 20 Tablet
  '8699543010038': 'aldactone', // 100 mg 16 Tablet

  // Lasix (Furosemid)
  '8699809014008': 'lasix',     // 40 mg 12 Tablet

  // Nexium (Esomeprazol)
  '8699786040045': 'nexium',    // 40 mg 28 Pellet Tablet

  // Bactrim (TMP-SMX)
  '8699525094636': 'bactrim',   // 400/80 mg 30 Tablet
  '8699525094643': 'bactrim',   // Forte 800/160 mg 20 Tablet
  '8699525284624': 'bactrim',   // 200/40 mg 100 ml Süspansiyon
};

// ── Barkod/QR verisinden ilaç bul ───────────────────────────────────────────
function findMedicineByBarcode(data: string): MedicineInfo | null {
  const trimmed = data.trim();

  // 1. Önce gerçek barkod numarasıyla eşleştir
  const medicineId = BARCODE_TO_MEDICINE[trimmed];
  if (medicineId) {
    return allMedicines.find(m => m.id === medicineId) || null;
  }

  // 2. QR kod içeriği ile eşleştir (ilaç adı/ID)
  const lower = trimmed.toLowerCase();
  return (
    allMedicines.find(
      m =>
        m.id === lower ||
        m.name.toLowerCase() === lower ||
        m.genericName.toLowerCase() === lower ||
        m.imageTargetName === lower,
    ) || null
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface MedicineARProps {
  onMedicineDetected: (name: string) => void;
  onClose: () => void;
}

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const SCAN_FRAME_SIZE = SCREEN_WIDTH * 0.65;

// ══════════════════════════════════════════════════════════════════════════════
// ANA BİLEŞEN
// ══════════════════════════════════════════════════════════════════════════════
const MedicineAR: React.FC<MedicineARProps> = ({
  onMedicineDetected,
  onClose,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const insets = useSafeAreaInsets();
  const [detectedMedicine, setDetectedMedicine] = useState<MedicineInfo | null>(null);
  const [scanning, setScanning] = useState(true);
  const [showReminder, setShowReminder] = useState(false);

  // Tarama çizgisi animasyonu
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Tarama çizgisi animasyonu başlat
  useEffect(() => {
    if (!scanning) return;

    const scanAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    );

    scanAnimation.start();
    pulseAnimation.start();

    return () => {
      scanAnimation.stop();
      pulseAnimation.stop();
    };
  }, [scanning, scanLineAnim, pulseAnim]);

  // ── Barkod/QR tarandığında ──────────────────────────────────────────────
  const handleBarcodeScanned = useCallback(
    (result: {type: string; data: string}) => {
      if (!scanning) return; // Zaten bir ilaç tespit edildiyse tekrar tarama

      const medicine = findMedicineByBarcode(result.data);
      if (medicine) {
        setScanning(false);
        // Artık bilgiyi MedicineDetailScreen'e bırakacağımız için doğrudan ID dönüyoruz
        onMedicineDetected(medicine.id);
      }
    },
    [scanning, onMedicineDetected],
  );

  // ── Bilgi kartı kapatıldığında ──────────────────────────────────────────
  const handleCloseInfoCard = () => {
    setDetectedMedicine(null);
    setScanning(true);
    setShowReminder(false);
  };

  // ── Hatırlatıcı oluştur ─────────────────────────────────────────────────
  const handleCreateReminder = async (medicine: MedicineInfo) => {
    // Saat bilgisini parse et (ör: "Günde 2 kez" → 08:00 ve 20:00)
    const defaultHours = getDefaultReminderHours(medicine);

    Alert.alert(
      '⏰ Hatırlatıcı Oluştur',
      `${medicine.name} (${medicine.genericName}) için günlük hatırlatıcı oluşturulacak.\n\n` +
        `Sıklık: ${medicine.frequency}\n` +
        `Zamanlama: ${medicine.timing}\n\n` +
        `Hatırlatma saatleri: ${defaultHours.map(h => `${String(h.hour).padStart(2, '0')}:${String(h.minute).padStart(2, '0')}`).join(', ')}`,
      [
        {text: 'İptal', style: 'cancel'},
        {
          text: 'Hatırlatıcı Oluştur ✓',
          style: 'default',
          onPress: async () => {
            let success = true;
            for (const time of defaultHours) {
              const id = await scheduleMedicineReminder(
                `${medicine.id}_${time.hour}_${time.minute}`,
                medicine.name,
                time.hour,
                time.minute,
                `${medicine.frequency} • ${medicine.timing}`,
              );
              if (!id) success = false;
            }

            if (success) {
              Alert.alert(
                '✅ Hatırlatıcı Oluşturuldu',
                `${medicine.name} için günlük hatırlatıcı aktif edildi.\n\n` +
                  `Her gün ${defaultHours.map(h => `${String(h.hour).padStart(2, '0')}:${String(h.minute).padStart(2, '0')}`).join(' ve ')} saatlerinde bildirim alacaksınız.`,
                [{text: 'Tamam'}],
              );
            } else {
              Alert.alert(
                '⚠️ Bildirim İzni Gerekli',
                'Hatırlatıcı oluşturmak için bildirim iznine ihtiyaç var. Lütfen ayarlardan izin verin.',
                [{text: 'Tamam'}],
              );
            }
          },
        },
      ],
    );
  };

  // ── İzin kontrolleri ────────────────────────────────────────────────────
  if (!permission) {
    return (
      <View style={styles.permScreen}>
        <Text style={styles.permLoadingText}>Kamera izni kontrol ediliyor…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permScreen}>
        <Text style={styles.permIcon}>📷</Text>
        <Text style={styles.permTitle}>Kamera İzni Gerekli</Text>
        <Text style={styles.permSubtitle}>
          İlaç kutularını tanımak için kamera erişimine ihtiyaç var.
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

  // ══════════════════════════════════════════════════════════════════════════
  // KAMERA + AR GÖRÜNÜMÜ
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <View style={styles.container}>
      {/* ── Kamera ──────────────────────────────────────────────────────── */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: [
            'qr',
            'ean13',
            'ean8',
            'code128',
            'code39',
            'datamatrix',
          ],
        }}
        onBarcodeScanned={scanning ? handleBarcodeScanned : undefined}
      />

      {/* ── Üst bilgi bandı ─────────────────────────────────────────────── */}
      <View style={[styles.topBanner, {paddingTop: insets.top + Spacing.sm}]}>
        <View style={styles.topBannerContent}>
          <View style={styles.arBadge}>
            <Text style={styles.arBadgeText}>📷 AR TARAMA</Text>
          </View>
          <Text style={styles.topTitle}>İlaç Tanıma Rehberi</Text>
          <Text style={styles.topSubtitle}>
            {scanning
              ? 'İlaç kutusunu kameraya gösterin'
              : `${detectedMedicine?.name} tanındı!`}
          </Text>
        </View>
      </View>

      {/* ── Kapat butonu ────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={[styles.closeBtn, {top: insets.top + Spacing.sm}]}
        onPress={onClose}>
        <Text style={styles.closeBtnText}>✕</Text>
      </TouchableOpacity>

      {/* ── Tarama çerçevesi (ilaç tespit edilmeden önce) ────────────────── */}
      {scanning && (
        <View style={styles.scanOverlay}>
          <Animated.View
            style={[
              styles.scanFrame,
              {transform: [{scale: pulseAnim}]},
            ]}>
            {/* Köşe işaretçileri */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {/* Tarama çizgisi */}
            <Animated.View
              style={[
                styles.scanLine,
                {
                  transform: [
                    {
                      translateY: scanLineAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, SCAN_FRAME_SIZE - 4],
                      }),
                    },
                  ],
                },
              ]}
            />
          </Animated.View>

          {/* Tarama ipucu */}
          <View style={styles.scanHintBox}>
            <Text style={styles.scanHintIcon}>💊</Text>
            <Text style={styles.scanHintText}>
              İlaç kutusundaki QR kodu veya barkodu{'\n'}tarama çerçevesine hizalayın
            </Text>
          </View>
        </View>
      )}

      {/* Artık doğrudan MedicineDetail sayfasına geçildiği için burada kart gösterilmiyor */}

      {/* ── Alt bilgi çubuğu (tarama modundayken) ───────────────────────── */}
      {scanning && (
        <View style={[styles.bottomBar, {paddingBottom: insets.bottom + Spacing.md}]}>
          <Text style={styles.bottomBarText}>
            💊 İlaç kutusunun barkodunu tarama çerçevesine hizalayın
          </Text>
          <Text style={styles.bottomBarSubtext}>
            10 karaciğer nakli ilacının barkodu otomatik tanınır
          </Text>
        </View>
      )}
    </View>
  );
};

// ── Yardımcı: İlacın varsayılan hatırlatma saatlerini belirle ────────────────
function getDefaultReminderHours(
  medicine: MedicineInfo,
): {hour: number; minute: number}[] {
  const freq = medicine.frequency.toLowerCase();

  if (freq.includes('2 kez') || freq.includes('iki kez')) {
    return [
      {hour: 8, minute: 0},
      {hour: 20, minute: 0},
    ];
  }
  if (freq.includes('3 kez') || freq.includes('üç kez')) {
    return [
      {hour: 8, minute: 0},
      {hour: 14, minute: 0},
      {hour: 20, minute: 0},
    ];
  }
  // Günde 1 kez veya diğer
  if (medicine.timing.toLowerCase().includes('sabah')) {
    return [{hour: 8, minute: 0}];
  }
  if (medicine.timing.toLowerCase().includes('akşam')) {
    return [{hour: 20, minute: 0}];
  }
  return [{hour: 8, minute: 0}];
}

// ── Stiller ───────────────────────────────────────────────────────────────────
const CORNER_SIZE = 28;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  // ── İzin Ekranı ────────────────────────────────────────────────────────────
  permScreen: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  permLoadingText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
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

  // ── Üst Banner ─────────────────────────────────────────────────────────────
  topBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(13, 27, 42, 0.85)',
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.base,
    zIndex: 5,
  },
  topBannerContent: {
    alignItems: 'center',
  },
  arBadge: {
    backgroundColor: Colors.brandBlue + 'BB',
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
    borderRadius: Radius.round,
    marginBottom: Spacing.xs,
  },
  arBadgeText: {
    ...Typography.caption,
    color: Colors.textOnBrand,
    fontWeight: '700',
    letterSpacing: 1,
  },
  topTitle: {
    ...Typography.headingSmall,
    color: Colors.textPrimary,
  },
  topSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // ── Kapat Butonu ───────────────────────────────────────────────────────────
  closeBtn: {
    position: 'absolute',
    right: Spacing.md,
    width: 36,
    height: 36,
    borderRadius: Radius.round,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // ── Tarama Overlay ─────────────────────────────────────────────────────────
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  scanFrame: {
    width: SCAN_FRAME_SIZE,
    height: SCAN_FRAME_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: Colors.arBlue,
    borderWidth: 3,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 6,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 6,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 6,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 6,
  },
  scanLine: {
    position: 'absolute',
    left: 4,
    right: 4,
    height: 2,
    backgroundColor: Colors.arBlue,
    shadowColor: Colors.arBlue,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },

  // ── Tarama İpucu ───────────────────────────────────────────────────────────
  scanHintBox: {
    marginTop: Spacing.xxl,
    alignItems: 'center',
    backgroundColor: 'rgba(13, 27, 42, 0.8)',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  scanHintIcon: {
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  scanHintText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // ── Bilgi Kartı Container ──────────────────────────────────────────────────
  infoCardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },

  // ── Alt Bilgi Çubuğu ──────────────────────────────────────────────────────
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(13, 27, 42, 0.9)',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    zIndex: 1,
  },
  bottomBarText: {
    ...Typography.bodySmall,
    color: Colors.arBlue,
    textAlign: 'center',
    marginBottom: 2,
  },
  bottomBarSubtext: {
    ...Typography.caption,
    color: Colors.textDisabled,
    textAlign: 'center',
  },
});

export default MedicineAR;
