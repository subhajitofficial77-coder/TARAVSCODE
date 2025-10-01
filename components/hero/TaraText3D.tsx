"use client";
import React, { Suspense, useRef, forwardRef, useImperativeHandle } from 'react';
import { Text3D, Center, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

type TaraText3DProps = {
  position?: [number, number, number];
  scale?: number;
};

const TaraText3D = forwardRef<any, TaraText3DProps>(function TaraText3D({ position = [0, 0, -8], scale = 1 }, ref) {
  const groupRef = useRef<any>(null);
  useImperativeHandle(ref, () => groupRef.current);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
      const s = 1 + Math.sin(t * 0.5) * 0.02;
      groupRef.current.scale.set(s * scale, s * scale, s * scale);
    }
  });

  return (
    <group ref={groupRef} position={position as any}>
      <ambientLight intensity={0.4} />
      <spotLight position={[10, 10, 5]} intensity={1.2} angle={0.3} penumbra={0.4} />
      <Suspense fallback={<Text fontSize={1} color="#ffffff">TARA</Text>}>
        <Center>
          {/* Use a public font JSON if available; fallback to <Text> via Suspense */}
          <Text3D font={'/fonts/Inter_Bold.json'} size={2} height={0.3} curveSegments={12} bevelEnabled bevelThickness={0.05} bevelSize={0.02} bevelSegments={5}>
            TARA
            <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} emissive="#4A90E2" emissiveIntensity={0.3} />
          </Text3D>
        </Center>
      </Suspense>
    </group>
  );
});

export default TaraText3D;
