"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion, PanInfo, useMotionValue } from "framer-motion";
import { FileText, Circle, Layers, Layout, Code, ChevronLeft, ChevronRight } from 'lucide-react';
import type { GeneratedContent } from '@/types/database';
import { useTaraStudio } from '@/lib/contexts/TaraStudioContext';
import { useEmotionalStyling } from '@/lib/hooks/useEmotionalStyling';
import TaraStudioContext from '@/lib/contexts/TaraStudioContext';
import { useContext } from 'react';
import { EMOTION_COLORS } from '@/utils/emotionalColors';

export interface CarouselProps {
  items?: GeneratedContent[];
  baseWidth?: number;
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
  round?: boolean;
}

const DEFAULT_ITEM_ICONS = [
  <FileText key="icon-0" className="h-[16px] w-[16px] text-white" />,
  <Circle key="icon-1" className="h-[16px] w-[16px] text-white" />,
  <Layers key="icon-2" className="h-[16px] w-[16px] text-white" />,
  <Layout key="icon-3" className="h-[16px] w-[16px] text-white" />,
  <Code key="icon-4" className="h-[16px] w-[16px] text-white" />,
];

const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
const SPRING_OPTIONS = { type: "spring", stiffness: 300, damping: 30 } as any;
const CONTROL_SPACING = 48; // space on left/right to accommodate prev/next buttons

