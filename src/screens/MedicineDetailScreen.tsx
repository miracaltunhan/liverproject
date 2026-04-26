import React, {useRef, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Colors, Typography, Spacing, Radius} from '../theme';
import {RootStackParamList} from '../navigation/types';
import {MedicineInfo} from '../components/MedicineInfoCard';

// Bileşenler
import {Medicine3DViewer} from '../components/Medicine3DViewer';
import {OrbitalCard} from '../components/OrbitalCard';
import {ExpandedCardOverlay} from '../components/ExpandedCardOverlay';

import medicationsData from '../data/medications.json';
import {scheduleMedicineReminder} from '../utils/notifications';

const allMedicines: MedicineInfo[] = medicationsData.medicines as MedicineInfo[];

type MedicineDetailRouteProp = RouteProp<RootStackParamList, 'MedicineDetail'>;

// ── Yardımcı: İlacın varsayılan hatırlatma saatlerini belirle ────────────────
function getDefaultReminderHours(medicine: MedicineInfo): {hour: number; minute: number}[] {
  const freq = medicine.frequency.toLowerCase();
  if (freq.includes('2 kez') || freq.includes('iki kez')) return [{hour: 8, minute: 0}, {hour: 20, minute: 0}];
  if (freq.includes('3 kez') || freq.includes('üç kez')) return [{hour: 8, minute: 0}, {hour: 14, minute: 0}, {hour: 20, minute: 0}];
  if (medicine.timing.toLowerCase().includes('sabah')) return [{hour: 8, minute: 0}];
  if (medicine.timing.toLowerCase().includes('akşam')) return [{hour: 20, minute: 0}];
  return [{hour: 8, minute: 0}];
}

export default function MedicineDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<MedicineDetailRouteProp>();
  const insets = useSafeAreaInsets();
  const {medicineId, autoPromptReminder} = route.params;

  const [expandedCard, setExpandedCard] = useState<any | null>(null);

  const medicine = allMedicines.find(m => m.id === medicineId);

  // Animasyonlar
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Hatırlatıcı Mantığı
  const promptReminder = () => {
    if (!medicine) return;
    const defaultHours = getDefaultReminderHours(medicine);
    Alert.alert(
      '⏰ Hatırlatıcı Oluştur',
      `${medicine.name} için günlük hatırlatıcı oluşturulacak.\n\nSıklık: ${medicine.frequency}`,
      [
        {text: 'İptal', style: 'cancel'},
        {
          text: 'Oluştur ✓',
          onPress: async () => {
            let success = true;
            for (const time of defaultHours) {
              const id = await scheduleMedicineReminder(
                `${medicine.id}_${time.hour}_${time.minute}`,
                medicine.name,
                time.hour,
                time.minute,
                medicine.frequency,
              );
              if (!id) success = false;
            }
            if (success) {
              Alert.alert('✅ Başarılı', 'Hatırlatıcılar aktif edildi.', [{text: 'Tamam'}]);
            }
          },
        },
      ],
    );
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    if (autoPromptReminder && medicine) {
      setTimeout(() => promptReminder(), 1500); // 3D model ve kartlar yüklendikten sonra sor
    }
  }, [fadeAnim, autoPromptReminder, medicine]);

  if (!medicine) return null;

  // Orbital Kart Verileri
  const cards = [
    {
      icon: '💊',
      title: 'İlaç Bilgisi',
      color: medicine.color,
      content: `${medicine.name}\n${medicine.genericName}\n\nKategori: ${medicine.category}`,
    },
    {
      icon: '🎯',
      title: 'Kullanım Amacı',
      color: Colors.brandBlue,
      content: medicine.purpose,
    },
    {
      icon: '⏰',
      title: 'Dozaj & Sıklık',
      color: Colors.arYellow,
      content: `${medicine.dosage}\n\nSıklık: ${medicine.frequency}\nZamanlama: ${medicine.timing}`,
    },
    {
      icon: '🥛',
      title: 'Nasıl Alınır',
      color: Colors.info,
      content: medicine.howToTake,
    },
    {
      icon: '⚠️',
      title: 'Yan Etkiler',
      color: Colors.arRed,
      content: medicine.warnings.join('\n\n') + '\n\n' + medicine.sideEffects.join('\n'),
    },
    {
      icon: '🔄',
      title: 'Etkileşimler',
      color: Colors.textSecondary,
      content: medicine.interactions.join('\n\n'),
    },
  ];

  return (
    <View style={styles.screen} pointerEvents="box-none">
      {/* ── Üst Bar ───────────────────────────────────────────────────────── */}
      <View style={[styles.topBar, {paddingTop: insets.top}]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{medicine.name}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={promptReminder}>
          <Text style={styles.backIcon}>⏰</Text>
        </TouchableOpacity>
      </View>

      {/* ── 3D View & Orbital Kartlar ───────────────────────────────────── */}
      <Animated.View style={[styles.content, {opacity: fadeAnim}]} pointerEvents="box-none">
        {/* Merkezde 3D Model */}
        <View style={StyleSheet.absoluteFillObject} pointerEvents="auto">
          <Medicine3DViewer color={medicine.color} category={medicine.category} medicineId={medicine.id} />
        </View>

        {/* Etrafta Orbital Kartlar (Açılar: 0, 60, 120, 180, 240, 300) */}
        {cards.map((card, index) => {
          const angle = index * (360 / cards.length); // 6 kart = 60 derece aralık
          const delay = 500 + index * 150; // Sırayla gelme animasyonu
          return (
            <OrbitalCard
              key={index}
              icon={card.icon}
              title={card.title}
              color={card.color}
              angle={angle}
              radius={140} // Merkezden uzaklık
              delay={delay}
              onPress={() => setExpandedCard(card)}
            />
          );
        })}
      </Animated.View>

      {/* ── Detay Overlay (Tıklanınca Açılır) ───────────────────────────── */}
      <ExpandedCardOverlay data={expandedCard} onClose={() => setExpandedCard(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Arka plan kamerayı gösterecek şekilde yarı saydam
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    zIndex: 20, // Canvas'ın üstünde kalması için
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: Radius.round,
  },
  backIcon: {
    fontSize: 24,
    color: Colors.textPrimary,
  },
  topBarTitle: {
    ...Typography.headingMedium,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
