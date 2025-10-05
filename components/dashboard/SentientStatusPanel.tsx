"use client";
import React from 'react';
import EmotionalGlow from './EmotionalGlow';
import EmotionRadarChart from './EmotionRadarChart';
import LifeEventCard from './LifeEventCard';
import RelationshipGraph from './RelationshipGraph';
import SimulationProposalPanel from './SimulationProposalPanel';
import MoodAcceptanceControls from './MoodAcceptanceControls';

type PrimaryEmotions = any;

type EmotionalState = any;

type Relationship = any;

type Props = {
  emotionalState: EmotionalState | null;
  relationships: Relationship[];
};

export default function SentientStatusPanel({ emotionalState, relationships }: Props) {
  return (
    <div className="glass rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Sentient Status</h2>
          <p className="text-sm text-white/60">Real-time Consciousness Metrics</p>
        </div>
      </div>

      <EmotionalGlow emotionalState={emotionalState} />

      <div className="w-full">
        <EmotionRadarChart emotions={emotionalState?.primary_emotions || {}} />
      </div>

      {/* Mood indicator bars */}
      <div className="space-y-3">
        {(() => {
          const optimism = Math.round((emotionalState?.mood?.optimism ?? 0) * 100);
          const energy = Math.round((emotionalState?.mood?.energy_level ?? 0) * 100);
          const stress = Math.round((emotionalState?.mood?.stress_level ?? 0) * 100);
          return (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white/70">Optimism</span>
                  <span className="text-sm text-white/70">{optimism}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 transition-all duration-500" style={{ width: `${optimism}%` }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white/70">Energy</span>
                  <span className="text-sm text-white/70">{energy}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-green-400 transition-all duration-500" style={{ width: `${energy}%` }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white/70">Stress</span>
                  <span className="text-sm text-white/70">{stress}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 transition-all duration-500" style={{ width: `${stress}%` }} />
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      <div className="space-y-4">
        <LifeEventCard event={emotionalState?.last_event || null} timestamp={emotionalState?.last_event_timestamp || null} />
        <MoodAcceptanceControls />
      </div>

      <RelationshipGraph relationships={relationships} />
      <div className="mt-4">
        <SimulationProposalPanel />
      </div>
    </div>
  );
}
