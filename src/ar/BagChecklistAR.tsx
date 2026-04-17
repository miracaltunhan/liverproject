import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import MockARView from './MockARView';

let ViroARScene: any = null;
let ViroARSceneNavigator: any = null;
let ViroAmbientLight: any = null;
let ViroARPlaneSelector: any = null;
let ViroText: any = null;
let ViroBox: any = null;
let ViroNode: any = null;
let ViroSpotLight: any = null;
let viroReady = false;

try {
  const V = require('@viro-community/react-viro');
  ViroARScene = V.ViroARScene;
  ViroARSceneNavigator = V.ViroARSceneNavigator;
  ViroAmbientLight = V.ViroAmbientLight;
  ViroARPlaneSelector = V.ViroARPlaneSelector;
  ViroText = V.ViroText;
  ViroBox = V.ViroBox;
  ViroNode = V.ViroNode;
  ViroSpotLight = V.ViroSpotLight;
  viroReady = true;
} catch {
  // Expo Go
}
import {Colors, Typography, Spacing, Radius} from '../theme';
import {BagItem} from '../store/PatientContext';

interface BagChecklistARProps {
  items: BagItem[];
  onClose: () => void;
}

const BagChecklistScene: React.FC<{
  arSceneNavigator: {viroAppProps: {items: BagItem[]}};
}> = ({arSceneNavigator}) => {
  const {items} = arSceneNavigator.viroAppProps;

  return (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" intensity={200} />
      <ViroSpotLight
        innerAngle={5}
        outerAngle={50}
        direction={[0, -1, -0.2]}
        position={[0, 3, 1]}
        color="#ffffff"
        castsShadow
      />

      <ViroARPlaneSelector>
        {/* Çanta başlığı */}
        <ViroText
          text="🧳 Hastane Çantası"
          position={[0, 0.6, -0.5]}
          scale={[0.4, 0.4, 0.4]}
          style={{
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#FB8C00',
            fontWeight: '700',
          }}
        />

        {/* Eşya listesi — holografik dikey liste */}
        {items.map((item, index) => {
          const posY = 0.5 - index * 0.1;
          const color = item.packed ? '#00E676' : item.critical ? '#FF1744' : '#90A4AE';

          return (
            <ViroNode key={item.id} position={[0, posY, -0.5]}>
              {/* Durum kutusu */}
              <ViroBox
                position={[-0.35, 0, 0]}
                scale={[0.03, 0.03, 0.01]}
                materials={[color]}
              />
              <ViroText
                text={`${item.packed ? '✓' : item.critical ? '!' : '○'} ${item.label}`}
                position={[0, 0, 0]}
                scale={[0.25, 0.25, 0.25]}
                style={{
                  fontFamily: 'Arial',
                  fontSize: 14,
                  color,
                  fontWeight: item.critical && !item.packed ? '700' : '400',
                }}
              />
            </ViroNode>
          );
        })}
      </ViroARPlaneSelector>
    </ViroARScene>
  );
};

const BagChecklistAR: React.FC<BagChecklistARProps> = ({items, onClose}) => {
  if (!viroReady) {
    const packed = items.filter(i => i.packed).length;
    return (
      <MockARView
        moduleTitle="Hastane Çantası"
        hint="Yüzüye dokun — holografik çanta listesi görünür"
        onClose={onClose}>
        <View style={styles.mockBox}>
          <Text style={styles.mockTitle}>🧺 Paketleme Durumu</Text>
          <Text style={styles.mockProgress}>
            {packed} / {items.length} eşya hazır
          </Text>
          <View style={styles.mockBar}>
            <View
              style={[
                styles.mockFill,
                // eslint-disable-next-line react-native/no-inline-styles
                {width: `${items.length ? (packed / items.length) * 100 : 0}%`},
              ]}
            />
          </View>
        </View>
      </MockARView>
    );
  }
  return (
    <ViroARSceneNavigator
      autofocus
      initialScene={{scene: BagChecklistScene}}
      viroAppProps={{items}}
      style={StyleSheet.absoluteFill}
    />
  );
};

const styles = StyleSheet.create({
  mockBox: {
    position: 'absolute',
    top: '38%',
    alignSelf: 'center',
    backgroundColor: 'rgba(13,27,42,0.82)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    minWidth: 220,
  },
  mockTitle: {fontSize: 16, fontWeight: '600', color: '#F0F4F8', marginBottom: 10},
  mockProgress: {fontSize: 22, fontWeight: '700', color: '#4FC3F7', marginBottom: 8},
  mockBar: {
    width: 160,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  mockFill: {height: 6, borderRadius: 3, backgroundColor: '#00E676'},
});

export default BagChecklistAR;
