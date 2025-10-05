'use client';

import React, { useState } from 'react';
import { useTaraStudio } from '@/lib/contexts/TaraStudioContext';
import { generateSocialContent, publishContent } from '@/lib/n8n/content';
import type { InspirationSeed, GeneratedContent, ContentPlatform, ContentType } from '@/types/database';

export default function ContentGenerator({ seed }: { seed: InspirationSeed }) {
  const { context } = useTaraStudio();
  const [isGenerating, setIsGenerating] = useState(false);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<ContentPlatform[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<ContentType[]>([]);

  const handleGenerate = async () => {
    if (!context || selectedPlatforms.length === 0 || selectedFormats.length === 0) return;

    setIsGenerating(true);
    try {
      const result = await generateSocialContent(seed, {
        platforms: selectedPlatforms,
        formats: selectedFormats
      }, {
        emotional_state: context.emotional_state,
        weather: context.weather,
        master_plan: context.master_plan
      });

      setContent(result);
    } catch (error) {
      console.error('Content generation failed:', error);
      // Handle error UI
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!content) return;

    try {
      await publishContent(content, selectedPlatforms);
      // Handle success UI
    } catch (error) {
      console.error('Publishing failed:', error);
      // Handle error UI
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {['instagram', 'twitter', 'linkedin'].map(platform => (
          <button
            key={platform}
            onClick={() => {
              const p = platform as ContentPlatform;
              setSelectedPlatforms(curr => 
                curr.includes(p) 
                  ? curr.filter(x => x !== p)
                  : [...curr, p]
              );
            }}
            className={`px-4 py-2 rounded ${
              selectedPlatforms.includes(platform as ContentPlatform)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200'
            }`}
          >
            {platform}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {['carousel', 'story', 'post', 'thread'].map(format => (
          <button
            key={format}
            onClick={() => {
              const f = format as ContentType;
              setSelectedFormats(curr =>
                curr.includes(f)
                  ? curr.filter(x => x !== f)
                  : [...curr, f]
              );
            }}
            className={`px-4 py-2 rounded ${
              selectedFormats.includes(format as ContentType)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200'
            }`}
          >
            {format}
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || selectedPlatforms.length === 0 || selectedFormats.length === 0}
          className="px-6 py-2 bg-green-500 text-white rounded disabled:bg-gray-300"
        >
          {isGenerating ? 'Generating...' : 'Generate Content'}
        </button>

        {content && (
          <button
            onClick={handlePublish}
            className="px-6 py-2 bg-blue-500 text-white rounded"
          >
            Publish
          </button>
        )}
      </div>

      {content && (
        <div className="mt-8 space-y-4">
          {Object.entries(content.platforms || {}).map(([platform, content]) => (
            <div key={platform} className="border p-4 rounded">
              <h3 className="font-bold capitalize">{platform}</h3>
              <pre className="mt-2 whitespace-pre-wrap">
                {JSON.stringify(content, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}