import React from 'react';
import {View, StyleSheet, TouchableOpacity, Text} from 'react-native';
import MockARView from './MockARView';
import {Colors, Typography, Spacing, Radius} from '../theme';

let ViroARScene: any = null;
let ViroARSceneNavigator: any = null;
let Viro3DObject: any = null;
let ViroAmbientLight: any = null;
let ViroARPlaneSelector: any = null;
let ViroText: any = null;
let ViroAnimations: any = null;
let viroReady = false;

try {
  const V = require('@viro-community/react-viro');
  ViroARScene = V.ViroARScene;
  ViroARSceneNavigator = V.ViroARSceneNavigator;
  Viro3DObject = V.Viro3DObject;
  ViroAmbientLight = V.ViroAmbientLight;
  ViroARPlaneSelector = V.ViroARPlaneSelector;
  ViroText = V.ViroText;
  ViroAnimations = V.ViroAnimations;
  ViroAnimations.registerAnimations({
    waterFill: {properties: {scaleY: 1.0}, duration: 1200, easing: 'EaseInEaseOut'},
  });
  viroReady = true;
} catch {
  // Expo Go
}

interface WaterTrackerARProps {
  progress: number; // 0-1
  onClose: () => void;
}

// Su şişesi dolma animasyonu (yalnızca ViroReact mevcutsa)
if (viroReady && ViroAnimations) {
  ViroAnimations.registerAnimations({
    waterFill: {
      properties: {scaleY: 1.0},
      duration: 1200,
      easing: 'EaseInEaseOut',
    },
  });
}

const WaterScene: React.FC<{
  arSceneNavigator: {viroAppProps: {progress: number}};
}> = ({arSceneNavigator}) => {
  const {progress} = arSceneNavigator.viroAppProps;

  // 0-1 progress -> scale Y (şişe birimin dolu kısmı)
  const fillScaleY = 0.05 + progress * 0.45;
  const bottleColor = progress >= 1 ? '#00E676' : progress >= 0.5 ? '#40C4FF' : '#1976D2';

  return (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" intensity={250} />

      <ViroARPlaneSelector>
        {/* Şişe gövdesi */}
        <Viro3DObject
          source={require('../../assets/models/water_bottle.glb')}
          position={[0, 0, -0.5]}
          scale={[0.08, 0.08, 0.08]}
          type="GLB"
        />

        {/* Su dolumu göstergesi */}
        <Viro3DObject
          source={require('../../assets/models/water_fill.glb')}
          position={[0, fillScaleY - 0.2, -0.5]}
          scale={[0.075, fillScaleY, 0.075]}
          type="GLB"
          materials={[bottleColor]}
          animation={{name: 'waterFill', run: true}}
        />

        {/* Yüzde etiketi */}
        <ViroText
          text={`${Math.round(progress * 100)}%`}
          position={[0, 0.35, -0.5]}
          scale={[0.4, 0.4, 0.4]}
          style={{fontFamily: 'Arial', fontSize: 28, color: bottleColor, fontWeight: '700'}}
        />
        <ViroText
          text="Su Takibi"
          position={[0, 0.25, -0.5]}
          scale={[0.3, 0.3, 0.3]}
          style={{fontFamily: 'Arial', fontSize: 16, color: '#90A4AE'}}
        />
      </ViroARPlaneSelector>
    </ViroARScene>
  );
};

const WaterTrackerAR: React.FC<WaterTrackerARProps> = ({progress, onClose}) => {
  const pct = Math.round(progress * 100);
  const color = progress >= 1 ? '#00E676' : progress >= 0.5 ? '#40C4FF' : '#1976D2';

  // ── Expo Go: Mock ──────────────────────────────────────────────────────
  if (!viroReady) {
    return (
      <MockARView
        moduleTitle="Su Tüketimi Takibi"
        hint="Yüzeye dokun — su şişesi AR olarak yerleştirilir"
        onClose={onClose}>
        <View style={styles.mockBox}>
          <Text style={styles.mockBottle}>💧</Text>
          <Text style={[styles.mockPct, {color}]}>{pct}%</Text>
          <Text style={styles.mockLabel}>Su hedefin dolduruluyor</Text>
        </View>
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

const styles = StyleSheet.create({
  mockBox: {
    position: 'absolute',
    top: '35%',
    alignSelf: 'center',
    backgroundColor: 'rgba(13,27,42,0.82)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    minWidth: 180,
  },
  mockBottle: {fontSize: 48, marginBottom: 8},
  mockPct: {fontSize: 32, fontWeight: '700', marginBottom: 4},
  mockLabel: {fontSize: 12, color: '#90A4AE'},
  closeBtn: {},
  closeText: {},
  hintBox: {},
  hintText: {},
});

export default WaterTrackerAR;
