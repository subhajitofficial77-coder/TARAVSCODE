import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useTaraStudio } from '@/lib/contexts/TaraStudioContext';
import { useEmotionalStyling } from '@/lib/hooks/useEmotionalStyling';
import { FancyButton } from '@/components/ui/FancyButton';
import type { AnalysisResult, MultiPlatformContent, ImagePrompt } from '@/types/content';

const SOCIAL_PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: '📷' },
  { id: 'facebook', name: 'Facebook', icon: '📘' },
  { id: 'twitter', name: 'X (Twitter)', icon: '🐦' },
  { id: 'youtube', name: 'YouTube', icon: '🎥' }
];

export function AnalyzeCreateHub() {
  const { context } = useTaraStudio();
  const { getEmotionalStyle } = useEmotionalStyling();
  
  const [contentUrl, setContentUrl] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [generatedContent, setGeneratedContent] = useState<MultiPlatformContent[] | null>(null);
  const [imagePrompt, setImagePrompt] = useState<ImagePrompt | null>(null);

  const emotions = context?.emotional_state?.primary_emotions || {};
  const styles = getEmotionalStyle();
  const containerStyle = styles.containerStyle;
  const animationProps = getEmotionalAnimation();

  async function handleAnalyze() {
    if (!contentUrl) {
      toast.error('Please enter a content URL');
      return;
    }

    try {
      setIsAnalyzing(true);
      
      // Call analyze API
      const res = await fetch('/api/studio/analyze-social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentUrl, platform })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAnalysisResult(data);
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Failed to analyze content. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleGenerateMulti() {
    if (!analysisResult) {
      toast.error('Please analyze content first');
      return;
    }

    try {
      setIsGenerating(true);

      // Generate for all platforms
      const res = await fetch('/api/studio/generate-multi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisResult,
          platforms: ['instagram', 'facebook', 'twitter', 'linkedin']
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setGeneratedContent(data);

      // Generate image prompt
      const promptRes = await fetch('/api/studio/generate-image-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisResult })
      });

      const promptData = await promptRes.json();
      if (!promptRes.ok) throw new Error(promptData.error);

      setImagePrompt(promptData);
      toast.success('Content generated for all platforms!');
    } catch (error) {
      console.error('Generation failed:', error);
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleAccept(platformContent: MultiPlatformContent) {
    try {
      const memory = {
        content_type: 'social_media',
        platform: platformContent.platform,
        original_content: {
          url: contentUrl,
          type: analysisResult?.contentType
        },
        analysis_result: analysisResult,
        generated_content: platformContent,
        user_feedback: 'accepted'
      };

      await fetch('/api/studio/store-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memory)
      });

      toast.success('Content saved to memory!');
    } catch (error) {
      console.error('Failed to store memory:', error);
      toast.error('Failed to save content. Please try again.');
    }
  }

  async function handleReject(platformContent: MultiPlatformContent) {
    // Re-generate content for single platform
    try {
      setIsGenerating(true);
      const res = await fetch('/api/studio/generate-multi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisResult,
          platforms: [platformContent.platform]
        })
      });

      const data = await res.json();
      setGeneratedContent(prev => 
        prev?.map(content =>
          content.platform === platformContent.platform ? data[0] : content
        ) || null
      );
      toast.success('Content regenerated!');
    } catch (error) {
      console.error('Regeneration failed:', error);
      toast.error('Failed to regenerate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  function handleDecline(platformContent: MultiPlatformContent) {
    // Store declined feedback
    const memory = {
      content_type: 'social_media',
      platform: platformContent.platform,
      original_content: {
        url: contentUrl,
        type: analysisResult?.contentType
      },
      analysis_result: analysisResult,
      generated_content: platformContent,
      user_feedback: 'declined'
    };

    fetch('/api/studio/store-memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memory)
    });
  }

  return (
    <div className="space-y-6">
      {/* URL Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-black/40 border border-white/10"
      >
        <h2 className="text-xl font-bold text-white mb-4">
          🔍 Analyze Social Media Content
        </h2>

        <div className="space-y-4">
          {/* Platform Selection */}
          <div className="flex gap-2">
            {SOCIAL_PLATFORMS.map(({ id, name, icon }) => (
              <button
                key={id}
                onClick={() => setPlatform(id)}
                className={`p-2 rounded-lg transition-all ${
                  platform === id
                    ? 'bg-yellow-400/20 text-yellow-400'
                    : 'text-white/60 hover:bg-white/5'
                }`}
              >
                <span className="text-xl">{icon}</span>
                <span className="ml-2 text-sm">{name}</span>
              </button>
            ))}
          </div>

          {/* URL Input */}
          <div className="flex gap-4">
            <input
              type="text"
              value={contentUrl}
              onChange={(e) => setContentUrl(e.target.value)}
              placeholder="Paste content URL here..."
              className="flex-1 px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/20"
            />
            <FancyButton
              onClick={handleAnalyze}
              isLoading={isAnalyzing}
              disabled={isAnalyzing || !contentUrl}
              variant="blue"
            >
              Analyze
            </FancyButton>
          </div>
        </div>
      </motion.div>

      {/* Analysis Results */}
      <AnimatePresence>
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-6 rounded-2xl bg-black/40 border border-white/10 space-y-4 overflow-hidden"
          >
            <h3 className="text-lg font-semibold text-white">Analysis Results</h3>
            
            {/* Visual Elements */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-white/5">
                <div className="text-sm text-white/60 mb-2">Visual Elements</div>
                <div className="space-y-1">
                  {analysisResult.visualElements.objects.map((obj, i) => (
                    <div key={i} className="text-white text-sm">{obj}</div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-white/5">
                <div className="text-sm text-white/60 mb-2">Colors</div>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.visualElements.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Sentiment */}
            <div className="p-4 rounded-lg bg-white/5">
              <div className="text-sm text-white/60 mb-2">Emotional Analysis</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(analysisResult.sentimentScores.emotions).map(([emotion, score]) => (
                  <div key={emotion} className="text-center">
                    <div className="text-lg mb-1">{emotion}</div>
                    <div
                      className="text-sm font-mono"
                      style={{ color: styles.colors?.[emotion as keyof typeof styles.colors] }}
                    >
                      {Math.round(score * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-end">
              <FancyButton
                onClick={handleGenerateMulti}
                isLoading={isGenerating}
                disabled={isGenerating}
                variant="green"
                size="lg"
              >
                Generate Multi-Platform Content
              </FancyButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Content */}
      <AnimatePresence>
        {generatedContent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            <h3 className="text-lg font-semibold text-white">Generated Content</h3>

            {generatedContent.map((content) => (
              <div
                key={content.platform}
                className="p-6 rounded-2xl bg-black/40 border border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {SOCIAL_PLATFORMS.find(p => p.id === content.platform)?.icon}
                    </span>
                    <span className="text-lg font-medium text-white">
                      {content.platform.charAt(0).toUpperCase() + content.platform.slice(1)}
                    </span>
                  </div>
                  <div className="text-sm text-white/60">
                    {content.characterCount} characters
                  </div>
                </div>

                <div className="whitespace-pre-wrap text-white mb-4">
                  {content.content}
                </div>

                {content.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {content.hashtags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-full bg-white/5 text-white/60 text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <FancyButton
                    onClick={() => handleAccept(content)}
                    variant="green"
                    icon="✓"
                  >
                    Accept
                  </FancyButton>
                  <FancyButton
                    onClick={() => handleReject(content)}
                    variant="blue"
                    icon="↻"
                  >
                    Regenerate
                  </FancyButton>
                  <FancyButton
                    onClick={() => handleDecline(content)}
                    variant="red"
                    icon="✕"
                  >
                    Decline
                  </FancyButton>
                </div>
              </div>
            ))}

            {/* Image Prompt */}
            {imagePrompt && (
              <div className="p-6 rounded-2xl bg-black/40 border border-white/10">
                <h4 className="text-lg font-medium text-white mb-4">
                  🎨 Nano Banana Image Prompt
                </h4>
                <div className="p-4 rounded-lg bg-white/5 font-mono text-sm text-white/80 whitespace-pre-wrap mb-4">
                  {imagePrompt.mainPrompt}
                </div>
                <div className="text-sm text-white/60">
                  Negative Prompt:
                </div>
                <div className="p-4 rounded-lg bg-white/5 font-mono text-sm text-white/80 whitespace-pre-wrap">
                  {imagePrompt.negativePrompt}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
