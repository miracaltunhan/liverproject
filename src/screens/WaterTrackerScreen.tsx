import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {Colors, Typography, Spacing, Radius, Shadow} from '../theme';
import Header from '../components/Header';
import ProgressBar from '../components/ProgressBar';
import WaterTrackerAR from '../ar/WaterTrackerAR';
import {usePatient} from '../store/PatientContext';

const QUICK_AMOUNTS = [200, 300, 500];

const WaterTrackerScreen: React.FC = () => {
  const navigation = useNavigation();
  const {state, dispatch} = usePatient();
  const [arActive, setArActive] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const progress = state.waterGoalMl > 0
    ? state.waterIntakeMl / state.waterGoalMl
    : 0;

  const isGoalReached = state.waterIntakeMl >= state.waterGoalMl;

  const addWater = (ml: number) => {
    dispatch({type: 'ADD_WATER', payload: ml});
  };

  const handleCustomAdd = () => {
    const amount = parseInt(customInput, 10);
    if (!isNaN(amount) && amount > 0) {
      addWater(amount);
      setCustomInput('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header
        title="Su Takibi"
        subtitle="Günlük hedefini izle"
        onBack={() => navigation.goBack()}
        rightAction={{
          icon: '📷',
          onPress: () => setArActive(v => !v),
        }}
      />

      {arActive && (
        <View style={styles.arOverlay}>
          <WaterTrackerAR
            progress={progress}
            onClose={() => setArActive(false)}
          />
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* Büyük su göstergesi */}
        <View style={styles.gaugeCard}>
          <Text style={styles.gaugeEmoji}>
            {isGoalReached ? '🎉' : '💧'}
          </Text>
          <Text style={styles.gaugeValue}>{state.waterIntakeMl} ml</Text>
          <Text style={styles.gaugeGoal}>/ {state.waterGoalMl} ml hedef</Text>

          <ProgressBar
            value={progress}
            color={Colors.brandTeal}
            height={12}
            showPercent
            style={styles.progressBar}
          />

          {isGoalReached && (
            <View style={styles.goalBadge}>
              <Text style={styles.goalBadgeText}>🏆 Günlük hedef tamamlandı!</Text>
            </View>
          )}
        </View>

        {/* Hızlı ekleme butonları */}
        <Text style={styles.sectionTitle}>Hızlı Ekle</Text>
        <View style={styles.quickRow}>
          {QUICK_AMOUNTS.map(amount => (
            <TouchableOpacity
              key={amount}
              style={styles.quickBtn}
              onPress={() => addWater(amount)}>
              <Text style={styles.quickBtnText}>+{amount} ml</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Manuel giriş */}
        <Text style={styles.sectionTitle}>Manuel Giriş</Text>
        <View style={styles.customRow}>
          <TextInput
            style={styles.input}
            value={customInput}
            onChangeText={setCustomInput}
            keyboardType="numeric"
            placeholder="Miktar (ml)"
            placeholderTextColor={Colors.textDisabled}
            returnKeyType="done"
            onSubmitEditing={handleCustomAdd}
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleCustomAdd}>
            <Text style={styles.addBtnText}>Ekle</Text>
          </TouchableOpacity>
        </View>

        {/* Sıfırla */}
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={() => dispatch({type: 'RESET_WATER'})}>
          <Text style={styles.resetBtnText}>↺ Günü Sıfırla</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: Colors.bgPrimary},
  arOverlay: {...StyleSheet.absoluteFillObject, zIndex: 10, backgroundColor: '#000'},
  content: {padding: Spacing.base, paddingBottom: Spacing.xxxl},

  gaugeCard: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadow.low,
  },
  gaugeEmoji: {fontSize: 52, marginBottom: Spacing.sm},
  gaugeValue: {
    ...Typography.displayLarge,
    color: Colors.brandTeal,
    marginBottom: Spacing.xs,
  },
  gaugeGoal: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  progressBar: {width: '100%'},
  goalBadge: {
    marginTop: Spacing.md,
    backgroundColor: Colors.successLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.round,
  },
  goalBadgeText: {
    ...Typography.labelLarge,
    color: Colors.arGreen,
  },

  sectionTitle: {
    ...Typography.headingSmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    marginTop: Spacing.xl,
  },
  quickRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.brandTeal + '55',
    ...Shadow.low,
  },
  quickBtnText: {
    ...Typography.labelLarge,
    color: Colors.brandTeal,
  },

  customRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    ...Typography.bodyLarge,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  addBtn: {
    backgroundColor: Colors.brandTeal,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
    ...Shadow.low,
  },
  addBtnText: {
    ...Typography.labelLarge,
    color: Colors.textOnBrand,
  },

  resetBtn: {
    marginTop: Spacing.xl,
    alignSelf: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.round,
    borderWidth: 1,
    borderColor: Colors.danger + '55',
  },
  resetBtnText: {
    ...Typography.labelLarge,
    color: Colors.danger,
  },
});

export default WaterTrackerScreen;
