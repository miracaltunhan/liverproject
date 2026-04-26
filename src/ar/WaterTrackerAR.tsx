import React, {useEffect, useRef, useState} from 'react';
import {View, StyleSheet, Text, Animated, Easing} from 'react-native';
import MockARView from './MockARView';
import {Colors} from '../theme';

/* ─── ViroReact — koşullu yükleme ──────────────────────────────────────────── */
let ViroARScene: any = null;
let ViroARSceneNavigator: any = null;
let Viro3DObject: any = null;
let ViroAmbientLight: any = null;
let ViroSpotLight: any = null;
let ViroARPlaneSelector: any = null;
let ViroText: any = null;
let ViroNode: any = null;
let ViroBox: any = null;
let ViroMaterials: any = null;
let ViroAnimations: any = null;
let viroReady = false;

try {
  const V = require('@viro-community/react-viro');
  ViroARScene = V.ViroARScene;
  ViroARSceneNavigator = V.ViroARSceneNavigator;
  Viro3DObject = V.Viro3DObject;
  ViroAmbientLight = V.ViroAmbientLight;
  ViroSpotLight = V.ViroSpotLight;
  ViroARPlaneSelector = V.ViroARPlaneSelector;
  ViroText = V.ViroText;
  ViroNode = V.ViroNode;
  ViroBox = V.ViroBox;
  ViroMaterials = V.ViroMaterials;
  ViroAnimations = V.ViroAnimations;

  // ── Materyaller ────────────────────────────────────────────────────────────
  ViroMaterials.createMaterials({
    waterLow: {
      diffuseColor: 'rgba(25, 118, 210, 0.7)',
      lightingModel: 'Blinn',
      blendMode: 'Alpha',
    },
    waterMid: {
      diffuseColor: 'rgba(64, 196, 255, 0.75)',
      lightingModel: 'Blinn',
      blendMode: 'Alpha',
    },
    waterFull: {
      diffuseColor: 'rgba(0, 230, 118, 0.8)',
      lightingModel: 'Blinn',
      blendMode: 'Alpha',
    },
    groundGlow: {
      diffuseColor: 'rgba(64, 196, 255, 0.15)',
      lightingModel: 'Constant',
      blendMode: 'Alpha',
    },
  });

  // ── Animasyonlar ──────────────────────────────────────────────────────────
  ViroAnimations.registerAnimations({
    waterPulse: {
      properties: {scaleX: 1.02, scaleZ: 1.02},
      duration: 800,
      easing: 'EaseInEaseOut',
    },
    waterPulseBack: {
      properties: {scaleX: 1.0, scaleZ: 1.0},
      duration: 800,
      easing: 'EaseInEaseOut',
    },
    waterBreath: [['waterPulse', 'waterPulseBack']],
    bottleBounce: {
      properties: {positionY: 0.02},
      duration: 600,
      easing: 'Bounce',
    },
    // Şişe hologram float
    bottleFloat: {
      properties: {positionY: 0.07},
      duration: 1800,
      easing: 'EaseInEaseOut',
    },
    bottleFloatDown: {
      properties: {positionY: 0.0},
      duration: 1800,
      easing: 'EaseInEaseOut',
    },
    bottleFloatLoop: [['bottleFloat', 'bottleFloatDown']],
    // Hafif sallantı
    bottleSway: {
      properties: {rotateZ: 4},
      duration: 2500,
      easing: 'EaseInEaseOut',
    },
    bottleSwayBack: {
      properties: {rotateZ: -4},
      duration: 2500,
      easing: 'EaseInEaseOut',
    },
    bottleSwayLoop: [['bottleSway', 'bottleSwayBack']],
  });

  viroReady = true;
} catch {
  // Expo Go — ViroReact mevcut değil
}

/* ─── Props ─────────────────────────────────────────────────────────────────── */
interface WaterTrackerARProps {
  progress: number;      // 0 → 1
  intakeMl?: number;     // mevcut içim (ml)
  goalMl?: number;       // günlük hedef (ml)
  onClose: () => void;
}

