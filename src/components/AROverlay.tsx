import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import {Colors, Typography, Spacing, Radius} from '../theme';

interface AROverlayProps {
  label: string;
  sublabel?: string;
  type: 'success' | 'danger' | 'info' | 'warning';
  onDismiss?: () => void;
  style?: ViewStyle;
}

const TYPE_COLORS: Record<AROverlayProps['type'], string> = {
  success: Colors.arGreen,
  danger: Colors.arRed,
  info: Colors.arBlue,
  warning: Colors.arYellow,
};

const TYPE_ICONS: Record<AROverlayProps['type'], string> = {
  success: '✓',
  danger: '✕',
  info: 'ℹ',
  warning: '⚠',
};

const AROverlay: React.FC<AROverlayProps> = ({
  label,
  sublabel,
  type,
  onDismiss,
  style,
}) => {
  const color = TYPE_COLORS[type];

  return (
    <View style={[styles.container, {borderColor: color}, style]}>
      {/* Köşe işaretçileri — AR çerçeve efekti */}
      <View style={[styles.corner, styles.cornerTL, {borderColor: color}]} />
      <View style={[styles.corner, styles.cornerTR, {borderColor: color}]} />
      <View style={[styles.corner, styles.cornerBL, {borderColor: color}]} />
      <View style={[styles.corner, styles.cornerBR, {borderColor: color}]} />

      {/* İkon */}
      <View style={[styles.iconCircle, {backgroundColor: color + '33', borderColor: color}]}>
        <Text style={[styles.iconText, {color}]}>{TYPE_ICONS[type]}</Text>
      </View>

      {/* Label */}
      <Text style={[styles.label, {color}]}>{label}</Text>
      {sublabel ? (
        <Text style={styles.sublabel}>{sublabel}</Text>
      ) : null}

      {/* Kapat */}
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn}>
          <Text style={[styles.dismissText, {color}]}>Kapat</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const CORNER_SIZE = 16;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    borderWidth: 1,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(13, 27, 42, 0.85)',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderWidth: 2,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: Radius.md,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: Radius.md,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: Radius.md,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: Radius.md,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: Radius.round,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  iconText: {
    fontSize: 24,
    fontWeight: '700',
  },
  label: {
    ...Typography.headingMedium,
    textAlign: 'center',
  },
  sublabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  dismissBtn: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.round,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  dismissText: {
    ...Typography.labelLarge,
  },
});

export default AROverlay;
