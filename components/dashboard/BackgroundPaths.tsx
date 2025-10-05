"use client";

import React from 'react';
import { motion } from 'framer-motion';

function FloatingPaths({ position }: { position: number }) {
    // moderate path count and stronger opacities for improved visibility
    const paths = Array.from({ length: 14 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
            380 - i * 5 * position
        } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
            152 - i * 5 * position
        } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
            684 - i * 5 * position
        } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
        width: 0.4 + i * 0.04,
        baseOpacity: 0.06 + i * 0.02,
    }));

    return (
        <svg
            className="w-full h-full text-white mix-blend-screen"
            viewBox="0 0 1400 900"
            preserveAspectRatio="xMinYMin meet"
            fill="none"
            aria-hidden
        >
            <title>Background Paths</title>
            {paths.map((path) => (
                <motion.path
                    key={path.id}
                    d={path.d}
                    stroke="currentColor"
                    strokeWidth={path.width}
                    // increased opacity for visibility
                    strokeOpacity={Math.min(0.4, path.baseOpacity + 0.08)}
                    initial={{ pathLength: 0.2, opacity: 0.22 }}
                    animate={{
                        pathLength: 1,
                        opacity: [0.18, Math.min(0.4, path.baseOpacity + 0.08), 0.18],
                        pathOffset: [0, 1, 0],
                    }}
                    transition={{
                        // faster durations (between ~18 and 25s) for more visible motion
                        duration: 18 + Math.random() * 7,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                    }}
                />
            ))}
        </svg>
    );
}

export default function BackgroundPaths() {
    // wrapper positions the animation to start from top-left and scale toward center
    return (
        <div className="absolute inset-0 z-0 pointer-events-none hidden md:block">
            {/* primary layer anchored top-left and scaled to cover upper-left/center */}
            <div className="absolute left-0 top-0 w-[120%] h-[85%] transform -translate-x-12 -translate-y-6 pointer-events-none opacity-100">
                <div className="w-full h-full overflow-hidden">
                    <div className="absolute inset-0 opacity-100">
                        <FloatingPaths position={1} />
                    </div>
                </div>
            </div>

            {/* subtle mirrored layer for depth, slightly offset and slower (opacity reduced) */}
            <div className="absolute left-0 top-0 w-[110%] h-[80%] transform -translate-x-6 -translate-y-2 pointer-events-none opacity-75">
                <div className="w-full h-full overflow-hidden">
                    <div className="absolute inset-0">
                        <FloatingPaths position={-1} />
                    </div>
                </div>
            </div>
        </div>
    );
}
