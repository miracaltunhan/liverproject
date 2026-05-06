import React, {useRef, useEffect, useMemo, Suspense} from 'react';
import {Animated, ActivityIndicator, View} from 'react-native';
import {Canvas} from '@react-three/fiber/native';
import {OrbitControls, useGLTF} from '@react-three/drei/native';
import * as THREE from 'three';

// Modelleri statik olarak require etmeliyiz ki Metro Bundler paketleyebilsin
const MODEL_ASSETS: Record<string, any> = {
  medicine_box: require('../../assets/models/medicine_box.glb'),
  tansiyon_aleti: require('../../assets/models/Stethoscope.glb'),
  goz_bandi: require('../../assets/models/Oculus controller left.glb'),
  pecete: require('../../assets/models/Tissue Box.glb'),
  sarj_kablosu: require('../../assets/models/Power chord.glb'),
  su: require('../../assets/models/water_bottle.glb'),
};

// ── Yüklenen .glb Modelini Render Eden Bileşen ──────────────────────────────
const LoadedModel = ({modelFile, color}: {modelFile: any; color: string}) => {
  // Modeli yükle
  const {scene} = useGLTF(modelFile as any);
  
  // Modelin orijinal boyutunu hesapla
  const {autoScale, center} = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const centerVec = box.getCenter(new THREE.Vector3());
    
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 8 / maxDim; // Daha büyük 3D görüntü
    
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

  const modelFile = useMemo(() => {
    return MODEL_ASSETS[medicineId] ?? MODEL_ASSETS.medicine_box;
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
          <LoadedModel modelFile={modelFile} color={color} />
        </Suspense>
      </Canvas>
    </Animated.View>
  );
};