/* ─── Gerçek AR Sahnesi ─────────────────────────────────────────────────────── */
const WaterScene: React.FC<{
  arSceneNavigator: {viroAppProps: {progress: number}};
}> = ({arSceneNavigator}) => {
  const {progress} = arSceneNavigator.viroAppProps;
  const pct = Math.round(progress * 100);

  const fillScaleY = 0.02 + Math.min(progress, 1) * 0.48;
  const fillPosY = (fillScaleY - 0.50) * 0.5;

  const waterMaterial =
    progress >= 1 ? 'waterFull' : progress >= 0.5 ? 'waterMid' : 'waterLow';

  const labelColor =
    progress >= 1 ? '#00E676' : progress >= 0.5 ? '#40C4FF' : '#1976D2';

  return (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" intensity={300} />
      <ViroSpotLight
        position={[0, 3, 0]}
        direction={[0, -1, 0]}
        color="#ffffff"
        intensity={500}
        attenuationStartDistance={5}
        attenuationEndDistance={10}
        castsShadow={true}
        shadowOpacity={0.35}
      />

      <ViroARPlaneSelector>
        {/* Zemin glow diski */}
        <ViroBox
          position={[0, -0.27, 0]}
          scale={[0.55, 0.003, 0.55]}
          materials={['groundGlow']}
        />

        {/* Float animasyonlu ana node */}
        <ViroNode
          position={[0, 0, 0]}
          animation={{name: 'bottleFloatLoop', run: true, loop: true}}>
          {/* Sway node — şişe + su */}
          <ViroNode animation={{name: 'bottleSwayLoop', run: true, loop: true}}>
            <Viro3DObject
              source={require('../../assets/models/bottle.glb')}
              position={[0, 0, 0]}
              scale={[0.15, 0.15, 0.15]}
              type="GLB"
              dragType="FixedToWorld"
              onDrag={() => {}}
              animation={{name: 'bottleBounce', run: true, delay: 200}}
            />

            <Viro3DObject
              source={require('../../assets/models/water.glb')}
              position={[0, fillPosY, 0]}
              scale={[0.14, fillScaleY, 0.14]}
              type="GLB"
              materials={[waterMaterial]}
              animation={{name: 'waterBreath', run: true, loop: true}}
            />
          </ViroNode>

          {/* Bilgi etiketi — float node'a göre sabit kalır */}
          <ViroText
            text={`${pct}%`}
            position={[0, 0.42, 0]}
            scale={[0.35, 0.35, 0.35]}
            style={{
              fontFamily: 'Arial',
              fontSize: 36,
              fontWeight: '800',
              color: labelColor,
            }}
            outerStroke={{type: 'Outline', width: 1, color: '#000000'}}
          />

          <ViroText
            text={progress >= 1 ? '✓ Hedefe Ulaşıldı!' : 'Su Takibi'}
            position={[0, 0.30, 0]}
            scale={[0.25, 0.25, 0.25]}
            style={{
              fontFamily: 'Arial',
              fontSize: 18,
              color: progress >= 1 ? '#00E676' : '#90A4AE',
              fontWeight: '500',
            }}
          />
        </ViroNode>
      </ViroARPlaneSelector>
    </ViroARScene>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════════
   MOCK AR — Expo Go'da çalışan premium şişe görünümü
   ═══════════════════════════════════════════════════════════════════════════════ */

const MockBottle: React.FC<{progress: number; intakeMl?: number; goalMl?: number}> = ({progress, intakeMl = 0, goalMl = 2000}) => {
  const pct = Math.min(Math.round(progress * 100), 100);
  const color =
    progress >= 1 ? '#00E676' : progress >= 0.5 ? '#40C4FF' : '#1976D2';

  // ── Animasyonlar ─────────────────────────────────────────────────────────
  const waveAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const bubbleAnim1 = useRef(new Animated.Value(0)).current;
  const bubbleAnim2 = useRef(new Animated.Value(0)).current;
  const fillAnim = useRef(new Animated.Value(pct)).current;
  const glowPulse = useRef(new Animated.Value(0.4)).current;
  // AR hissiyatı
  const floatAnim = useRef(new Animated.Value(0)).current;
  const scanAnim  = useRef(new Animated.Value(0)).current;
  const ringAnim  = useRef(new Animated.Value(0)).current;
  const swayAnim  = useRef(new Animated.Value(0)).current;
  const flickerAnim = useRef(new Animated.Value(1)).current;
  const [hudTick, setHudTick] = useState(0);

  useEffect(() => {
    // Su dalgası
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Işık yansıması
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Kabarcık 1
    Animated.loop(
      Animated.sequence([
        Animated.timing(bubbleAnim1, {
          toValue: 1,
          duration: 2000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bubbleAnim1, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.delay(1500),
      ]),
    ).start();

    // Kabarcık 2
    Animated.loop(
      Animated.sequence([
        Animated.delay(800),
        Animated.timing(bubbleAnim2, {
          toValue: 1,
          duration: 1800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bubbleAnim2, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
      ]),
    ).start();

    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 0.8,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0.4,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Hologram float — tüm şişe yukarı-aşağı
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // AR tarama çizgisi — alttan yukarı süpürme
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {toValue: 0, duration: 0, useNativeDriver: true}),
        Animated.delay(700),
      ]),
    ).start();

    // Zemin çapası halkası
    Animated.loop(
      Animated.sequence([
        Animated.timing(ringAnim, {
          toValue: 1,
          duration: 950,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(ringAnim, {
          toValue: 0,
          duration: 950,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Hafif sallantı
    Animated.loop(
      Animated.sequence([
        Animated.timing(swayAnim, {
          toValue: 1,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(swayAnim, {
          toValue: 0,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Hologram flicker — nadiren ve kısa
    Animated.loop(
      Animated.sequence([
        Animated.delay(3000),
        Animated.timing(flickerAnim, {toValue: 0.55, duration: 60,  useNativeDriver: true}),
        Animated.timing(flickerAnim, {toValue: 1.0,  duration: 60,  useNativeDriver: true}),
        Animated.timing(flickerAnim, {toValue: 0.7,  duration: 40,  useNativeDriver: true}),
        Animated.timing(flickerAnim, {toValue: 1.0,  duration: 80,  useNativeDriver: true}),
        Animated.delay(2000),
        Animated.timing(flickerAnim, {toValue: 0.6,  duration: 50,  useNativeDriver: true}),
        Animated.timing(flickerAnim, {toValue: 1.0,  duration: 100, useNativeDriver: true}),
      ]),
    ).start();

    // HUD sayı tick — her 1.5s rakamları oynamış gibi göster
    const hudInterval = setInterval(() => setHudTick(t => t + 1), 1500);
    return () => clearInterval(hudInterval);
  }, []);

  // Su seviyesi değiştiğinde animasyonla güncelle
  useEffect(() => {
    Animated.spring(fillAnim, {
      toValue: pct,
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const waveTranslateX = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-8, 8],
  });

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.05, 0.25, 0.05],
  });

  const shimmerTranslateY = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -160],
  });

  const bubble1TranslateY = bubbleAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -100],
  });
  const bubble1Opacity = bubbleAnim1.interpolate({
    inputRange: [0, 0.3, 0.8, 1],
    outputRange: [0, 0.7, 0.3, 0],
  });

  const bubble2TranslateY = bubbleAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -80],
  });
  const bubble2Opacity = bubbleAnim2.interpolate({
    inputRange: [0, 0.3, 0.8, 1],
    outputRange: [0, 0.5, 0.2, 0],
  });

  const fillHeight = fillAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const floatTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  const scanTranslateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [200, -4],
  });

  const ringScale = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.3],
  });

  const ringOpacity = ringAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 0.35, 0.08],
  });

  const swayDeg = swayAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-2.5deg', '2.5deg'],
  });

  return (
    <View style={mockStyles.bottleWrapper}>
      {/* ── Floating + Sway + Flicker wrapper ───────────────────── */}
      <Animated.View
        style={{
          alignItems: 'center',
          opacity: flickerAnim,
          transform: [{translateY: floatTranslateY}, {rotate: swayDeg}],
        }}>
        {/* ── Dış glow ─────────────────────────────────────────── */}
        <Animated.View
          style={[
            mockStyles.glowOuter,
            {
              opacity: glowPulse,
              shadowColor: color,
              borderColor: color + '30',
            },
          ]}
        />

        {/* ── Şişe boyun kısmı ──────────────────────────────────── */}
        <View style={mockStyles.bottleNeck}>
          <View style={[mockStyles.neckInner, {borderColor: color + '50'}]} />
        </View>

        {/* ── Kapak ─────────────────────────────────────────────── */}
        <View style={[mockStyles.bottleCap, {backgroundColor: color + '90'}]}>
          <View style={[mockStyles.capHighlight, {backgroundColor: color}]} />
        </View>

        {/* ── Şişe gövdesi ──────────────────────────────────────── */}
        <View style={mockStyles.bottleBody}>
          {/* Cam yansıma efekti */}
          <View style={mockStyles.glassReflection} />
          <View style={mockStyles.glassReflection2} />

          {/* Su dolum */}
          <Animated.View
            style={[
              mockStyles.waterFill,
              {
                height: fillHeight,
                backgroundColor: color + 'BB',
              },
            ]}>
            {/* Su dalgası */}
            <Animated.View
              style={[
                mockStyles.wave,
                {
                  backgroundColor: color + 'DD',
                  transform: [{translateX: waveTranslateX}],
                },
              ]}
            />
            <Animated.View
              style={[
                mockStyles.wave2,
                {
                  backgroundColor: color + '99',
                  transform: [{translateX: Animated.multiply(waveTranslateX, -1)}],
                },
              ]}
            />

            {/* Kabarcıklar */}
            <Animated.View
              style={[
                mockStyles.bubble,
                {
                  left: '30%',
                  bottom: '20%',
                  opacity: bubble1Opacity,
                  transform: [{translateY: bubble1TranslateY}],
                },
              ]}
            />
            <Animated.View
              style={[
                mockStyles.bubbleSmall,
                {
                  left: '60%',
                  bottom: '35%',
                  opacity: bubble2Opacity,
                  transform: [{translateY: bubble2TranslateY}],
                },
              ]}
            />
          </Animated.View>

          {/* Işık yansıması efekti */}
          <Animated.View
            style={[
              mockStyles.shimmer,
              {
                opacity: shimmerOpacity,
                transform: [{translateY: shimmerTranslateY}],
              },
            ]}
          />

          {/* AR tarama çizgisi */}
          <Animated.View
            style={[
              mockStyles.scanLine,
              {
                borderColor: color + 'CC',
                shadowColor: color,
                transform: [{translateY: scanTranslateY}],
              },
            ]}
          />

          {/* Ölçü çizgileri */}
          <View style={mockStyles.markingsContainer}>
            {[25, 50, 75].map(mark => (
              <View
                key={mark}
                style={[mockStyles.marking, {bottom: `${mark}%`}]}>
                <View style={mockStyles.markLine} />
                <Text style={mockStyles.markText}>{mark}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Yüzde göstergesi ─────────────────────────────────── */}
        <View style={mockStyles.pctContainer}>
          <Text style={[mockStyles.pctValue, {color}]}>{pct}%</Text>
          <Text style={mockStyles.pctLabel}>
            {progress >= 1
              ? '🎉 Hedefe ulaşıldı!'
              : progress >= 0.75
                ? '🔥 Neredeyse tamam!'
                : progress >= 0.5
                  ? '💪 Yarıyı geçtin!'
                  : progress > 0
                    ? '💧 Devam et!'
                    : '🥤 Su eklemeye başla'}
          </Text>
        </View>
      </Animated.View>

      {/* ── AR zemin çapası halkası ───────────────────────────── */}
      <Animated.View
        style={[
          mockStyles.groundAnchor,
          {
            borderColor: color + '80',
            shadowColor: color,
            transform: [{scaleX: ringScale}, {scaleY: ringScale}],
            opacity: ringOpacity,
          },
        ]}
      />

      {/* ── AR HUD veri paneli ────────────────────────────────── */}
      <View style={[mockStyles.hudPanel, {borderColor: color + '60'}]}>
        <View style={mockStyles.hudRow}>
          <Text style={mockStyles.hudLabel}>INTAKE</Text>
          <Text style={[mockStyles.hudValue, {color}]}>{intakeMl} ml</Text>
        </View>
        <View style={mockStyles.hudDivider} />
        <View style={mockStyles.hudRow}>
          <Text style={mockStyles.hudLabel}>TARGET</Text>
          <Text style={mockStyles.hudValue}>{goalMl} ml</Text>
        </View>
        <View style={mockStyles.hudDivider} />
        <View style={mockStyles.hudRow}>
          <Text style={mockStyles.hudLabel}>REM</Text>
          <Text style={mockStyles.hudValue}>{Math.max(goalMl - intakeMl, 0)} ml</Text>
        </View>
        <View style={mockStyles.hudDivider} />
        <View style={mockStyles.hudRow}>
          <Text style={mockStyles.hudLabel}>FILL</Text>
          <Text style={[mockStyles.hudValue, {color}]}>{pct}%</Text>
        </View>
        {/* Tick — sayıların güncel göründüğünü simüle eden gizli counter */}
        <Text style={mockStyles.hudTick}>#{(hudTick % 99).toString().padStart(2, '0')}</Text>
      </View>
    </View>
  );
};

/* ─── Ana Bileşen ───────────────────────────────────────────────────────────── */
const WaterTrackerAR: React.FC<WaterTrackerARProps> = ({progress, intakeMl, goalMl, onClose}) => {
  // ── Expo Go: Mock kamera + premium şişe ─────────────────────────────────
  if (!viroReady) {
    return (
      <MockARView
        moduleTitle="Su Tüketimi Takibi"
        hint="Su eklediğinde şişenin hologramı dolar"
        onClose={onClose}>
        <MockBottle progress={progress} intakeMl={intakeMl} goalMl={goalMl} />
      </MockARView>
    );
  }

  // ── Gerçek ViroReact AR ────────────────────────────────────────────────
  return (
    <ViroARSceneNavigator
      autofocus
      initialScene={{scene: WaterScene}}
      viroAppProps={{progress}}
      style={StyleSheet.absoluteFill}
    />
  );
};

/* ─── Stiller ───────────────────────────────────────────────────────────────── */
const mockStyles = StyleSheet.create({
  bottleWrapper: {
    position: 'absolute',
    top: '20%',
    alignSelf: 'center',
    alignItems: 'center',
  },

  // ── Glow ──────────────────────────────────────────────────────────────
  glowOuter: {
    position: 'absolute',
    top: 20,
    width: 110,
    height: 240,
    borderRadius: 20,
    borderWidth: 1,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 8,
  },

  // ── Kapak ──────────────────────────────────────────────────────────────
  bottleCap: {
    width: 36,
    height: 18,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  capHighlight: {
    width: 18,
    height: 4,
    borderRadius: 2,
    opacity: 0.7,
  },

  // ── Boyun ──────────────────────────────────────────────────────────────
  bottleNeck: {
    width: 32,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -1,
  },
  neckInner: {
    width: 24,
    height: 14,
    borderWidth: 1,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },

  // ── Gövde ──────────────────────────────────────────────────────────────
  bottleBody: {
    width: 90,
    height: 200,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
    position: 'relative',
  },

  // ── Cam yansıma ────────────────────────────────────────────────────────
  glassReflection: {
    position: 'absolute',
    top: 10,
    left: 8,
    width: 3,
    height: '70%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 2,
    zIndex: 5,
  },
  glassReflection2: {
    position: 'absolute',
    top: 20,
    left: 14,
    width: 1.5,
    height: '40%',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 1,
    zIndex: 5,
  },

  // ── Su ─────────────────────────────────────────────────────────────────
  waterFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  wave: {
    position: 'absolute',
    top: -6,
    left: -15,
    right: -15,
    height: 14,
    borderRadius: 99,
  },
  wave2: {
    position: 'absolute',
    top: -3,
    left: -10,
    right: -10,
    height: 10,
    borderRadius: 99,
  },

  // ── Kabarcıklar ────────────────────────────────────────────────────────
  bubble: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  bubbleSmall: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },

  // ── Işık ───────────────────────────────────────────────────────────────
  shimmer: {
    position: 'absolute',
    top: 0,
    right: 10,
    width: 20,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    transform: [{rotate: '15deg'}],
    zIndex: 4,
  },

  // ── Ölçü çizgileri ──────────────────────────────────────────────────────
  markingsContainer: {
    position: 'absolute',
    top: 0,
    right: 6,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 6,
  },
  marking: {
    position: 'absolute',
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  markLine: {
    width: 8,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: 3,
  },
  markText: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '600',
  },

  // ── Yüzde ──────────────────────────────────────────────────────────────
  pctContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  pctValue: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1,
  },
  pctLabel: {
    fontSize: 14,
    color: '#90A4AE',
    marginTop: 4,
    fontWeight: '500',
  },

  // ── AR tarama çizgisi ──────────────────────────────────────────────────
  scanLine: {
    position: 'absolute',
    left: -2,
    right: -2,
    height: 1.5,
    borderTopWidth: 1.5,
    zIndex: 10,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 4,
  },

  // ── AR zemin çapası halkası ────────────────────────────────────────────
  groundAnchor: {
    width: 100,
    height: 18,
    borderRadius: 50,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
    marginTop: 4,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 3,
  },

  // ── AR HUD veri paneli ──────────────────────────────────────────────────
  hudPanel: {
    position: 'absolute',
    right: -130,
    top: 40,
    width: 110,
    backgroundColor: 'rgba(7,15,25,0.82)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    gap: 2,
  },
  hudRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  hudLabel: {
    fontSize: 8,
    color: 'rgba(144,164,174,0.8)',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  hudValue: {
    fontSize: 10,
    color: '#e0e0e0',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  hudDivider: {
    height: 1,
    backgroundColor: 'rgba(64,196,255,0.12)',
    marginVertical: 1,
  },
  hudTick: {
    fontSize: 7,
    color: 'rgba(64,196,255,0.35)',
    alignSelf: 'flex-end',
    marginTop: 4,
    fontWeight: '600',
  },
});

export default WaterTrackerAR;
