import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import {Colors, Radius, Shadow, Spacing, Typography} from '../theme';

interface ExpandedCardData {
  icon: string;
  title: string;
  content: string | React.ReactNode;
  color: string;
}

interface Props {
  data: ExpandedCardData | null;
  onClose: () => void;
}

export const ExpandedCardOverlay: React.FC<Props> = ({data, onClose}) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (data) {
      Animated.spring(animValue, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      animValue.setValue(0);
    }
  }, [data, animValue]);

  if (!data) return null;

  return (
    <View style={styles.overlay}>
      {/* Arka Plan Karartma */}
      <Animated.View
        style={[
          styles.dimBackground,
          {
            opacity: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.7],
            }),
          },
        ]}>
        <TouchableOpacity style={styles.flex1} activeOpacity={1} onPress={onClose} />
      </Animated.View>

      {/* Ana Kart */}
      <Animated.View
        style={[
          styles.cardContainer,
          {
            opacity: animValue,
            transform: [
              {
                scale: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
              {
                translateY: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}>
        <View style={[styles.header, {borderBottomColor: data.color + '44'}]}>
          <View style={[styles.iconBox, {backgroundColor: data.color + '22'}]}>
            <Text style={styles.icon}>{data.icon}</Text>
          </View>
          <Text style={[styles.title, {color: data.color}]}>{data.title}</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
          {typeof data.content === 'string' ? (
            <Text style={styles.contentText}>{data.content}</Text>
          ) : (
            data.content
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    padding: Spacing.lg,
  },
  dimBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  flex1: {
    flex: 1,
  },
  cardContainer: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
    ...Shadow.high,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.bgElevated,
    borderBottomWidth: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  icon: {
    fontSize: 20,
  },
  title: {
    ...Typography.headingMedium,
    flex: 1,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  closeIcon: {
    fontSize: 20,
    color: Colors.textSecondary,
  },
  contentScroll: {
    padding: Spacing.lg,
  },
  contentText: {
    ...Typography.bodyLarge,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
});
