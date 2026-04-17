import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import {Colors, Typography, Spacing, Radius, Shadow} from '../theme';

interface FeatureCardProps {
  icon: string;          // emoji ya da kısa sembol
  title: string;
  subtitle: string;
  accentColor: string;   // sol border rengi
  onPress: () => void;
  progress?: number;     // 0-1 arası, opsiyonel
  badge?: string;        // sağ üst köşe etiketi
  style?: ViewStyle;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  subtitle,
  accentColor,
  onPress,
  progress,
  badge,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.75}>
      {/* Sol renkli accent bar */}
      <View style={[styles.accentBar, {backgroundColor: accentColor}]} />

      {/* İçerik */}
      <View style={styles.content}>
        <View style={styles.row}>
          {/* İkon */}
          <View style={[styles.iconWrapper, {backgroundColor: accentColor + '22'}]}>
            <Text style={styles.icon}>{icon}</Text>
          </View>

          {/* Metin */}
          <View style={styles.textBlock}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>

          {/* Ok */}
          <Text style={[styles.arrow, {color: accentColor}]}>›</Text>
        </View>

        {/* Progress bar (opsiyonel) */}
        {progress !== undefined && (
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.round(progress * 100)}%` as any,
                  backgroundColor: accentColor,
                },
              ]}
            />
          </View>
        )}
      </View>

      {/* Badge */}
      {badge ? (
        <View style={[styles.badge, {backgroundColor: accentColor}]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Shadow.low,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  accentBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: Spacing.base,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  icon: {
    fontSize: 22,
  },
  textBlock: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  title: {
    ...Typography.headingSmall,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  arrow: {
    fontSize: 24,
    fontWeight: '300',
  },
  progressTrack: {
    height: 3,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.round,
    marginTop: Spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.round,
  },
  badge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.round,
  },
  badgeText: {
    ...Typography.caption,
    color: Colors.textOnBrand,
    fontWeight: '700',
  },
});

export default FeatureCard;
