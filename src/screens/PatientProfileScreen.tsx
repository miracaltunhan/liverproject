import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {Colors, Typography, Spacing, Radius, Shadow} from '../theme';
import Header from '../components/Header';
import {usePatient, MedicationEntry, BagItem} from '../store/PatientContext';
import defaultChecklist from '../data/checklist.json';

const PatientProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const {state, dispatch} = usePatient();

  const [name, setName] = useState(state.name);
  const [surgeryType, setSurgeryType] = useState(state.surgeryType);
  const [surgeryDate, setSurgeryDate] = useState(state.surgeryDate);
  const [waterGoal, setWaterGoal] = useState(String(state.waterGoalMl));

  const handleSave = () => {
    const goalNum = parseInt(waterGoal, 10);
    dispatch({
      type: 'SET_PATIENT',
      payload: {
        name,
        surgeryType,
        surgeryDate,
        waterGoalMl: isNaN(goalNum) || goalNum <= 0 ? 2500 : goalNum,
      },
    });
    Alert.alert('Kaydedildi', 'Profil bilgilerin güncellendi.', [
      {text: 'Tamam', onPress: () => navigation.goBack()},
    ]);
  };

  const loadDefaultChecklist = () => {
    if (state.bagChecklist.length > 0) {
      Alert.alert(
        'Liste Sıfırlansın mı?',
        'Varsayılan liste yüklenince mevcut liste silinir.',
        [
          {text: 'İptal', style: 'cancel'},
          {text: 'Yükle', style: 'destructive', onPress: applyDefaultChecklist},
        ],
      );
    } else {
      applyDefaultChecklist();
    }
  };

  const applyDefaultChecklist = () => {
    const items: BagItem[] = (defaultChecklist.items as any[]).map(i => ({
      id: i.id,
      label: i.label,
      packed: false,
      critical: i.critical ?? false,
    }));
    dispatch({type: 'SET_PATIENT', payload: {bagChecklist: items}});
  };

  return (
    <View style={styles.screen}>
      <Header
        title="Hasta Profili"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>

          <Text style={styles.label}>Ad Soyad</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Adınızı girin"
            placeholderTextColor={Colors.textDisabled}
          />

          <Text style={styles.label}>Ameliyat Türü</Text>
          <TextInput
            style={styles.input}
            value={surgeryType}
            onChangeText={setSurgeryType}
            placeholder="Örn: Apendektomi"
            placeholderTextColor={Colors.textDisabled}
          />

          <Text style={styles.label}>Ameliyat Tarihi (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={surgeryDate}
            onChangeText={setSurgeryDate}
            placeholder="2026-05-15"
            placeholderTextColor={Colors.textDisabled}
            keyboardType="numbers-and-punctuation"
          />

          <Text style={styles.label}>Günlük Su Hedefi (ml)</Text>
          <TextInput
            style={styles.input}
            value={waterGoal}
            onChangeText={setWaterGoal}
            keyboardType="numeric"
            placeholder="2500"
            placeholderTextColor={Colors.textDisabled}
          />
        </View>

        {/* Çanta varsayılan listesi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hızlı Eylemler</Text>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={loadDefaultChecklist}>
            <Text style={styles.actionIcon}>🧳</Text>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Varsayılan Çanta Listesini Yükle</Text>
              <Text style={styles.actionSubtitle}>
                Standart ameliyat öncesi eşya listesi eklenir
              </Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Kaydet</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: Colors.bgPrimary},
  content: {padding: Spacing.base, paddingBottom: Spacing.xxxl},

  section: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadow.low,
  },
  sectionTitle: {
    ...Typography.headingMedium,
    color: Colors.textPrimary,
    marginBottom: Spacing.base,
  },
  label: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  input: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },

  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  actionIcon: {fontSize: 24, marginRight: Spacing.md},
  actionText: {flex: 1},
  actionTitle: {
    ...Typography.headingSmall,
    color: Colors.textPrimary,
  },
  actionSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  actionArrow: {
    fontSize: 24,
    color: Colors.brandBlue,
    fontWeight: '300',
  },

  saveBtn: {
    backgroundColor: Colors.brandBlue,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    ...Shadow.medium,
  },
  saveBtnText: {
    ...Typography.headingSmall,
    color: Colors.textOnBrand,
  },
});

export default PatientProfileScreen;
