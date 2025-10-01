"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Suspense } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Starfield from './Starfield';
import DataOrb from './DataOrb';
import TaraText3D from './TaraText3D';
import { PerformanceMonitor } from '@react-three/drei';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';

gsap.registerPlugin(ScrollTrigger);

export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const orbRef = useRef<any>(null);
  const textRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const [dpr, setDpr] = useState<number>(1.5);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // small component to capture camera reference from R3F
  function CameraCapture() {
    const { camera } = useThree();
    cameraRef.current = camera;
    return null;
  }

  useEffect(() => {
    if (!containerRef.current) return;
    const triggerEl = containerRef.current;
    // Use a GSAP context scoped to this container so we only clean up what this
    // component created (avoids killing ScrollTriggers created elsewhere).
    const ctx = gsap.context(() => {
      const st = ScrollTrigger.create({
        trigger: triggerEl,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        onUpdate: (self) => {
          const p = self.progress; // 0..1
          // Dolly camera from z=10 to z=2
          if (cameraRef.current) {
            cameraRef.current.position.z = 10 - p * 8;
            cameraRef.current.updateProjectionMatrix && cameraRef.current.updateProjectionMatrix();
          }
          // Parallax orb and text
          if (orbRef.current) {
            orbRef.current.position.x = (p - 0.5) * 4; // move left/right
            orbRef.current.position.y = Math.sin(p * Math.PI * 2) * 0.5; // subtle vertical parallax
          }
          if (textRef.current) {
            textRef.current.rotation.y = p * Math.PI * 0.5; // rotate text
            textRef.current.position.z = -8 + p * 2; // pull text slightly forward
          }
        }
      });

      // keep a reference in the context in case we need it later
      // (ctx.revert() below will remove this ScrollTrigger)
      return () => {
        try {
          st && st.kill && st.kill();
        } catch (e) {
          // ignore
        }
      };
    }, triggerEl);

    return () => {
      // Revert the GSAP context which will undo any tweens/ScrollTriggers created
      // inside it. This avoids indiscriminately killing ScrollTriggers created by
      // other parts of the app.
      try {
        ctx.revert();
      } catch (e) {
        // Fallback: nothing
      }
    };
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
      <Canvas camera={{ position: [0, 0, 10], fov: isMobile ? 85 : 75 }} dpr={dpr} gl={{ antialias: true, alpha: true }} style={{ position: 'absolute', inset: 0 }}>
        <CameraCapture />
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(2)}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.3} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <Starfield />
            <DataOrb ref={orbRef} />
            <TaraText3D ref={textRef} />
          </Suspense>
        </PerformanceMonitor>
      </Canvas>
    </div>
  );
}