export default function AdvancedCarousel({
  items = [],
  baseWidth = 420,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  loop = false,
  round = false,
}: CarouselProps) {
  // emotional styling - safe when provider absent
  const maybeCtx = useContext(TaraStudioContext as any);
  let dominantEmotion = 'joy';
  let intensity = 0.5;
  let topEmotions: string[] = ['joy', 'trust', 'sadness'];
  try {
    const res = useEmotionalStyling();
    if (res) {
      dominantEmotion = res.dominantEmotion ?? dominantEmotion;
      intensity = res.intensity ?? intensity;
      topEmotions = (res.topEmotions as string[]) ?? topEmotions;
    }
  } catch (e) {
    // If hook throws because provider missing, fall back to defaults above
  }
  const containerPadding = 16;
  const itemWidth = baseWidth - containerPadding * 2;
  const trackItemOffset = itemWidth + GAP;

  const carouselItems = loop ? [...items, items[0]] : items;
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const userInteractedRef = useRef<boolean>(false);
  const selectedIdRef = useRef<string | number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  useEffect(() => {
    if (pauseOnHover && containerRef.current) {
      const container = containerRef.current;
      const handleMouseEnter = () => setIsHovered(true);
      const handleMouseLeave = () => setIsHovered(false);
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [pauseOnHover]);

  // measure container width so we can center slides correctly across breakpoints
  useEffect(() => {
    const measure = () => {
      const w = containerRef.current ? containerRef.current.clientWidth : 0;
      setContainerWidth(w);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useEffect(() => {
    // only autoplay if configured and the user hasn't manually interacted
    if (autoplay && (!pauseOnHover || !isHovered) && !userInteractedRef.current) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev === items.length - 1 && loop) {
            return prev + 1;
          }
          if (prev === carouselItems.length - 1) {
            return loop ? 0 : prev;
          }
          return prev + 1;
        });
      }, autoplayDelay);
      return () => clearInterval(timer);
    }
  }, [autoplay, autoplayDelay, isHovered, loop, items.length, carouselItems.length, pauseOnHover]);

  const effectiveTransition = isResetting ? { duration: 0 } : SPRING_OPTIONS;

  const handleAnimationComplete = () => {
    if (loop && currentIndex === carouselItems.length - 1) {
      setIsResetting(true);
      x.set(0);
      setCurrentIndex(0);
      setTimeout(() => setIsResetting(false), 50);
    }
  };

  const handleDragEnd = (_: any, info: PanInfo): void => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) {
      if (loop && currentIndex === items.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex((prev) => Math.min(prev + 1, carouselItems.length - 1));
      }
    } else if (offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) {
      if (loop && currentIndex === 0) {
        setCurrentIndex(items.length - 1);
      } else {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      }
    }
    // mark that the user manually interacted with the carousel
    userInteractedRef.current = true;
  };

  const dragProps = loop
    ? {}
    : {
        dragConstraints: {
          left: -trackItemOffset * (carouselItems.length - 1),
          right: 0,
        },
      };

  // helper to map GeneratedContent to display fields
  function mapPanel(item: GeneratedContent, idx: number) {
    const slides = (item.content_data as any)?.slides || [];
    const title = (slides[0] && ((slides[0].title) || slides[0].text)) || (item.content_data && (item.content_data.text)) || 'Post';
    const description = (slides[0] && slides[0].body) || item.content_data?.text || '';
    const icon = DEFAULT_ITEM_ICONS[idx % DEFAULT_ITEM_ICONS.length];
    return { title, description, id: item.id, icon, raw: item };
  }

  const panels = items.map(mapPanel);

  // keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setCurrentIndex((prev) => Math.max(0, prev - 1));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setCurrentIndex((prev) => Math.min(panels.length - 1, prev + 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setCurrentIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setCurrentIndex(panels.length - 1);
    }
  };

  useEffect(() => {
    const to = -currentIndex * trackItemOffset;
    const controls = (window as any).framerAnimate ? (window as any).framerAnimate(x, to, SPRING_OPTIONS) : undefined;
    // fallback to framer's animate by writing to x via motion animate in useEffect is not necessary; keep as no-op
    return () => { if (controls && controls.stop) controls.stop(); };
  }, [currentIndex, trackItemOffset]);

  // keep track of which item id is currently selected so we can preserve
  // the same item when the items list changes (e.g. new items inserted at front).
  useEffect(() => {
    const id = panels[currentIndex]?.id ?? null;
    selectedIdRef.current = id;
  }, [currentIndex, panels]);

  // when panels change, locate the previously selected id and keep that item
  // in view. This prevents the carousel from automatically jumping to the newest
  // item when new content is prepended.
  useEffect(() => {
    const prevId = selectedIdRef.current;
    if (prevId == null) return;
    const newIndex = panels.findIndex((p) => p.id === prevId);
    if (newIndex >= 0 && newIndex !== currentIndex) {
      // only update if we found the same item at a new index
      setCurrentIndex(newIndex);
    }
    // if item not found, clamp index to valid range
    if (currentIndex > panels.length - 1) {
      setCurrentIndex(Math.max(0, panels.length - 1));
    }
    // note: we intentionally DO NOT set the index to the newest item when panels grow
  }, [panels.length]);

  const handleDotClick = (i: number) => setCurrentIndex(Math.max(0, Math.min(i, panels.length - 1)));
  const handleDotClickUser = (i: number) => { userInteractedRef.current = true; handleDotClick(i); };

  // ensure currentIndex doesn't automatically jump to newly-created items
  // unless the index would be out of bounds. We respect manual user interactions
  // so once the user has clicked/dragged we won't programmatically override their position.
  useEffect(() => {
    if (currentIndex > panels.length - 1) {
      // clamp without jumping to the newest if user hasn't interacted
      setCurrentIndex(Math.max(0, panels.length - 1));
    }
    // do not auto-set currentIndex to panels.length-1 when items grow — leave it as-is
  }, [panels.length]);

  // full width of the track must account for all items so it's not clipped
  const trackWidth = carouselItems.length * trackItemOffset;

  // containerWidth measured from ref; fallback to baseWidth*1.6
  const effectiveContainerWidth = containerWidth || Math.round(baseWidth * 1.6);
  // No more CONTROL_SPACING needed since controls are external
  const containerStyle: React.CSSProperties = { width: '100%', maxWidth: `${Math.round(baseWidth * 1.6)}px`, minHeight: 220, boxSizing: 'border-box', overflow: 'hidden', position: 'relative', ...(round && { height: `${baseWidth}px` }) };

  // center calculations so the active slide sits in the middle of the visible container
  const centerOffset = Math.round((effectiveContainerWidth - itemWidth) / 2);
  const targetX = -(currentIndex * trackItemOffset) + centerOffset;

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Content carousel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`relative overflow-visible p-4 mx-auto focus:outline-none focus:ring-2 focus:ring-yellow-400 ${round ? 'rounded-full border border-white' : 'rounded-[24px]'} `}
      style={containerStyle}
    >
      {/* center the active slide within the visible container so items don't leak */}
      {/* Simplified horizontal track: no 3D transforms, cards aligned center with soft gradient thumbnail */}
      {/* External navigation buttons */}
      <div className="absolute inset-y-0 -left-12 flex items-center">
        <button
          onClick={() => { userInteractedRef.current = true; setCurrentIndex(Math.max(0, currentIndex - 1)); }}
          aria-label="Previous"
          className="glass rounded-full shadow flex items-center justify-center hover:bg-white/10 transition-colors"
          style={{ width: 40, height: 40, background: 'rgba(0,0,0,0.45)' }}
          disabled={!loop && currentIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 text-white/95" />
        </button>
      </div>
      <motion.div role="list" className="flex items-stretch" drag="x" {...dragProps} style={{ width: trackWidth, gap: `${GAP}px`, x }} onDragEnd={handleDragEnd} animate={{ x: targetX }} transition={effectiveTransition} onAnimationComplete={handleAnimationComplete}>
        {panels.map((item, index) => {
          const primary = EMOTION_COLORS[topEmotions?.[0] as keyof typeof EMOTION_COLORS] ?? '#FFD700';
          const secondary = EMOTION_COLORS[topEmotions?.[1] as keyof typeof EMOTION_COLORS] ?? '#2ECC71';
          const isActive = currentIndex === index;
          return (
            <motion.div key={index} role="listitem" aria-hidden={!isActive} className={`relative shrink-0 flex flex-col ${round ? 'items-center justify-center text-center bg-[#060606] border-0' : 'items-start justify-between'} overflow-hidden cursor-grab active:cursor-grabbing studio-glow studio-border-accent`} style={{ width: itemWidth, height: round ? itemWidth : '100%' }} transition={effectiveTransition}>
              <div className={`${round ? 'p-0 m-0' : 'mb-4 p-4'}`}>
                <span style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }} className="flex h-[34px] w-[34px] items-center justify-center rounded-full ring-1 ring-white/10 overflow-hidden">{item.icon}</span>
              </div>
              <div className="p-5 glass rounded-xl bg-[linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))] border border-white/[0.04]">
                <div className="mb-1 font-bold text-lg text-white truncate">{item.title}</div>
                <p className="text-sm text-white/90 line-clamp-3">{item.description}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
      {/* External navigation - next button */}
      <div className="absolute inset-y-0 -right-12 flex items-center">
        <button
          onClick={() => { userInteractedRef.current = true; setCurrentIndex(Math.min(panels.length - 1, currentIndex + 1)); }}
          aria-label="Next"
          className="glass rounded-full shadow flex items-center justify-center hover:bg-white/10 transition-colors"
          style={{ width: 40, height: 40, background: 'rgba(0,0,0,0.45)' }}
          disabled={!loop && currentIndex === panels.length - 1}
        >
          <ChevronRight className="w-4 h-4 text-white/95" />
        </button>
      </div>
      {/* Pagination dots */}
      <div className={`flex w-full justify-center mt-4 ${round ? 'absolute z-20 bottom-12 left-1/2 -translate-x-1/2' : ''}`}>
        <div className="flex items-center gap-2">
          {panels.map((_, index) => (
            <button key={index} onClick={() => handleDotClickUser(index)} aria-label={`Go to slide ${index + 1}`} className={`h-2 w-8 rounded-full transition-colors duration-150 ${currentIndex % panels.length === index ? 'bg-white' : 'bg-white/20'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
