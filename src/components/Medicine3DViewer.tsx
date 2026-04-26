import React, {useRef, useEffect, useMemo, Suspense} from 'react';
import {Animated, ActivityIndicator, View} from 'react-native';
import {Canvas} from '@react-three/fiber/native';
import {OrbitControls, useGLTF} from '@react-three/drei/native';
import * as THREE from 'three';

// Modelleri statik olarak require etmeliyiz ki Metro Bundler paketleyebilsin
// Yeşil kutulu model kullanılacak
const MODEL_FILES = [
  require('../../assets/models/medicine_box.glb'),
];

// ── Yüklenen .glb Modelini Render Eden Bileşen ──────────────────────────────
const LoadedModel = ({modelIndex, color}: {modelIndex: number; color: string}) => {
  const modelFile = MODEL_FILES[modelIndex % MODEL_FILES.length];
  
  // Modeli yükle
  const {scene} = useGLTF(modelFile as any);
  
  // Modelin orijinal boyutunu hesapla
  const {autoScale, center} = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const centerVec = box.getCenter(new THREE.Vector3());
    
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 5 / maxDim; // Ekrana sığacak ideal boyut (örn: 5 birim)
    
    return {autoScale: scale, center: centerVec};
  }, [scene]);

  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  return (
    // Dışarıdaki grup modeli küçültür (Scale)
    <group scale={autoScale}>
      {/* İçerideki obje kendini eksi merkez kadar kaydırır (Böylece tam orijine oturur) */}
      <primitive 
        object={clonedScene} 
        position={[-center.x, -center.y, -center.z]} 
      />
    </group>
  );
};

// ── Ana Viewer Bileşeni ─────────────────────────────────────────────────────
interface Props {
  color: string;
  category: string;
  medicineId: string; // Hangi ilaca hangi modelin geleceğini id'den rastgele(hash) seçeceğiz
}

export const Medicine3DViewer: React.FC<Props> = ({color, medicineId}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  // İlacın IDsine göre sabit bir rastgele model seç (böylece hep aynı ilaca aynı kutu gelir)
  const modelIndex = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < medicineId.length; i++) {
      hash = medicineId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % MODEL_FILES.length;
  }, [medicineId]);

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

  return (
    <Animated.View style={{flex: 1, transform: [{scale: scaleAnim}]}}>
      <Canvas camera={{position: [0, 0, 16], fov: 45}}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 10]} intensity={2} />
        <directionalLight position={[-10, -10, 10]} intensity={1} />
        
        {/* Etkileşimli Kamera Kontrolü: Parmağınla döndürebilirsin! */}
        <OrbitControls 
          enablePan={false} 
          enableZoom={true} 
          minDistance={5} 
          maxDistance={30}
          autoRotate={true}
          autoRotateSpeed={1.5}
        />

        {/* GLB Modelini Asenkron Yükleme */}
        <Suspense fallback={null}>
          <LoadedModel modelIndex={modelIndex} color={color} />
        </Suspense>
      </Canvas>
    </Animated.View>
  );
};
