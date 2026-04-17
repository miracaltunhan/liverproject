import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {Colors, Typography, Spacing, Radius, Shadow} from '../theme';
import Header from '../components/Header';
import AROverlay from '../components/AROverlay';
import MedicineAR from '../ar/MedicineAR';
import {usePatient} from '../store/PatientContext';

const MedicineScreen: React.FC = () => {
  const navigation = useNavigation();
  const {state, dispatch} = usePatient();
  const [arActive, setArActive] = useState(false);
  const [alertMed, setAlertMed] = useState<string | null>(null);

  const handleMarkTaken = (id: string, name: string) => {
    Alert.alert(
      'İlaç Alındı mı?',
      `"${name}" ilacını aldığını onaylıyor musun?`,
      [
        {text: 'İptal', style: 'cancel'},
        {
          text: 'Evet, Aldım',
          style: 'default',
          onPress: () => dispatch({type: 'MARK_MEDICATION_TAKEN', payload: id}),
        },
      ],
    );
  };

  return (
    <View style={styles.screen}>
      <Header
        title="İlaç Rehberi"
        subtitle="AR ile ilaç bilgisi"
        onBack={() => navigation.goBack()}
        rightAction={{icon: '📷', onPress: () => setArActive(v => !v)}}
      />

      {/* AR Kamera Görünümü – tam ekran overlay */}
      {arActive && (
        <View style={styles.arOverlay}>
          <MedicineAR
            onMedicineDetected={name => setAlertMed(name)}
            onClose={() => setArActive(false)}
          />
          {alertMed && (
            <View style={styles.arAlertWrapper}>
              <AROverlay
                label={alertMed}
                sublabel="Bu ilacı AR rehberle kullan"
                type="info"
                onDismiss={() => setAlertMed(null)}
              />
            </View>
          )}
        </View>
      )}

      {/* İlaç listesi */}
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}>
        {state.medications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💊</Text>
            <Text style={styles.emptyTitle}>İlaç Eklenmemiş</Text>
            <Text style={styles.emptySubtitle}>
              Profil ekranından ameliyat öncesi ilaçlarını ekle.
            </Text>
          </View>
        ) : (
          state.medications.map(med => (
            <View
              key={med.id}
              style={[
                styles.medCard,
                med.taken && styles.medCardTaken,
              ]}>
              <View style={styles.medInfo}>
                <Text style={styles.medName}>{med.name}</Text>
                <Text style={styles.medDose}>{med.dose}</Text>
                <View style={styles.medTimeRow}>
                  <Text style={styles.medTimeIcon}>🕐</Text>
                  <Text style={styles.medTime}>{med.time}</Text>
                </View>
              </View>

              {med.taken ? (
                <View style={styles.takenBadge}>
                  <Text style={styles.takenIcon}>✓</Text>
                  <Text style={styles.takenText}>Alındı</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.markBtn}
                  onPress={() => handleMarkTaken(med.id, med.name)}>
                  <Text style={styles.markBtnText}>Aldım</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* AR başlatma FAB */}
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
  list: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxxl + Spacing.xl,
  },
  medCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadow.low,
  },
  medCardTaken: {
    opacity: 0.5,
  },
  medInfo: {flex: 1},
  medName: {
    ...Typography.headingSmall,
    color: Colors.textPrimary,
  },
  medDose: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  medTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  medTimeIcon: {fontSize: 12, marginRight: 4},
  medTime: {
    ...Typography.caption,
    color: Colors.brandBlue,
  },
  takenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.round,
  },
  takenIcon: {color: Colors.arGreen, fontWeight: '700', marginRight: 4},
  takenText: {
    ...Typography.labelLarge,
    color: Colors.arGreen,
  },
  markBtn: {
    backgroundColor: Colors.brandBlue,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.round,
  },
  markBtnText: {
    ...Typography.labelLarge,
    color: Colors.textOnBrand,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: Spacing.xxxl,
  },
  emptyIcon: {fontSize: 56, marginBottom: Spacing.md},
  emptyTitle: {
    ...Typography.headingMedium,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
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
