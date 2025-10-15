import React, { useMemo, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, animate } from 'framer-motion';
import type { GeneratedContent } from '@/types/database';
import { getContentPlatformIcon, truncateContentPreview, formatHashtags, formatTimestamp, getDominantEmotion } from '@/utils/formatters';
import { getEmotionColor } from '@/utils/emotionalColors';
import { Instagram, Twitter, Linkedin } from 'lucide-react';

const GAP = 16;
const DRAG_SNAP_THRESHOLD = 80;
const SPRING_CONFIG = { type: 'spring', stiffness: 300, damping: 30 } as const;

interface Props {
  items: GeneratedContent[];
  onItemClick?: (item: GeneratedContent) => void;
  baseWidth?: number;
  autoplay?: boolean;
}

function PlatformBadge({ platform }: { platform?: string | null }) {
  const p = (platform || '').toLowerCase();
  if (p.includes('insta') || p.includes('instagram')) return (
    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/6"><Instagram size={18} className="text-white" /></div>
  );
  if (p.includes('twitter') || p === 'x') return (
    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/6"><Twitter size={18} className="text-white" /></div>
  );
  if (p.includes('linkedin')) return (
    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/6"><Linkedin size={18} className="text-white" /></div>
  );
  return <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/6"><span className="text-xs text-white">{getContentPlatformIcon(platform).slice(0,1)}</span></div>;
}

export default function ContentCarousel({ items, onItemClick, baseWidth = 380, autoplay = false }: Props) {
  // Use the full items list (no filtering) as requested by the review comment
  const panels = items || [];

  const itemWidth = baseWidth;
  const trackItemOffset = itemWidth + GAP;
  const [currentIndex, setCurrentIndex] = useState(0);
  const x = useMotionValue(0);

  useEffect(() => {
    // when currentIndex changes, animate x to the snap position
    const to = -currentIndex * trackItemOffset;
    const controls = animate(x, to, SPRING_CONFIG as any);
    return controls.stop;
  }, [currentIndex, trackItemOffset, x]);

  // autoplay optional
  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => setCurrentIndex((c) => (c + 1) % panels.length), 5000);
    return () => clearInterval(t);
  }, [autoplay, panels.length]);

  if (!panels || panels.length === 0) return <div className="text-sm text-white/60">No content</div>;

  // compute per-card transforms relative to center index
  function cardStyleForIndex(i: number) {
    const offsetIndex = i - currentIndex;
    const tx = offsetIndex * trackItemOffset;
    const rotateY = Math.max(-45, Math.min(45, -offsetIndex * 12));
    const scale = Math.max(0.82, 1 - Math.abs(offsetIndex) * 0.08);
    const z = -Math.abs(offsetIndex) * 80;
    return { tx, rotateY, scale, z };
  }

  // the track motion value (x) is the canonical shared value
  const trackX = x;

  // Helper badge for rendering platform icons
  function PlatformBadge({ platform }: { platform?: string | null }) {
    const p = (platform || '').toLowerCase();
    if (p.includes('insta') || p.includes('instagram')) return (
      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/6"><Instagram size={18} className="text-white" /></div>
    );
    if (p.includes('twitter') || p === 'x') return (
      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/6"><Twitter size={18} className="text-white" /></div>
    );
    if (p.includes('linkedin')) return (
      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/6"><Linkedin size={18} className="text-white" /></div>
    );
    return <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/6"><span className="text-xs text-white">{getContentPlatformIcon(platform).slice(0,1)}</span></div>;
  }

  function snapToNearest(offset: number, velocity: number) {
    // offset is the drag offset (px), velocity is pixels/sec
    if (Math.abs(offset) > DRAG_SNAP_THRESHOLD || Math.abs(velocity) > 600) {
      if (offset < 0 || velocity < -600) {
        setCurrentIndex((c) => Math.min(c + 1, panels.length - 1));
      } else if (offset > 0 || velocity > 600) {
        setCurrentIndex((c) => Math.max(c - 1, 0));
      }
    } else {
      // snap back to current
      setCurrentIndex((c) => c);
    }
  }

  function handleDragEnd(_: any, info: PanInfo) {
    snapToNearest(info.offset.x, info.velocity.x);
  }

  function goTo(i: number) {
    setCurrentIndex(Math.max(0, Math.min(i, panels.length - 1)));
  }

  function prev() {
    goTo(currentIndex - 1);
  }

  function next() {
    goTo(currentIndex + 1);
  }

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <motion.div
          className="flex items-center will-change-transform"
          style={{ x: trackX }}
          drag="x"
          dragConstraints={{ left: -((panels.length - 1) * trackItemOffset), right: 0 }}
          onDragEnd={handleDragEnd}
          dragElastic={0.15}
          {...SPRING_CONFIG}
        >
          {panels.map((panel, idx: number) => (
            <CarouselCard
              key={panel.id}
              panel={panel}
              idx={idx}
              trackX={trackX}
              trackItemOffset={trackItemOffset}
              itemWidth={itemWidth}
              onItemClick={onItemClick}
            />
          ))}
        </motion.div>
      </div>

      {/* navigation dots */}
      <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
        {Array.from({ length: panels.length }).map((_, i) => (
          <button key={i} onClick={() => goTo(i)} className={`w-2 h-2 rounded-full ${i === currentIndex ? 'bg-white' : 'bg-white/30'}`} aria-label={`Go to panel ${i + 1}`} />
        ))}
      </div>

      <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 glass p-2 rounded-full">‹</button>
      <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 glass p-2 rounded-full">›</button>
    </div>
  );
}

