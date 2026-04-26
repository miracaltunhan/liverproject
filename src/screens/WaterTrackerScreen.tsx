import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {Colors, Typography, Spacing, Radius, Shadow} from '../theme';
import Header from '../components/Header';
import ProgressBar from '../components/ProgressBar';
import WaterTrackerAR from '../ar/WaterTrackerAR';
import {usePatient} from '../store/PatientContext';
import {
  scheduleWaterReminders,
  cancelWaterReminders,
  sendTestNotification,
} from '../services/NotificationService';
import {
  loadNotificationSettings,
  saveNotificationSettings,
} from '../utils/storage';

const QUICK_AMOUNTS = [200, 300, 500];

const WaterTrackerScreen: React.FC = () => {
  const navigation = useNavigation();
  const {state, dispatch, isHydrated} = usePatient();
  const [arActive, setArActive] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [remindersOn, setRemindersOn] = useState(false);
  const [reminderInterval, setReminderInterval] = useState(2); // saat
  const settingsLoaded = useRef(false);
  const [pendingMl, setPendingMl] = useState(0);
  const [pouring, setPouring] = useState(false);
  const pourY       = useRef(new Animated.Value(-120)).current;
  const pourScale   = useRef(new Animated.Value(0.6)).current;
  const pourOpacity = useRef(new Animated.Value(0)).current;
  const splashScale   = useRef(new Animated.Value(0)).current;
  const splashOpacity = useRef(new Animated.Value(0)).current;

  // Bildirim ayarlarını depolamadan yükle
  useEffect(() => {
    loadNotificationSettings()
      .then(saved => {
        if (saved) {
          setRemindersOn(saved.remindersOn);
          setReminderInterval(saved.reminderInterval);
        }
      })
      .catch(() => {})
      .finally(() => {
        settingsLoaded.current = true;
      });
  }, []);

  // Bildirim ayarları değişince kaydet (yükleme bitmeden kaydetme)
  useEffect(() => {
    if (!settingsLoaded.current) return;
    saveNotificationSettings({remindersOn, reminderInterval}).catch(() => {});
  }, [remindersOn, reminderInterval]);

  // Gün değişimi kontrolü — otomatik sıfırlama
  useEffect(() => {
    if (!isHydrated) return;
    const lastDate = state.lastSyncedAt
      ? new Date(state.lastSyncedAt).toDateString()
      : null;
    const today = new Date().toDateString();
    if (lastDate && lastDate !== today) {
      dispatch({type: 'RESET_WATER'});
      dispatch({
        type: 'SET_PATIENT',
        payload: {lastSyncedAt: new Date().toISOString()},
      });
    }
  }, [isHydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#40C4FF" />
      </View>
    );
  }

  const progress = state.waterGoalMl > 0
    ? state.waterIntakeMl / state.waterGoalMl
    : 0;

  const isGoalReached = state.waterIntakeMl >= state.waterGoalMl;
  const remaining = Math.max(state.waterGoalMl - state.waterIntakeMl, 0);

  // ── Bildirim planlama ──────────────────────────────────────────────────
  const syncReminders = useCallback(async () => {
    if (remindersOn) {
      await scheduleWaterReminders(
        reminderInterval,
        state.waterGoalMl,
        state.waterIntakeMl,
      );
    } else {
      await cancelWaterReminders();
    }
  }, [remindersOn, reminderInterval, state.waterGoalMl, state.waterIntakeMl]);

  useEffect(() => {
    syncReminders();
  }, [syncReminders]);

  // ── Su ekleme ──────────────────────────────────────────────────────────
  const addWater = (ml: number) => {
    dispatch({type: 'ADD_WATER', payload: ml});
  };

  const handleConfirmAdd = () => {
    if (pendingMl <= 0 || pouring) return;
    pourY.setValue(-120);
    pourScale.setValue(0.6);
    pourOpacity.setValue(0);
    splashScale.setValue(0);
    splashOpacity.setValue(0);
    setPouring(true);
    Animated.sequence([
      Animated.parallel([
        Animated.timing(pourOpacity, {toValue: 1, duration: 100, useNativeDriver: true}),
        Animated.timing(pourY, {toValue: 160, duration: 520, easing: Easing.out(Easing.quad), useNativeDriver: true}),
        Animated.timing(pourScale, {toValue: 1.15, duration: 520, useNativeDriver: true}),
      ]),
      Animated.parallel([
        Animated.spring(pourScale, {toValue: 0.9, friction: 5, tension: 100, useNativeDriver: true}),
        Animated.timing(splashOpacity, {toValue: 0.9, duration: 100, useNativeDriver: true}),
        Animated.spring(splashScale, {toValue: 1, friction: 4, tension: 80, useNativeDriver: true}),
      ]),
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(pourOpacity, {toValue: 0, duration: 300, useNativeDriver: true}),
        Animated.timing(splashOpacity, {toValue: 0, duration: 300, useNativeDriver: true}),
      ]),
    ]).start(() => {
      addWater(pendingMl);
      setPendingMl(0);
      setPouring(false);
    });
  };

  const handleCustomAdd = () => {
    const amount = parseInt(customInput, 10);
    if (!isNaN(amount) && amount > 0) {
      addWater(amount);
      setCustomInput('');
    }
  };

  // ── Bildirim toggle ───────────────────────────────────────────────────
  const handleReminderToggle = async (value: boolean) => {
    setRemindersOn(value);
    if (value) {
      Alert.alert(
        '💧 Hatırlatıcı Aktif',
        `Her ${reminderInterval} saatte bir su içme hatırlatıcısı alacaksın.`,
      );
    }
  };

  // ── Interval değiştirme ───────────────────────────────────────────────
  const cycleInterval = () => {
    const options = [1, 2, 3, 4];
    const next = options[(options.indexOf(reminderInterval) + 1) % options.length];
    setReminderInterval(next);
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
            intakeMl={state.waterIntakeMl}
            goalMl={state.waterGoalMl}
            onClose={() => setArActive(false)}
          />
        </View>
      )}

      {/* ── Bardak dökme animasyonu ─────────────────────────────────── */}
      {pouring && (
        <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, {zIndex: 30}]}>
          <View style={{alignItems: 'center'}}>
            <Animated.Text
              style={{
                fontSize: 56,
                marginTop: 80,
                transform: [{translateY: pourY}, {scale: pourScale}],
                opacity: pourOpacity,
              }}>
              🥤
            </Animated.Text>
          </View>
          <View style={{position: 'absolute', top: 285, left: 0, right: 0, alignItems: 'center'}}>
            <Animated.View
              style={{
                width: 120,
                height: 44,
                borderRadius: 60,
                borderWidth: 2.5,
                borderColor: 'rgba(64,196,255,0.65)',
                backgroundColor: 'rgba(64,196,255,0.1)',
                transform: [{scale: splashScale}],
                opacity: splashOpacity,
              }}
            />
          </View>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* ── Büyük su göstergesi ────────────────────────────────────── */}
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

          {/* Kalan miktar */}
          {!isGoalReached && (
            <Text style={styles.remainingText}>
              🎯 Kalan: {remaining} ml
            </Text>
          )}

          {isGoalReached && (
            <View style={styles.goalBadge}>
              <Text style={styles.goalBadgeText}>🏆 Günlük hedef tamamlandı!</Text>
            </View>
          )}
        </View>

        {/* ── Hatırlatıcı Ayarları ───────────────────────────────────── */}
        <View style={styles.reminderCard}>
          <View style={styles.reminderHeader}>
            <Text style={styles.reminderIcon}>🔔</Text>
            <View style={styles.reminderInfo}>
              <Text style={styles.reminderTitle}>Su Hatırlatıcı</Text>
              <Text style={styles.reminderSubtitle}>
                {remindersOn
                  ? `Her ${reminderInterval} saatte bir bildirim`
                  : 'Hatırlatıcılar kapalı'}
              </Text>
            </View>
            <Switch
              value={remindersOn}
              onValueChange={handleReminderToggle}
              trackColor={{
                false: Colors.bgElevated,
                true: Colors.brandTeal + '88',
              }}
              thumbColor={remindersOn ? Colors.brandTeal : Colors.textDisabled}
            />
          </View>

          {remindersOn && (
            <View style={styles.reminderOptions}>
              {/* Aralık ayarı */}
              <TouchableOpacity
                style={styles.intervalBtn}
                onPress={cycleInterval}>
                <Text style={styles.intervalLabel}>⏱️ Aralık</Text>
                <Text style={styles.intervalValue}>{reminderInterval} saat</Text>
              </TouchableOpacity>

              {/* Test bildirimi */}
              <TouchableOpacity
                style={styles.testBtn}
                onPress={sendTestNotification}>
                <Text style={styles.testBtnText}>🧪 Test Et</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── Hızlı ekleme butonları ─────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Hızlı Ekle</Text>
        <View style={styles.quickRow}>
          {QUICK_AMOUNTS.map(amount => (
            <TouchableOpacity
              key={amount}
              style={styles.quickBtn}
              onPress={() => setPendingMl(prev => prev + amount)}>
              <Text style={styles.quickBtnEmoji}>💧</Text>
              <Text style={styles.quickBtnText}>+{amount} ml</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Staging card ───────────────────────────────────────────── */}
        {pendingMl > 0 && (
          <View style={styles.stagingCard}>
            <Text style={styles.stagingLabel}>Eklenecek miktar</Text>
            <Text style={styles.stagingAmount}>+{pendingMl} ml</Text>
            <View style={styles.stagingButtons}>
              <TouchableOpacity
                style={styles.stagingCancelBtn}
                onPress={() => setPendingMl(0)}
                disabled={pouring}>
                <Text style={styles.stagingCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.stagingConfirmBtn, pouring && {opacity: 0.6}]}
                onPress={handleConfirmAdd}
                disabled={pouring}
                activeOpacity={0.8}>
                <Text style={styles.stagingConfirmText}>💧 Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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

        {/* ── Sıfırla ────────────────────────────────────────────────── */}
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
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bgPrimary},
  arOverlay: {...StyleSheet.absoluteFillObject, zIndex: 10, backgroundColor: '#000'},
  content: {padding: Spacing.base, paddingBottom: Spacing.xxxl},

  // ── Gauge card ──────────────────────────────────────────────────────────
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
  remainingText: {
    ...Typography.bodySmall,
    color: Colors.arBlue,
    marginTop: Spacing.md,
  },
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

  // ── Hatırlatıcı kartı ──────────────────────────────────────────────────
  reminderCard: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadow.low,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderIcon: {
    fontSize: 28,
    marginRight: Spacing.md,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    ...Typography.headingSmall,
    color: Colors.textPrimary,
  },
  reminderSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  reminderOptions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  intervalBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgElevated,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    gap: Spacing.xs,
  },
  intervalLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  intervalValue: {
    ...Typography.labelLarge,
    color: Colors.brandTeal,
  },
  testBtn: {
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    justifyContent: 'center',
  },
  testBtnText: {
    ...Typography.labelLarge,
    color: Colors.arBlue,
  },

  // ── Hızlı ekleme ──────────────────────────────────────────────────────
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
  quickBtnEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  quickBtnText: {
    ...Typography.labelLarge,
    color: Colors.brandTeal,
  },

  // ── Manuel giriş ──────────────────────────────────────────────────────
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

  // ── Sıfırla ────────────────────────────────────────────────────────────
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

  // ── Staging card ────────────────────────────────────────────────────────
  stagingCard: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.brandTeal + '80',
    alignItems: 'center',
    ...Shadow.medium,
  },
  stagingLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  stagingAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.brandTeal,
    marginBottom: Spacing.lg,
  },
  stagingButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  stagingCancelBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.textDisabled,
    alignItems: 'center',
  },
  stagingCancelText: {
    ...Typography.labelLarge,
    color: Colors.textSecondary,
  },
  stagingConfirmBtn: {
    flex: 2,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.brandTeal,
    alignItems: 'center',
    ...Shadow.low,
  },
  stagingConfirmText: {
    ...Typography.labelLarge,
    color: Colors.textOnBrand,
    fontSize: 16,
  },
});

export default WaterTrackerScreen;
