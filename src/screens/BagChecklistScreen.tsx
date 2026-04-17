import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {Colors, Typography, Spacing, Radius, Shadow} from '../theme';
import Header from '../components/Header';
import ProgressBar from '../components/ProgressBar';
import BagChecklistAR from '../ar/BagChecklistAR';
import {usePatient, BagItem} from '../store/PatientContext';

const BagChecklistScreen: React.FC = () => {
  const navigation = useNavigation();
  const {state, dispatch} = usePatient();
  const [arActive, setArActive] = useState(false);
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemCritical, setNewItemCritical] = useState(false);

  const packedCount = state.bagChecklist.filter(i => i.packed).length;
  const totalItems = state.bagChecklist.length;
  const progress = totalItems > 0 ? packedCount / totalItems : 0;

  const handleAddItem = () => {
    const label = newItemLabel.trim();
    if (!label) return;
    const newItem: BagItem = {
      id: Date.now().toString(),
      label,
      packed: false,
      critical: newItemCritical,
    };
    dispatch({type: 'ADD_BAG_ITEM', payload: newItem});
    setNewItemLabel('');
    setNewItemCritical(false);
  };

  const handleRemoveItem = (id: string, label: string) => {
    Alert.alert('Eşyayı Sil', `"${label}" listeden kaldırılsın mı?`, [
      {text: 'İptal', style: 'cancel'},
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => dispatch({type: 'REMOVE_BAG_ITEM', payload: id}),
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <Header
        title="Hastane Çantası"
        subtitle="AR ile eşya kontrolü"
        onBack={() => navigation.goBack()}
        rightAction={{icon: '📷', onPress: () => setArActive(v => !v)}}
      />

      {arActive && (
        <View style={styles.arOverlay}>
          <BagChecklistAR
            items={state.bagChecklist}
            onClose={() => setArActive(false)}
          />
        </View>
      )}

      {/* Özet */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Hazırlanan</Text>
          <Text style={styles.summaryCount}>
            <Text style={styles.countPacked}>{packedCount}</Text>
            <Text style={styles.countTotal}> / {totalItems}</Text>
          </Text>
        </View>
        <ProgressBar
          value={progress}
          color={Colors.warning}
          height={8}
          showPercent
          style={styles.progressBar}
        />
      </View>

      {/* Eşya listesi */}
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}>

        {/* Eksik eşyalar önce */}
        {[false, true].map(packedGroup =>
          state.bagChecklist
            .filter(i => i.packed === packedGroup)
            .map(item => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.itemCard,
                  item.packed && styles.itemCardPacked,
                ]}
                onPress={() => dispatch({type: 'TOGGLE_BAG_ITEM', payload: item.id})}
                onLongPress={() => handleRemoveItem(item.id, item.label)}>
                <View
                  style={[
                    styles.checkbox,
                    item.packed
                      ? styles.checkboxChecked
                      : item.critical
                      ? styles.checkboxCritical
                      : styles.checkboxEmpty,
                  ]}>
                  {item.packed && <Text style={styles.checkmark}>✓</Text>}
                </View>

                <View style={styles.itemInfo}>
                  <Text
                    style={[
                      styles.itemLabel,
                      item.packed && styles.itemLabelPacked,
                    ]}>
                    {item.label}
                  </Text>
                  {item.critical && !item.packed && (
                    <Text style={styles.criticalBadge}>⚠ Kritik</Text>
                  )}
                </View>

                {!item.packed && (
                  <View
                    style={[
                      styles.statusIndicator,
                      {
                        backgroundColor: item.critical
                          ? Colors.danger + '33'
                          : Colors.bgElevated,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: item.critical
                            ? Colors.arRed
                            : Colors.textDisabled,
                        },
                      ]}>
                      {item.critical ? 'Eksik!' : 'Bekliyor'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )),
        )}

        {/* Yeni eşya ekle */}
        <View style={styles.addSection}>
          <Text style={styles.addTitle}>Eşya Ekle</Text>
          <View style={styles.addRow}>
            <TextInput
              style={styles.addInput}
              value={newItemLabel}
              onChangeText={setNewItemLabel}
              placeholder="Eşya adı..."
              placeholderTextColor={Colors.textDisabled}
              returnKeyType="done"
              onSubmitEditing={handleAddItem}
            />
            <TouchableOpacity
              style={[
                styles.criticalToggle,
                newItemCritical && styles.criticalToggleActive,
              ]}
              onPress={() => setNewItemCritical(v => !v)}>
              <Text style={styles.criticalToggleText}>⚠</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addBtn} onPress={handleAddItem}>
              <Text style={styles.addBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: Colors.bgPrimary},
  arOverlay: {...StyleSheet.absoluteFillObject, zIndex: 10, backgroundColor: '#000'},

  summaryCard: {
    margin: Spacing.base,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadow.low,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  summaryLabel: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  summaryCount: {},
  countPacked: {
    ...Typography.headingLarge,
    color: Colors.warning,
  },
  countTotal: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
  },
  progressBar: {},

  list: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xxxl,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  itemCardPacked: {
    opacity: 0.45,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: Radius.sm,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  checkboxEmpty: {borderColor: Colors.textDisabled},
  checkboxChecked: {
    borderColor: Colors.arGreen,
    backgroundColor: Colors.successLight,
  },
  checkboxCritical: {
    borderColor: Colors.arRed,
    backgroundColor: Colors.dangerLight,
  },
  checkmark: {
    color: Colors.arGreen,
    fontWeight: '700',
    fontSize: 14,
  },
  itemInfo: {flex: 1},
  itemLabel: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  itemLabelPacked: {
    textDecorationLine: 'line-through',
    color: Colors.textDisabled,
  },
  criticalBadge: {
    ...Typography.caption,
    color: Colors.arRed,
    marginTop: 2,
  },
  statusIndicator: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.round,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
  },

  addSection: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  addTitle: {
    ...Typography.headingSmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  addRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  addInput: {
    flex: 1,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  criticalToggle: {
    width: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  criticalToggleActive: {
    backgroundColor: Colors.dangerLight,
    borderColor: Colors.danger,
  },
  criticalToggleText: {fontSize: 18},
  addBtn: {
    width: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.warning,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.low,
  },
  addBtnText: {
    fontSize: 24,
    color: Colors.bgPrimary,
    fontWeight: '700',
    lineHeight: 28,
  },
});

export default BagChecklistScreen;
