import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import MockARView from './MockARView';
import {Colors, Typography, Spacing, Radius} from '../theme';

// ── Runtime ViroReact yükleme (Expo Go'da çalışmaz, try-catch ile korunur) ──
let ViroARSceneNavigator: any = null;
let ViroARScene: any = null;
let Viro3DObject: any = null;
let ViroAmbientLight: any = null;
let ViroARImageMarker: any = null;
let ViroARTrackingTargets: any = null;
let ViroText: any = null;
let ViroMaterials: any = null;
let viroReady = false;

try {
  const V = require('@viro-community/react-viro');
  ViroARSceneNavigator = V.ViroARSceneNavigator;
  ViroARScene = V.ViroARScene;
  Viro3DObject = V.Viro3DObject;
  ViroAmbientLight = V.ViroAmbientLight;
  ViroARImageMarker = V.ViroARImageMarker;
  ViroARTrackingTargets = V.ViroARTrackingTargets;
  ViroText = V.ViroText;
  ViroMaterials = V.ViroMaterials;

  ViroARTrackingTargets.createTargets({
    medicineBox: {
      source: require('../../assets/markers/medicine_marker.jpg'),
      orientation: 'Up',
      physicalWidth: 0.1,
    },
  });
  ViroMaterials.createMaterials({
    arInfoPanel: {diffuseColor: 'rgba(25, 118, 210, 0.85)'},
  });
  viroReady = true;
} catch {
  // Expo Go — ViroReact native modülleri mevcut değil
}

interface MedicineARProps {
  onMedicineDetected: (name: string) => void;
  onClose: () => void;
}

const MedicineScene: React.FC<any> = ({arSceneNavigator}) => {
  const {onDetected} = arSceneNavigator.viroAppProps;
  return (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" intensity={200} />
      <ViroARImageMarker
        target="medicineBox"
        onAnchorFound={() => onDetected('Tespit Edilen İlaç')}>
        <Viro3DObject
          source={require('../../assets/models/medicine_panel.glb')}
          position={[0, 0.1, 0]}
          scale={[0.05, 0.05, 0.05]}
          type="GLB"
          animation={{name: 'rotate', run: true, loop: true}}
        />
        <ViroText
          text="İlaç Bilgisi"
          scale={[0.5, 0.5, 0.5]}
          position={[0, 0.25, 0]}
          style={{fontFamily: 'Arial', fontSize: 20, color: '#40C4FF'}}
        />
      </ViroARImageMarker>
    </ViroARScene>
  );
};

const MedicineAR: React.FC<MedicineARProps> = ({onMedicineDetected, onClose}) => {
  // ── Expo Go: Mock AR ────────────────────────────────────────────────────
  if (!viroReady) {
    return (
      <MockARView
        moduleTitle="İlaç Kutusu Rehberi"
        hint="İlaç kutusunu kameraya göster"
        onClose={onClose}>
        {/* Mock: ilaç marker simülasyonu */}
        <View style={styles.mockInfoBox}>
          <Text style={styles.mockIcon}>💊</Text>
          <Text style={styles.mockLabel}>Gerçek cihazda ilaç kutusu marker'ı tanınır</Text>
          <Text style={styles.mockSub}>AR animasyonu + doz bilgisi gösterilir</Text>
        </View>
      </MockARView>
    );
  }

  // ── Gerçek ViroReact AR ─────────────────────────────────────────────────
  return (
    <ViroARSceneNavigator
      autofocus
      initialScene={{scene: MedicineScene}}
      viroAppProps={{onDetected: onMedicineDetected}}
      style={StyleSheet.absoluteFill}
    />
  );
};

const styles = StyleSheet.create({
  mockInfoBox: {
    position: 'absolute',
    top: '38%',
    left: Spacing.xl,
    right: Spacing.xl,
    backgroundColor: 'rgba(13,27,42,0.82)',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  mockIcon: {fontSize: 36, marginBottom: Spacing.sm},
  mockLabel: {
    ...Typography.headingSmall,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  mockSub: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default MedicineAR;
