'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import styles from './ScrollScene.module.css';

/**
 * A scroll-driven scene (the etsyedit.com pattern). The scene is `length`
 * screens tall and its stage sticks to the viewport while you scroll through
 * it; the scene's `--p` goes from 0 to 1 over that distance, and everything
 * inside animates from it in CSS. `--p` glides toward the scroll position
 * (a per-frame ease, so wheel steps don't jump) and is written straight to the
 * style, so React never re-renders and the markup stays server-rendered.
 *
 * - `pin`: always pinned.
 * - `pin-desktop`: pinned from 768px up; on mobile the stage flows normally
 *   (its content is too tall to pin) and `--p` tracks it entering the screen.
 * - `view`: never pinned; `--p` tracks the stage entering the screen.
 *
 * `hold` adds that many screens at the end where the stage stays pinned but
 * `--p` is already 1 — room for the next scene to slide over it. `--h` counts
 * the screens scrolled into the hold (0 → hold). That next
 * scene sets `cover` (it starts one screen early, on top); `cover="desktop"`
 * when the scene before is `pin-desktop` (it isn't pinned on mobile).
 * `coverScreens` (default 1) is how many screens it overlaps. When the scene
 * before must stay pinned underneath for as long as this one is pinned (a
 * transparent scene fading in over it), this scene must lie entirely inside
 * its hold: scene before `hold` = `coverScreens` = this scene's
 * `length + hold`.
 *
 * Below 1024px the staged scenes don't pin, so `mobileHold` / `mobileCover`
 * (default: the desktop values) can shorten those overlaps there.
 *
 * Reduced motion: no pinning and `--p` is 1, so every scene shows its end state.
 */
export default function ScrollScene({
  length = 1,
  hold = 0,
  cover = false,
  coverScreens = 1,
  mobileHold = hold,
  mobileCover = coverScreens,
  mode = 'pin',
  className,
  stageClassName,
  label,
  children,
}: {
  length?: number;
  hold?: number;
  cover?: boolean | 'desktop';
  coverScreens?: number;
  mobileHold?: number;
  mobileCover?: number;
  mode?: 'pin' | 'pin-desktop' | 'view';
  className?: string;
  stageClassName?: string;
  /** Accessible name for the scene's <section>. */
  label?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const scene = ref.current;
    const stage = scene?.firstElementChild;
    if (!scene || !stage) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const small = window.matchMedia('(max-width: 1023px)');
    let pinned = false;
    let holdNow = hold;
    let frame = 0;
    let current: number | null = null; // shown scroll distance, eased toward the real one

    const measure = () => {
      pinned = getComputedStyle(stage).position === 'sticky';
      holdNow = small.matches ? mobileHold : hold;
    };
    const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
    // Both variables come from the scene's scrolled distance (-top), so easing
    // that one number keeps them in step.
    const write = (scrolled: number) => {
      const vh = window.innerHeight;
      // The stage is normally one screen tall, but may be taller (a pinned
      // stage taller than the screen scrolls on once the pin is released).
      const stageH = Math.max(vh, (stage as HTMLElement).offsetHeight);
      const range = Math.max(1, scene.offsetHeight - stageH - vh * holdNow);
      const p = pinned ? scrolled / range : (vh + scrolled) / (vh * 0.85);
      scene.style.setProperty('--p', clamp01(p).toFixed(4));
      // --h: screens scrolled into the hold (0 → hold), for a layer that fades
      // in while the next scene slides over this one.
      if (holdNow) scene.style.setProperty('--h', Math.min(holdNow, Math.max(0, (scrolled - range) / vh)).toFixed(4));
    };
    const update = () => {
      frame = 0;
      if (reduce.matches) {
        scene.style.setProperty('--p', '1');
        if (holdNow) scene.style.setProperty('--h', String(holdNow));
        return;
      }
      const t = -scene.getBoundingClientRect().top;
      // Ease ~20% of the remaining distance per frame; snap when within 1px.
      current = current === null || Math.abs(t - current) < 1 ? t : current + (t - current) * 0.2;
      write(current);
      if (current !== t) frame = requestAnimationFrame(update);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      schedule();
    };

    measure();
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', onResize);
    reduce.addEventListener('change', onResize);
    small.addEventListener('change', onResize);
    return () => {
      small.removeEventListener('change', onResize);
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', onResize);
      reduce.removeEventListener('change', onResize);
    };
  }, [hold, mobileHold]);

  const modeClass = { pin: styles.pin, 'pin-desktop': styles.pinDesktop, view: styles.view }[mode];
  return (
    <section
      ref={ref}
      aria-label={label}
      className={[styles.scene, modeClass, cover && (cover === 'desktop' ? styles.coverDesktop : styles.cover), className].filter(Boolean).join(' ')}
      style={
        {
          '--len': length + hold,
          '--len-m': length + mobileHold,
          '--cover': coverScreens,
          '--cover-m': mobileCover,
        } as CSSProperties
      }
    >
      <div className={[styles.stage, stageClassName].filter(Boolean).join(' ')}>{children}</div>
    </section>
  );
}
