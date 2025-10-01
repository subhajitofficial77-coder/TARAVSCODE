"use client";
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ShaderAnimation() {
  const ref = useRef<HTMLDivElement | null>(null);
  const state = useRef<any>({});

  useEffect(() => {
    if (!ref.current) return;
    const container = ref.current;

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    camera.position.z = 1;

    const geometry = new THREE.PlaneGeometry(2, 2);
    const uniforms = {
      time: { value: 0 },
      resolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) }
    } as any;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `void main(){ gl_Position = vec4(position, 1.0); }`,
      fragmentShader: `precision mediump float; uniform float time; uniform vec2 resolution; void main(){ vec2 uv = gl_FragCoord.xy / resolution.xy; float v = 0.5 + 0.5 * sin(time + uv.x * 10.0); gl_FragColor = vec4(vec3(0.02, 0.15, 0.25) + v * vec3(0.2,0.6,0.8), 1.0); }`
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    container.appendChild(renderer.domElement);

    let raf = 0;
    function onResize() {
      renderer.setSize(container.clientWidth, container.clientHeight);
      uniforms.resolution.value.set(container.clientWidth, container.clientHeight);
    }

    function animate() {
      uniforms.time.value += 0.02;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    }

    window.addEventListener('resize', onResize);
    animate();

    state.current = { scene, camera, renderer, material, animate, raf };

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(state.current.raf);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={ref} className="w-full h-screen" style={{ background: '#000', overflow: 'hidden', position: 'fixed', inset: 0, zIndex: 0 }} />;
}
