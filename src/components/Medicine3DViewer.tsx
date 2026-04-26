import React, {useRef, useEffect} from 'react';
import {Animated} from 'react-native';
import {Canvas, useFrame} from '@react-three/fiber/native';
import {Environment} from '@react-three/drei/native';
import * as THREE from 'three';

// ── 3D Model Bileşeni ───────────────────────────────────────────────────────
const MedicineModel = ({
  color,
  type,
}: {
  color: string;
  type: 'capsule' | 'tablet' | 'bottle';
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Sürekli yavaşça döndür
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  // Materyal: Parlak (Glossy) ve hafif transparan (gerçekçi görünüm için)
  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    roughness: 0.2,
    metalness: 0.1,
    clearcoat: 0.5,
    clearcoatRoughness: 0.1,
  });

  return (
    <mesh ref={meshRef}>
      {type === 'capsule' && <capsuleGeometry args={[0.6, 1.2, 32, 32]} />}
      {type === 'tablet' && <cylinderGeometry args={[0.8, 0.8, 0.3, 32]} />}
      {type === 'bottle' && (
        <group>
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 1.6, 32]} />
            <meshPhysicalMaterial color={new THREE.Color(color).multiplyScalar(0.5)} roughness={0.2} metalness={0.1} clearcoat={0.5} />
          </mesh>
          <mesh position={[0, 0.8, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.4, 32]} />
            <meshPhysicalMaterial color="white" roughness={0.1} clearcoat={0.5} />
          </mesh>
        </group>
      )}
      {type !== 'bottle' && <primitive object={material} attach="material" />}
    </mesh>
  );
};

// ── Ana Viewer Bileşeni ─────────────────────────────────────────────────────
interface Props {
  color: string;
  category: string;
}

export const Medicine3DViewer: React.FC<Props> = ({color, category}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  // Çıkış animasyonu (Bounce)
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
      delay: 100, // Sayfa açıldıktan biraz sonra
    }).start();
  }, [scaleAnim]);

  // İlaca göre tip belirle
  let type: 'capsule' | 'tablet' | 'bottle' = 'capsule';
  if (category.toLowerCase().includes('laksatif')) type = 'bottle';
  else if (category.toLowerCase().includes('diüretik')) type = 'tablet';
  else if (category.toLowerCase().includes('kortikosteroid')) type = 'tablet';

  return (
    <Animated.View style={{flex: 1, transform: [{scale: scaleAnim}]}}>
      <Canvas camera={{position: [0, 0, 4], fov: 45}}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, -5, 5]} intensity={0.5} />
        
        <MedicineModel color={color} type={type} />
        
        {/* React Native'de Environment bazen yavaş çalışabilir, şimdilik basit ışık yeterli */}
      </Canvas>
    </Animated.View>
  );
};
