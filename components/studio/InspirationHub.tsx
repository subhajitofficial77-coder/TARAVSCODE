import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useTaraStudio } from '@/lib/contexts/TaraStudioContext';
import { useEmotionalStyling } from '@/lib/hooks/useEmotionalStyling';
import { FancyButton } from '@/components/ui/FancyButton';
import AdvancedCarousel from '@/components/content/AdvancedCarousel';
import type { ContentGenerationRequest } from '@/types/content';
import type { ContentType, ContentPlatform } from '@/types/database';
import type { InspirationSeed, DailyQuota, MasterPlan } from '@/types/studio';
import { getEmotionalColor } from '@/lib/utils/emotionUtils';

export function InspirationHub() {
  const { context, refresh } = useTaraStudio();
  const { getEmotionalStyle } = useEmotionalStyling();
  const [selectedSeed, setSelectedSeed] = useState<InspirationSeed | null>(null);
  const [platform, setPlatform] = useState<ContentPlatform>('instagram');
  const [userNotes, setUserNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Colors for priority levels
  const priorityColors: Record<number, string> = {
    1: 'text-red-400 border-red-400/50',
    2: 'text-yellow-400 border-yellow-400/50',
    3: 'text-blue-400 border-blue-400/50'
  };
  
  const EmotionalBadges: React.FC<{ emotions: Record<string, number> }> = ({ emotions }) => (
    <div className="flex gap-1 flex-wrap">
      {Object.entries(emotions)
        .filter(([_, value]) => value > 0.5)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([emotion, value]) => {
          const color = getEmotionalColor(emotion);
          return (
            <span
              key={emotion}
              className={`px-2 py-0.5 text-xs rounded-full border ${color.textClass} ${color.borderClass} bg-black/30`}
              title={`${emotion}: ${(value * 100).toFixed(0)}%`}
            >
              {emotion}
            </span>
          );
        })}
    </div>
  );

  async function generateContent(seed: InspirationSeed) {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const endpoint = process.env.NEXT_PUBLIC_N8N_ENABLED === 'true'
        ? '/api/n8n/trigger-content'
        : '/api/generate-content';

      const payload = process.env.NEXT_PUBLIC_N8N_ENABLED === 'true'
        ? {
            seed_id: seed.id,
            platform,
            content_type: seed.type,
            seed_label: seed.label,
            seed_topic: seed.topic,
            user_prompt: userNotes
          }
        : {
            contentType: seed.type,
            platform,
            seedId: seed.id,
            seedLabel: seed.label,
            seedTopic: seed.topic,
            userPrompt: userNotes
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Content generated successfully!');
        refresh(); // Refresh context to update quotas
        setSelectedSeed(null);
        setUserNotes('');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Generation failed:', error);
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  const platformIcons: Record<ContentPlatform, string> = {
    instagram: '📷',
    twitter: '🐦',
    linkedin: '💼',
    facebook: '👍'
  };

  const typeEmoji: Record<ContentType, string> = {
    carousel: '🎠',
    story: '📖',
    post: '📝',
    caption: '💬',
    prompt: '🎯',
    exercise: '🏋️'
  };

  function isPlatform(key: string): key is ContentPlatform {
    return key === 'instagram' || key === 'twitter' || key === 'linkedin' || key === 'facebook';
  }

  function getTypeEmoji(type: string): string {
    return (typeEmoji as Record<string, string>)[type] || '�';
  }

  const seeds: InspirationSeed[] = (context?.master_plan as unknown as MasterPlan)?.inspiration_seeds || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-black/40 border border-white/10 space-y-4"
    >
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Inspiration Seeds</h2>
          <p className="text-gray-400">Select a seed and platform to generate content</p>
        </div>
      </div>

      <div className="flex justify-start gap-4 p-2">
        {Object.keys(platformIcons).map(key => {
          if (!isPlatform(key)) return null;
          return (
            <button
              key={key}
              onClick={() => setPlatform(key)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                platform === key
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {platformIcons[key]} {key}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {seeds.map(seed => (
          <motion.div
            key={seed.id}
            layout
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`p-4 rounded-xl border transition-colors ${
              selectedSeed?.id === seed.id
                ? 'bg-white/15 border-white/30'
                : 'bg-black/30 border-white/10 hover:bg-white/5'
            } ${priorityColors[seed.priority || 3]}`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getTypeEmoji(seed.type)}</span>
                <span className="font-medium">{seed.label}</span>
              </div>
              <span className="text-sm text-gray-400">Priority {seed.priority || 3}</span>
            </div>

            <p className="text-sm text-gray-300 mb-3">{seed.topic}</p>
            
            {seed.emotional_context && (
              <div className="mb-3">
                <EmotionalBadges emotions={seed.emotional_context} />
              </div>
            )}

            <div className="flex justify-between items-center">
              <button
                onClick={() => setSelectedSeed(selectedSeed?.id === seed.id ? null : seed)}
                className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                  selectedSeed?.id === seed.id
                    ? 'bg-white/20 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {selectedSeed?.id === seed.id ? 'Selected' : 'Select'}
              </button>

              <FancyButton
                onClick={() => generateContent(seed)}
                disabled={isGenerating}
                className="text-sm"
              >
                {isGenerating ? 'Generating...' : 'Generate Now'}
              </FancyButton>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedSeed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900 border-t border-white/10"
          >
            <div className="max-w-4xl mx-auto flex gap-4 items-center">
              <div className="flex-1">
                <input
                  type="text"
                  value={userNotes}
                  onChange={e => setUserNotes(e.target.value)}
                  placeholder="Add any specific requirements or context (optional)"
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2"
                />
              </div>
              
              <FancyButton
                onClick={() => generateContent(selectedSeed)}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate Content'}
              </FancyButton>

              <button
                onClick={() => setSelectedSeed(null)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}