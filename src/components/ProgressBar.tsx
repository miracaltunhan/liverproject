import React from 'react';
import {View, Text, StyleSheet, ViewStyle} from 'react-native';
import {Colors, Typography, Spacing, Radius} from '../theme';

interface ProgressBarProps {
  value: number;        // 0-1
  color?: string;
  height?: number;
  label?: string;       // örn: "1200 / 2500 ml"
  showPercent?: boolean;
  style?: ViewStyle;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = Colors.brandBlue,
  height = 8,
  label,
  showPercent = false,
  style,
}) => {
  const clamped = Math.min(Math.max(value, 0), 1);
  const percent = Math.round(clamped * 100);

  return (
    <View style={[styles.wrapper, style]}>
      {/* Üst satır: label + yüzde */}
      {(label || showPercent) && (
        <View style={styles.labelRow}>
          {label ? (
            <Text style={styles.label}>{label}</Text>
          ) : (
            <View />
          )}
          {showPercent && (
            <Text style={[styles.percent, {color}]}>{percent}%</Text>
          )}
        </View>
      )}

      {/* Track */}
      <View style={[styles.track, {height}]}>
        <View
          style={[
            styles.fill,
            {
              width: `${percent}%` as any,
              backgroundColor: color,
              height,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  label: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  percent: {
    ...Typography.labelLarge,
  },
  track: {
    width: '100%',
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.round,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: Radius.round,
  },
});

export default ProgressBar;
