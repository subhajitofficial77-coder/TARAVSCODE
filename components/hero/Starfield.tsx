"use client";
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Stars } from '@react-three/drei';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';

type StarfieldProps = {
  count?: number;
  radius?: number;
};

export default function Starfield({ count = 1000, radius = 50 }: StarfieldProps) {
  const ref = useRef<any>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const effectiveCount = isMobile ? Math.max(500, Math.floor(count / 2)) : count;

  const frameCount = useRef(0);
  useFrame(() => {
    frameCount.current++;
    if (frameCount.current % 3 !== 0) return; // update every 3rd frame
    if (ref.current) ref.current.rotation.y += 0.0002;
  });

  // Drei's Stars is performant; we pick a lower count on mobile
  return <Stars ref={ref} radius={radius} depth={radius} count={effectiveCount} factor={4} saturation={0.0} fade speed={0.2} />;
}
