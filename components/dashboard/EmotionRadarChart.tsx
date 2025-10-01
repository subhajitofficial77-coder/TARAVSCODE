"use client";
import React, { useMemo } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

type PrimaryEmotions = Record<string, number>;

type Props = { emotions: PrimaryEmotions };

export default function EmotionRadarChart({ emotions }: Props) {
  const chartData = useMemo(() => {
    const keys = ['joy','trust','fear','surprise','sadness','disgust','anger','anticipation'];
    return keys.map(k => ({ emotion: k.charAt(0).toUpperCase() + k.slice(1), value: emotions?.[k] ?? 0, fullMark: 1 }));
  }, [emotions]);

  return (
    <div className="w-full flex justify-center items-center">
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={chartData}>
            <PolarGrid stroke="rgba(255,255,255,0.08)" />
            <PolarAngleAxis dataKey="emotion" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0,1]} tick={false} />
            <Radar name="Emotions" dataKey="value" stroke="#FFD700" fill="#FFD700" fillOpacity={0.3} strokeWidth={2} isAnimationActive animationDuration={800} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
