'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  initial: number;
  onChange: (value: number) => void;
  ariaLabel: string;
};

export function Slider({ initial, onChange, ariaLabel }: Props) {
  const [value, setValue] = useState(initial);
  const [touched, setTouched] = useState(false);
  const lastTick = useRef(Math.round(initial / 10));
  const trackRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    if (!touched) return;
    onChange(value);
  }, [value, onChange, touched]);

  const setFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const next = Math.round(pct * 100);
    const tick = Math.floor(next / 10);
    if (tick !== lastTick.current) {
      lastTick.current = tick;
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(8);
      }
    }
    setValue(next);
    setTouched(true);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    draggingRef.current = true;
    setFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    setFromClientX(e.clientX);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
  };

  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let next = value;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = Math.max(0, value - 5);
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = Math.min(100, value + 5);
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = 100;
    if (next !== value) {
      e.preventDefault();
      setValue(next);
      setTouched(true);
    }
  };

  return (
    <div className="w-full select-none">
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKey}
        className="group relative h-14 w-full touch-none focus:outline-none"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-cream/15" />
        <div
          className="absolute left-0 top-1/2 h-px -translate-y-1/2 brand-gradient"
          style={{ width: `${value}%` }}
        />
        <div className="absolute left-0 right-0 top-1/2 flex -translate-y-1/2 items-center justify-between">
          {Array.from({ length: 11 }).map((_, i) => (
            <span
              key={i}
              className="h-2 w-px bg-cream/25"
              style={{ opacity: i * 10 <= value ? 0.7 : 0.25 }}
            />
          ))}
        </div>
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${value}%` }}
        >
          <div
            className="h-7 w-7 rounded-full brand-gradient shadow-[0_8px_24px_-4px_rgba(236,72,153,0.45)] transition-transform group-active:scale-95"
            aria-hidden
          />
        </div>
      </div>
      <div className="mt-2 text-right font-mono text-xs text-cream/60" aria-hidden>
        {touched ? `${value}%` : 'drag'}
      </div>
    </div>
  );
}
