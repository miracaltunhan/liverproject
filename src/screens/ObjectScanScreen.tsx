import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {Colors, Typography, Spacing, Radius} from '../theme';
import Header from '../components/Header';
import ObjectRecognitionAR from '../ar/ObjectRecognition';
import AROverlay from '../components/AROverlay';

type DetectedObject = {
  label: string;
  confidence: number;
  safe: boolean;
  message: string;
};

const ObjectScanScreen: React.FC = () => {
  const navigation = useNavigation();
  const [scanning, setScanning] = useState(false);
  const [detected, setDetected] = useState<DetectedObject | null>(null);

  const handleDetection = (obj: DetectedObject) => {
    setDetected(obj);
  };

  return (
    <View style={styles.screen}>
      <Header
        title="Nesne Tarama"
        subtitle="ML ile oda analizi"
        onBack={() => navigation.goBack()}
      />

      {/* Kamera / AR alanı */}
      <View style={styles.cameraArea}>
        {scanning ? (
          <>
            <ObjectRecognitionAR
              onDetected={handleDetection}
              onClose={() => {
                setScanning(false);
                setDetected(null);
              }}
            />
            {detected && (
              <View style={styles.overlayWrapper}>
                <AROverlay
                  label={detected.label}
                  sublabel={`${detected.message} (${Math.round(detected.confidence * 100)}%)`}
                  type={detected.safe ? 'success' : 'danger'}
                  onDismiss={() => setDetected(null)}
                />
              </View>
            )}
          </>
        ) : (
          <View style={styles.scanPrompt}>
            {/* Tarama çerçevesi animasyonu */}
            <View style={styles.scanFrame}>
              <Text style={styles.scanIcon}>📷</Text>
            </View>
            <Text style={styles.scanPromptTitle}>Tarama Başlatılmadı</Text>
            <Text style={styles.scanPromptSubtitle}>
              Kamerayı açarak oda nesnelerini ML ile analiz et.
              Ameliyat öncesi sakıncalı nesneler kırmızıya döner.
            </Text>
            <TouchableOpacity
              style={styles.startBtn}
              onPress={() => setScanning(true)}>
              <Text style={styles.startBtnText}>Taramayı Başlat</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Bilgi notu */}
      {!scanning && (
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ</Text>
          <Text style={styles.infoText}>
            Bu modül TensorFlow Lite modeliyle çalışır. Kamera verisi
            cihaz dışına çıkmaz; tüm analiz yerel olarak yapılır.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: Colors.bgPrimary},

  cameraArea: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
  overlayWrapper: {
    position: 'absolute',
    bottom: Spacing.xl,
    left: Spacing.xl,
    right: Spacing.xl,
  },

  scanPrompt: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  scanFrame: {
    width: 160,
    height: 160,
    borderRadius: Radius.xl,
    borderWidth: 2,
    borderColor: Colors.brandBlue + '66',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    backgroundColor: Colors.bgElevated,
  },
  scanIcon: {fontSize: 64},
  scanPromptTitle: {
    ...Typography.headingMedium,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  scanPromptSubtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  startBtn: {
    backgroundColor: Colors.brandBlue,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.round,
  },
  startBtnText: {
    ...Typography.labelLarge,
    color: Colors.textOnBrand,
  },

  infoBox: {
    flexDirection: 'row',
    margin: Spacing.base,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.info + '44',
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 16,
    color: Colors.info,
    marginRight: Spacing.sm,
    marginTop: 1,
  },
  infoText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
});

export default ObjectScanScreen;
