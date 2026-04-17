import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import MockARView from './MockARView';

let ViroARScene: any = null;
let ViroARSceneNavigator: any = null;
let Viro3DObject: any = null;
let ViroAmbientLight: any = null;
let ViroARPlaneSelector: any = null;
let ViroText: any = null;
let ViroNode: any = null;
let viroReady = false;

try {
  const V = require('@viro-community/react-viro');
  ViroARScene = V.ViroARScene;
  ViroARSceneNavigator = V.ViroARSceneNavigator;
  Viro3DObject = V.Viro3DObject;
  ViroAmbientLight = V.ViroAmbientLight;
  ViroARPlaneSelector = V.ViroARPlaneSelector;
  ViroText = V.ViroText;
  ViroNode = V.ViroNode;
  viroReady = true;
} catch {
  // Expo Go
}

type FoodItem = {
  id: string;
  name: string;
  allowed: boolean;
  reason: string;
};

interface NutritionARProps {
  foods: FoodItem[];
  onClose: () => void;
}

// Yiyecekleri masaya sıralı grid olarak yerleştir
const GRID_COLS = 3;
const SPACING_X = 0.18;
const SPACING_Z = 0.18;

const NutritionScene: React.FC<{
  arSceneNavigator: {viroAppProps: {foods: FoodItem[]}};
}> = ({arSceneNavigator}) => {
  const {foods} = arSceneNavigator.viroAppProps;

  return (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" intensity={300} />

      <ViroARPlaneSelector>
        {foods.slice(0, 9).map((food, index) => {
          const col = index % GRID_COLS;
          const row = Math.floor(index / GRID_COLS);
          const posX = (col - 1) * SPACING_X;
          const posZ = -0.4 - row * SPACING_Z;
          const color = food.allowed ? '#00E676' : '#FF1744';

          return (
            <ViroNode key={food.id} position={[posX, 0, posZ]}>
              {/* 3D yiyecek modeli */}
              <Viro3DObject
                source={require('../../assets/models/food_placeholder.glb')}
                scale={[0.04, 0.04, 0.04]}
                position={[0, 0.05, 0]}
                type="GLB"
              />
              {/* Renk halkası */}
              <Viro3DObject
                source={require('../../assets/models/ring.glb')}
                scale={[0.05, 0.005, 0.05]}
                position={[0, 0.01, 0]}
                type="GLB"
                materials={[color]}
              />
              {/* İsim etiketi */}
              <ViroText
                text={food.name}
                position={[0, 0.16, 0]}
                scale={[0.25, 0.25, 0.25]}
                style={{
                  fontFamily: 'Arial',
                  fontSize: 14,
                  color,
                  fontWeight: '600',
                }}
              />
              {/* İzinli/Yasak */}
              <ViroText
                text={food.allowed ? '✓ İzinli' : '✕ Yasak'}
                position={[0, 0.12, 0]}
                scale={[0.2, 0.2, 0.2]}
                style={{fontFamily: 'Arial', fontSize: 11, color}}
              />
            </ViroNode>
          );
        })}
      </ViroARPlaneSelector>
    </ViroARScene>
  );
};

const NutritionAR: React.FC<NutritionARProps> = ({foods, onClose}) => {
  if (!viroReady) {
    const allowed = foods.filter(f => f.allowed).length;
    const forbidden = foods.length - allowed;
    return (
      <MockARView
        moduleTitle="Beslenme Rehberi"
        hint="Masaya dokun — 3D yiyecekler yerleştirilir"
        onClose={onClose}>
        <View style={styles.mockBox}>
          <Text style={styles.mockTitle}>🥗 3D Besin Haritası</Text>
          <View style={styles.mockRow}>
            <View style={styles.mockChip}>
              <Text style={styles.mockChipGreen}>✓ İzinli: {allowed}</Text>
            </View>
            <View style={styles.mockChip}>
              <Text style={styles.mockChipRed}>✕ Yasak: {forbidden}</Text>
            </View>
          </View>
        </View>
      </MockARView>
    );
  }
  return (
    <ViroARSceneNavigator
      autofocus
      initialScene={{scene: NutritionScene}}
      viroAppProps={{foods}}
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
    minWidth: 200,
  },
  mockTitle: {fontSize: 16, fontWeight: '600', color: '#F0F4F8', marginBottom: 12},
  mockRow: {flexDirection: 'row', gap: 8},
  mockChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  mockChipGreen: {fontSize: 12, color: '#00E676', fontWeight: '700'},
  mockChipRed: {fontSize: 12, color: '#FF1744', fontWeight: '700'},
});

export default NutritionAR;
