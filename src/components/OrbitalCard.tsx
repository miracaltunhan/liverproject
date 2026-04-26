import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {Colors, Radius, Shadow, Spacing, Typography} from '../theme';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const CENTER_X = SCREEN_WIDTH / 2;
const CENTER_Y = 250; // 3D Canvas'ın tahmini merkezi

interface OrbitalCardProps {
  icon: string;
  title: string;
  color: string;
  angle: number; // Derece cinsinden (0-360)
  radius: number; // Merkezden uzaklık
  delay: number; // Animasyon gecikmesi
  onPress: () => void;
}

export const OrbitalCard: React.FC<OrbitalCardProps> = ({
  icon,
  title,
  color,
  angle,
  radius,
  delay,
  onPress,
}) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: 500,
      delay: delay,
      useNativeDriver: true,
    }).start();
  }, [animValue, delay]);

  // Açıdan X ve Y koordinatlarını hesapla (Trigonometri)
  const rad = (angle * Math.PI) / 180;
  // Kartın merkezi kendi ortası olduğu için ekstra ofset vermiyoruz, container'da absolute position kullanacağız
  const translateX = radius * Math.cos(rad);
  const translateY = radius * Math.sin(rad);

  // Ortadan dışarı doğru kayma (Slide-out) efekti için interpolasyon
  const animatedTranslateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, translateX],
  });
  
  const animatedTranslateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, translateY],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: animValue,
          transform: [
            {translateX: animatedTranslateX},
            {translateY: animatedTranslateY},
            {scale: animValue},
          ],
        },
      ]}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={onPress}>
        <View style={[styles.colorStrip, {backgroundColor: color}]} />
        <View style={styles.content}>
          <View style={[styles.iconContainer, {backgroundColor: color + '22'}]}>
            <Text style={styles.icon}>{icon}</Text>
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: CENTER_X - 60, // Kart genişliğinin yarısı (120/2)
    top: CENTER_Y - 30, // Kart yüksekliğinin yarısı (60/2)
    width: 120,
    zIndex: 10,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20, 30, 45, 0.85)', // Glassmorphism efekti
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...Shadow.low,
  },
  colorStrip: {
    width: 4,
    height: '100%',
  },
  content: {
    flex: 1,
    padding: Spacing.xs,
    alignItems: 'center',
    flexDirection: 'row',
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: Radius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.xs,
  },
  icon: {
    fontSize: 14,
  },
  title: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
    fontSize: 10,
  },
});