// Child component to render a single card. Keeping hooks inside a stable child avoids
// changing hook order when mapping over arrays in the parent.
function CarouselCard({ panel, idx, trackX, trackItemOffset, itemWidth, onItemClick }: any) {
  const slides = (panel.content_data as any)?.slides || [];
  const platform = panel.platform || 'unknown';
  const hashtags = formatHashtags((panel.content_data as any)?.hashtags || (slides[0]?.hashtags) || []);
  const timestamp = formatTimestamp(panel.created_at || (panel.content_data as any)?.metadata?.created_at);
  const optimism = panel.emotional_context?.mood?.optimism ?? null;
  const dominant = panel.emotional_context ? getDominantEmotion(panel.emotional_context.primary_emotions || ({} as any)) : undefined;

  const rel = useTransform(trackX, (v: number) => v + idx * trackItemOffset);
  const dynamicRotateY = useTransform(rel, [-trackItemOffset, 0, trackItemOffset], [12, 0, -12]);
  const dynamicTranslateZ = useTransform(rel, [-trackItemOffset, 0, trackItemOffset], [-60, 0, -60]);
  const parallaxX = useTransform(rel, [-trackItemOffset, 0, trackItemOffset], [-24, 0, 24]);
  const dynamicScale = useTransform(rel, [-trackItemOffset, 0, trackItemOffset], [0.9, 1, 0.9]);

  // preview content by type
  let previewText = '';
  let footerMeta = '';
  switch (panel.content_type) {
    case 'caption':
      previewText = (panel.content_data?.text as string) || '';
      footerMeta = `Caption • ${((panel.content_data?.text as string) || '').length} chars`;
      break;
    case 'story':
      previewText = (panel.content_data?.metadata?.callToAction as string) || (panel.content_data?.text as string) || '';
      footerMeta = `Story • ${((panel.content_data?.metadata?.backgroundColor) || 'default')}`;
      break;
    case 'post':
      previewText = (panel.content_data?.text as string) || '';
      footerMeta = `Mentions: ${((panel.content_data?.metadata?.mentions || []) as any).length || 0}`;
      break;
    case 'carousel':
    default:
      previewText = truncateContentPreview((slides[0]?.body as string) || slides[0]?.text || slides.map((s: any) => s.body || s.text).join('\n') || '');
      footerMeta = `Slides: ${slides.length}`;
  }

  return (
    <motion.div style={{ width: itemWidth, transformStyle: 'preserve-3d' } as any} className="mr-4">
      <motion.div
        className="glass relative rounded-2xl p-5 cursor-grab active:cursor-grabbing"
        onDoubleClick={() => onItemClick?.(panel)}
        style={{
          x: parallaxX,
          translateZ: dynamicTranslateZ,
          rotateY: dynamicRotateY,
          scale: dynamicScale,
          perspective: 1000,
          transformStyle: 'preserve-3d'
        } as any}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <PlatformBadge platform={platform} />
            <div>
              <div className="text-sm font-semibold text-white">{(slides[0] && ((slides[0].title) || slides[0].text)) || (panel.content_data && (panel.content_data.text)) || 'Post'}</div>
              <div className="text-xs text-white/60">{platform}</div>
              {/* Debug: surface generated context metadata so reviewers can verify what was passed to the model */}
              <div className="text-xxs text-white/40 mt-1">
                {panel.metadata?.generated_with_context ? (
                  (() => {
                    const g = panel.metadata.generated_with_context;
                    const ec = g.emotional_context ? (g.emotional_context.primary_emotions ? Object.keys(g.emotional_context.primary_emotions).sort((a:any,b:any)=> (g.emotional_context.primary_emotions[b]||0)-(g.emotional_context.primary_emotions[a]||0))[0] : null) : null;
                    const dp = g.daily_plan ? (Array.isArray(g.daily_plan) ? g.daily_plan.slice(0,2).join(', ') : String(g.daily_plan)) : null;
                    const w = g.weather ? (g.weather.condition || g.weather.temp_c ? `${g.weather.condition || ''}${g.weather.temp_c ? ` ${g.weather.temp_c}°C` : ''}` : null) : null;
                    return (
                      <div className="flex flex-col">
                        <span className="text-xxs text-white/40">Context: {ec ? ec : '—'}</span>
                        <span className="text-xxs text-white/40">Plan: {dp ? dp : '—'}</span>
                        <span className="text-xxs text-white/40">Weather: {w ? w : '—'}</span>
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-xxs text-white/30 italic">No generation context recorded</div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {panel.emotional_context ? (
              (() => {
                const label = dominant ? String(dominant) : null;
                const color = (getEmotionColor((label as any) || 'joy') as string) || getEmotionColor('joy');
                function cap(s?: string | null) { if (!s) return ''; return s.charAt(0).toUpperCase() + s.slice(1); }
                return (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                    <div className="text-xs text-white/70">{label ? cap(label) : optimism !== null ? `Optimism ${optimism.toFixed(2)}` : ''}</div>
                  </div>
                );
              })()
            ) : null}
            <div className="text-xs text-white/50">{timestamp}</div>
          </div>
        </div>

        <div className="min-h-[84px]">
          <div className="text-sm text-white/90">{previewText || '—'}</div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-2">
            {hashtags.slice(0,3).map((h: any, i: number) => (
              <span key={i} className="text-xs text-white/60">{h}</span>
            ))}
          </div>
          <div className="text-xs text-white/50 italic">{footerMeta}</div>
        </div>
      </motion.div>
    </motion.div>
  );
}
