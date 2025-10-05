"use client";
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// local className join helper
const join = (...parts: Array<string | undefined | false>) => parts.filter(Boolean).join(' ');
import { useTaraStudio } from '@/lib/contexts/TaraStudioContext';
import { useEmotionalStyling } from '@/lib/hooks/useEmotionalStyling';
import { EMOTION_COLORS } from '@/utils/emotionalColors';

interface Props {
  className?: string;
  mode?: 'gradient' | 'particle';
}

export default function DottedSurface({ className, mode = 'particle' }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const { context } = useTaraStudio();
  const { dominantEmotion, intensity } = useEmotionalStyling();

  useEffect(() => {
    if (mode !== 'particle') return;
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.0006);

    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 10000);
    camera.position.set(0, 355, 1220);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.zIndex = '-10';
    renderer.domElement.style.pointerEvents = 'none';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const AMOUNTX = 40;
    const AMOUNTY = 60;
    const SEPARATION = 150;
    const num = AMOUNTX * AMOUNTY;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(num * 3);
    const colors = new Float32Array(num * 3);

    const primaryHex = EMOTION_COLORS[dominantEmotion as keyof typeof EMOTION_COLORS] ?? '#ffffff';
    const secondaryHex = EMOTION_COLORS['trust'] ?? '#888888';

    const primary = new THREE.Color(primaryHex);
    const secondary = new THREE.Color(secondaryHex);

    let i = 0;
    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
        const y = 0;
        const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        // mix primary and secondary colors for subtle variation
        const t = (ix / AMOUNTX + iy / AMOUNTY) * 0.5;
        const col = primary.clone().lerp(secondary, t);
        colors[i * 3] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;

        i++;
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({ size: 6, vertexColors: true, depthTest: true, opacity: 0.95, transparent: true });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let count = 0;

    const animate = () => {
      const amp = Number(getComputedStyle(document.documentElement).getPropertyValue('--studio-wave-amplitude')) || 50;
      const energy = context?.emotional_state?.mood?.energy_level ?? 0.5;
      count += 0.05 + energy * 0.12;

      const pos = geometry.getAttribute('position') as THREE.BufferAttribute;
      let idx = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          const i3 = idx * 3;
          const ox = positions[i3];
          const oz = positions[i3 + 2];
          const y = Math.sin((ix + count) * 0.3) * (amp * (0.5 + intensity)) + Math.sin((iy + count) * 0.5) * (amp * (0.25 + intensity * 0.5));
          pos.array[i3 + 1] = y;
          idx++;
        }
      }
      pos.needsUpdate = true;

      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [dominantEmotion, intensity, mode, context]);

  return <div ref={containerRef} className={join('pointer-events-none fixed inset-0 -z-10', className)} />;
}
