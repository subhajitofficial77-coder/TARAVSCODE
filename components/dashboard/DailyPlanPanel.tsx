"use client";
import React from 'react';
import { Image, Video, FileText } from 'lucide-react';

const mockPlan = {
  mood: 'Nostalgic & Heartfelt',
  theme: 'Family and Tradition',
  contentQuota: [
    { type: 'carousel', topic: 'Mother-daughter relationships', status: 'pending' },
    { type: 'story', topic: 'Family traditions poll', status: 'pending' },
    { type: 'caption', topic: 'Childhood memories', status: 'pending' }
  ],
  generatedAt: new Date().toISOString()
};

export default function DailyPlanPanel() {
  return (
    <div className="glass rounded-2xl p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Daily Plan</h2>
        <p className="text-sm text-white/60">Today's Creative Strategy</p>
      </div>

      <div className="bg-gradient-to-r from-yellow-400/10 to-green-400/10 rounded-xl p-4 border border-white/10">
        <p className="text-sm text-white/60 uppercase tracking-wide">Today's Mood</p>
        <p className="text-2xl font-bold text-white mt-1">{mockPlan.mood}</p>
        <p className="text-sm text-white/70 mt-2">Theme: {mockPlan.theme}</p>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-white">Content Strategy</h3>
          <span className="text-xs text-white/50">{mockPlan.contentQuota.length} pieces planned</span>
        </div>

        <div className="space-y-3 mt-4">
          {mockPlan.contentQuota.map((item, idx) => (
            <div key={idx} className="glass rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-400/20 flex items-center justify-center">
                  {item.type === 'carousel' ? <Image className="w-4 h-4 text-yellow-400" /> : item.type === 'story' ? <Video className="w-4 h-4 text-yellow-400" /> : <FileText className="w-4 h-4 text-yellow-400" />}
                </div>
                <div>
                  <p className="text-white font-medium capitalize">{item.type}</p>
                  <p className="text-sm text-white/60">{item.topic}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs bg-white/10 text-white/70">Pending</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-white/40 text-center mt-4">Currently showing mock data — AI-generated plans coming in Phase 5</p>
    </div>
  );
}
