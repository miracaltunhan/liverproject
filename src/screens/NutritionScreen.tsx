import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {Colors, Typography, Spacing, Radius, Shadow} from '../theme';
import Header from '../components/Header';
import NutritionAR from '../ar/NutritionAR';
import nutritionData from '../data/nutrition.json';

type FoodItem = {
  id: string;
  name: string;
  category: string;
  allowed: boolean;
  reason: string;
  timeRestriction?: string;
};

const NutritionScreen: React.FC = () => {
  const navigation = useNavigation();
  const [arActive, setArActive] = useState(false);
  const [filter, setFilter] = useState<'all' | 'allowed' | 'forbidden'>('all');

  const foods = nutritionData.items as FoodItem[];
  const filtered = foods.filter(f => {
    if (filter === 'allowed') return f.allowed;
    if (filter === 'forbidden') return !f.allowed;
    return true;
  });

  return (
    <View style={styles.screen}>
      <Header
        title="Beslenme Rehberi"
        subtitle="Ameliyat öncesi diyet"
        onBack={() => navigation.goBack()}
        rightAction={{icon: '📷', onPress: () => setArActive(v => !v)}}
      />

      {arActive && (
        <View style={styles.arOverlay}>
          <NutritionAR foods={foods} onClose={() => setArActive(false)} />
        </View>
      )}

      {/* Filtre butonları */}
      <View style={styles.filterRow}>
        {(['all', 'allowed', 'forbidden'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}>
            <Text
              style={[
                styles.filterBtnText,
                filter === f && styles.filterBtnTextActive,
              ]}>
              {f === 'all' ? 'Tümü' : f === 'allowed' ? '✓ İzinli' : '✕ Yasak'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}>
        {filtered.map(item => (
          <View
            key={item.id}
            style={[
              styles.foodCard,
              {borderLeftColor: item.allowed ? Colors.arGreen : Colors.arRed},
            ]}>
            <View style={styles.foodHeader}>
              <View
                style={[
                  styles.statusDot,
                  {backgroundColor: item.allowed ? Colors.arGreen : Colors.arRed},
                ]}
              />
              <Text style={styles.foodName}>{item.name}</Text>
              <View
                style={[
                  styles.foodBadge,
                  {
                    backgroundColor: item.allowed
                      ? Colors.successLight
                      : Colors.dangerLight,
                  },
                ]}>
                <Text
                  style={[
                    styles.foodBadgeText,
                    {color: item.allowed ? Colors.arGreen : Colors.arRed},
                  ]}>
                  {item.allowed ? 'İzinli' : 'Yasak'}
                </Text>
              </View>
            </View>
            <Text style={styles.foodCategory}>{item.category}</Text>
            <Text style={styles.foodReason}>{item.reason}</Text>
            {item.timeRestriction && (
              <View style={styles.timeRow}>
                <Text style={styles.timeIcon}>⏰</Text>
                <Text style={styles.timeText}>{item.timeRestriction}</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: Colors.bgPrimary},
  arOverlay: {...StyleSheet.absoluteFillObject, zIndex: 10, backgroundColor: '#000'},
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.round,
    alignItems: 'center',
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  filterBtnActive: {
    backgroundColor: Colors.brandBlue,
    borderColor: Colors.brandBlue,
  },
  filterBtnText: {
    ...Typography.labelLarge,
    color: Colors.textSecondary,
  },
  filterBtnTextActive: {
    color: Colors.textOnBrand,
  },
  list: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxxl,
  },
  foodCard: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: Colors.glassBorder,
    borderRightColor: Colors.glassBorder,
    borderBottomColor: Colors.glassBorder,
    ...Shadow.low,
  },
  foodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.round,
    marginRight: Spacing.sm,
  },
  foodName: {
    ...Typography.headingSmall,
    color: Colors.textPrimary,
    flex: 1,
  },
  foodBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.round,
  },
  foodBadgeText: {
    ...Typography.caption,
    fontWeight: '700',
  },
  foodCategory: {
    ...Typography.caption,
    color: Colors.textDisabled,
    marginBottom: Spacing.xs,
  },
  foodReason: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    backgroundColor: Colors.bgElevated,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
  },
  timeIcon: {fontSize: 12, marginRight: Spacing.xs},
  timeText: {
    ...Typography.caption,
    color: Colors.warning,
  },
});

export default NutritionScreen;
