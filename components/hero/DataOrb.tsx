"use client";
import React, { useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

type DataOrbProps = {
  position?: [number, number, number];
  scale?: number;
  debug?: boolean;
};

const DataOrb = forwardRef<THREE.Mesh | null, DataOrbProps>(function DataOrb({ position = [0, 0, 0], scale = 1, debug = false }, ref) {
  const meshRef = useRef<THREE.Mesh | null>(null);
  useImperativeHandle(ref, () => meshRef.current as THREE.Mesh);

  const { camera } = useThree();

  // LOD geometries (high, med, low)
  const [geoHigh, geoMed, geoLow] = useMemo(() => [
    new THREE.IcosahedronGeometry(1, 3),
    new THREE.IcosahedronGeometry(1, 2),
    new THREE.IcosahedronGeometry(1, 1),
  ], []);

  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: new THREE.Color(0x4ae0ff), metalness: 0.6, roughness: 0.2, emissive: new THREE.Color(0x4a90e2), emissiveIntensity: 0.3 }),
    []
  );

  const frameCount = useRef(0);
  const lastLog = useRef(0);

  useFrame((state) => {
    frameCount.current++;
    // throttle: only run every 2 frames
    if (frameCount.current % 2 !== 0) return;

    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
      meshRef.current.rotation.x += 0.001;
      meshRef.current.position.y = Math.sin(t * 0.5) * 0.1;
      // subtle scale pulse
      const s = 1 + Math.sin(t * 0.8) * 0.02;
      meshRef.current.scale.set(s * scale, s * scale, s * scale);

      // LOD: simple distance-based swap
      const dist = camera.position.distanceTo(meshRef.current.position);
      const lod = dist < 4 ? geoHigh : dist < 8 ? geoMed : geoLow;
      // @ts-ignore - assign geometry directly
      meshRef.current.geometry = lod;
      meshRef.current.frustumCulled = true;
    }

    if (debug && state.clock.elapsedTime - lastLog.current > 2) {
      const fps = 1 / state.clock.getDelta();
      lastLog.current = state.clock.elapsedTime;
      if (fps < 50) console.warn('[DataOrb] FPS low', fps.toFixed(1));
    }
  });

  return (
    <group position={position as any}>
      <mesh ref={meshRef} geometry={geoMed} material={mat} castShadow receiveShadow />
      <pointLight color={0x4ae0ff} intensity={1.5} distance={6} />
    </group>
  );
});

export default DataOrb;
