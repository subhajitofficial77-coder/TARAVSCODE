"use client";
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type AnimationType = 'fade' | 'slide' | 'parallax';

export default function AnimatedSection({ children, animation = 'fade', delay = 0, triggerOnce = true }: { children: React.ReactNode; animation?: AnimationType; delay?: number; triggerOnce?: boolean }) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let ctx: gsap.Context | null = gsap.context(() => {
      if (animation === 'fade') {
        gsap.fromTo(el, { opacity: 0, y: 30 }, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            end: 'top 50%',
            toggleActions: triggerOnce ? 'play none none none' : 'play reverse play reverse',
          }
        });
      } else if (animation === 'slide') {
        gsap.fromTo(el, { x: -50, opacity: 0 }, {
          x: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            end: 'top 50%',
            toggleActions: triggerOnce ? 'play none none none' : 'play reverse play reverse',
          }
        });
      } else if (animation === 'parallax') {
        gsap.to(el, {
          y: -50,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          }
        });
      }
    }, ref);

    return () => {
      try {
        ScrollTrigger.getAll().forEach(st => {
          if (st.trigger === el) st.kill();
        });
      } catch (e) {
        // ignore
      }
      if (ctx) ctx.revert();
    };
  }, [animation, delay, triggerOnce]);

  return (
    <section ref={ref as any} className="animated-section">
      {children}
    </section>
  );
}
