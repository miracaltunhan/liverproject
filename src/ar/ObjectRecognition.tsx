import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import MockARView from './MockARView';

let ViroARScene: any = null;
let ViroARSceneNavigator: any = null;
let ViroAmbientLight: any = null;
let ViroARObjectMarker: any = null;
let ViroARTrackingTargets: any = null;
let ViroText: any = null;
let ViroBox: any = null;
let viroReady = false;

try {
  const V = require('@viro-community/react-viro');
  ViroARScene = V.ViroARScene;
  ViroARSceneNavigator = V.ViroARSceneNavigator;
  ViroAmbientLight = V.ViroAmbientLight;
  ViroARObjectMarker = V.ViroARObjectMarker;
  ViroARTrackingTargets = V.ViroARTrackingTargets;
  ViroText = V.ViroText;
  ViroBox = V.ViroBox;
  ViroARTrackingTargets?.createTargets?.({
    phoneCharger: {
      source: require('../../assets/markers/charger_marker.jpg'),
      orientation: 'Up',
      physicalWidth: 0.05,
    },
    foodContainer: {
      source: require('../../assets/markers/food_container_marker.jpg'),
      orientation: 'Up',
      physicalWidth: 0.12,
    },
  });
  viroReady = true;
} catch {
  // Expo Go
}

type DetectedObject = {
  label: string;
  confidence: number;
  safe: boolean;
  message: string;
};

interface ObjectRecognitionARProps {
  onDetected: (obj: DetectedObject) => void;
  onClose: () => void;
}

const SAFE_OBJECTS = new Set(['id_card', 'water_bottle', 'socks', 'book']);

const ObjectScene: React.FC<{
  arSceneNavigator: {viroAppProps: {onDetected: (obj: DetectedObject) => void}};
}> = ({arSceneNavigator}) => {
  const {onDetected} = arSceneNavigator.viroAppProps;

  const handleFound = (label: string, safe: boolean, message: string) => {
    onDetected({
      label,
      confidence: 0.87 + Math.random() * 0.12, // simüle; gerçekte ML çıktısı
      safe,
      message,
    });
  };

  return (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" intensity={200} />

      <ViroARObjectMarker
        target="phoneCharger"
        onAnchorFound={() =>
          handleFound(
            'Telefon Şarjı',
            false,
            'Hastane çantasına taşıyabilirsin',
          )
        }>
        <ViroBox
          position={[0, 0.05, 0]}
          scale={[0.06, 0.06, 0.06]}
          materials={['#FF1744']}
        />
        <ViroText
          text="⚠ Kontrol et"
          position={[0, 0.12, 0]}
          scale={[0.2, 0.2, 0.2]}
          style={{fontFamily: 'Arial', fontSize: 14, color: '#FF1744'}}
        />
      </ViroARObjectMarker>

      <ViroARObjectMarker
        target="foodContainer"
        onAnchorFound={() =>
          handleFound(
            'Yiyecek Kabı',
            false,
            'Ameliyat öncesi gece yarısından sonra yemek yasak',
          )
        }>
        <ViroBox
          position={[0, 0.05, 0]}
          scale={[0.1, 0.06, 0.1]}
          materials={['#FF1744']}
        />
        <ViroText
          text="✕ Yasak"
          position={[0, 0.15, 0]}
          scale={[0.2, 0.2, 0.2]}
          style={{fontFamily: 'Arial', fontSize: 14, color: '#FF1744'}}
        />
      </ViroARObjectMarker>
    </ViroARScene>
  );
};

const ObjectRecognitionAR: React.FC<ObjectRecognitionARProps> = ({
  onDetected,
  onClose,
}) => {
  if (!viroReady) {
    return (
      <MockARView
        moduleTitle="Nesne Tarama"
        hint="Kamerayı bir nesneye yönelt — ML modeli tanır"
        onClose={onClose}>
        <View style={styles.mockBox}>
          <View style={styles.mockFrameRing}>
            <Text style={styles.mockFrameIcon}>🔍</Text>
          </View>
          <Text style={styles.mockLabel}>ML Tanıma Hazır</Text>
          <Text style={styles.mockSub}>Nesneyi çerçeveye al, analiz başlar</Text>
        </View>
      </MockARView>
    );
  }
  return (
    <ViroARSceneNavigator
      autofocus
      initialScene={{scene: ObjectScene}}
      viroAppProps={{onDetected}}
      style={StyleSheet.absoluteFill}
    />
  );
};

const styles = StyleSheet.create({
  mockBox: {
    position: 'absolute',
    top: '35%',
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(13,27,42,0.82)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    minWidth: 200,
  },
  mockFrameRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#4FC3F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  mockFrameIcon: {fontSize: 36},
  mockLabel: {fontSize: 14, fontWeight: '600', color: '#F0F4F8', marginBottom: 4},
  mockSub: {fontSize: 12, color: '#90A4AE', textAlign: 'center'},
});

export default ObjectRecognitionAR;
