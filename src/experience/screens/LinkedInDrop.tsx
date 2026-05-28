'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { BrandMonogram } from '@/components/BrandMonogram';
import type { EnrichmentPayload } from '@/lib/types';

type Props = {
  onSubmit: (payload: EnrichmentPayload) => void;
  onSkip: () => void;
};

const LINKEDIN_URL_RE = /^https?:\/\/(?:[a-z]{2,3}\.)?linkedin\.com\/[A-Za-z0-9_\-/?=&%.#]+/i;
const SHARED_KEY = 'myu_shared';
const EASE = [0.22, 1, 0.36, 1] as const;

type Accepted =
  | { kind: 'url'; url: string }
  | { kind: 'image'; preview: string }
  | { kind: 'text'; name: string; company: string };

export function LinkedInDrop({ onSubmit, onSkip }: Props) {
  const reduced = useReducedMotion();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [accepted, setAccepted] = useState<Accepted | null>(null);
  const [showText, setShowText] = useState(false);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const submittedRef = useRef(false);

  const submit = useCallback(
    (payload: EnrichmentPayload, display: Accepted) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      setAccepted(display);
      // Tiny pause so the user sees the acceptance state before advancing.
      window.setTimeout(() => onSubmit(payload), reduced ? 0 : 450);
    },
    [onSubmit, reduced],
  );

  const handleUrl = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!LINKEDIN_URL_RE.test(trimmed)) return false;
      submit({ kind: 'url', url: trimmed }, { kind: 'url', url: trimmed });
      return true;
    },
    [submit],
  );

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return false;
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        submit(
          { kind: 'image', image: result, mediaType: file.type || 'image/jpeg' },
          { kind: 'image', preview: result },
        );
      };
      reader.readAsDataURL(file);
      return true;
    },
    [submit],
  );

  // Window-level paste listener (URL or image).
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (submittedRef.current) return;
      const text = e.clipboardData?.getData('text');
      if (text && handleUrl(text)) {
        e.preventDefault();
        return;
      }
      const items = e.clipboardData?.items;
      if (items) {
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file && handleFile(file)) {
              e.preventDefault();
              return;
            }
          }
        }
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [handleUrl, handleFile]);

  // PWA share-target landing: /share writes to sessionStorage, then redirects here.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const shared = sessionStorage.getItem(SHARED_KEY);
      if (shared) {
        sessionStorage.removeItem(SHARED_KEY);
        handleUrl(shared);
      }
    } catch {
      // ignore storage errors
    }
  }, [handleUrl]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (submittedRef.current) return;
      const file = e.dataTransfer.files?.[0];
      if (file && handleFile(file)) return;
      const url = e.dataTransfer.getData('text');
      if (url) handleUrl(url);
    },
    [handleFile, handleUrl],
  );

  const submitText = () => {
    const n = name.trim();
    const c = company.trim();
    if (!n && !c) return;
    submit(
      { kind: 'text', name: n, company: c },
      { kind: 'text', name: n, company: c },
    );
  };

  return (
    <div className="flex flex-1 flex-col px-6 pb-12 pt-[8vh]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="pb-[4vh]"
      >
        <BrandMonogram size={28} />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="max-w-[18ch] font-serif text-[clamp(1.85rem,6vw,2.35rem)] leading-[1.12] tracking-tightest text-cream"
      >
        Drop your card. We&apos;ll do the homework.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.6, ease: EASE }}
        className="mt-4 max-w-[28ch] font-serif text-base italic text-cream/65"
      >
        While you answer five things, we&apos;ll quietly read up on you. The result lands sharper.
      </motion.p>

      <motion.label
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6, ease: EASE }}
        htmlFor="linkedin-file"
        onDragOver={(e) => {
          e.preventDefault();
          if (!submittedRef.current) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={[
          'mt-8 flex min-h-[34vh] cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border px-6 py-8 text-center transition-colors',
          accepted
            ? 'border-transparent bg-cream/[0.04]'
            : dragOver
              ? 'border-cream/50 bg-cream/[0.04]'
              : 'border-cream/15 hover:border-cream/30',
        ].join(' ')}
      >
        {accepted ? (
          <AcceptedView accepted={accepted} />
        ) : (
          <>
            <p className="font-serif text-[1.05rem] text-cream/90">
              Paste your LinkedIn link
            </p>
            <p className="font-serif text-sm italic text-cream/55">
              or drop a screenshot, or tap to choose one
            </p>
          </>
        )}
        <input
          id="linkedin-file"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </motion.label>

      {!accepted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5, ease: EASE }}
          className="mt-6"
        >
          {!showText ? (
            <button
              type="button"
              onClick={() => setShowText(true)}
              className="font-serif text-base text-cream/65 underline-offset-[6px] transition-colors hover:text-cream/90 hover:underline"
            >
              or type it
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center border-b border-cream/20 focus-within:border-cream/60">
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className="w-full bg-transparent py-2 font-serif text-[1rem] text-cream placeholder:text-cream/55"
                />
              </div>
              <div className="flex items-center border-b border-cream/20 focus-within:border-cream/60">
                <input
                  type="text"
                  placeholder="Your company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  autoComplete="organization"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitText();
                  }}
                  className="w-full bg-transparent py-2 font-serif text-[1rem] text-cream placeholder:text-cream/55"
                />
                <button
                  type="button"
                  onClick={submitText}
                  disabled={!name.trim() && !company.trim()}
                  className="font-serif text-base text-cream/90 underline-offset-[6px] transition-opacity hover:underline disabled:opacity-30"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      <div className="mt-auto flex flex-col gap-3 pt-8 pb-[env(safe-area-inset-bottom)]">
        <button
          type="button"
          onClick={onSkip}
          className="text-left font-serif text-base text-cream/55 underline-offset-[6px] transition-colors hover:text-cream/80 hover:underline"
        >
          Skip
        </button>
      </div>
    </div>
  );
}

function AcceptedView({ accepted }: { accepted: Accepted }) {
  if (accepted.kind === 'image') {
    return (
      <div className="flex flex-col items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={accepted.preview}
          alt=""
          className="max-h-32 rounded-xl border border-cream/15"
        />
        <p className="font-serif text-base text-cream/85">Got it. Reading you in.</p>
      </div>
    );
  }
  if (accepted.kind === 'url') {
    return (
      <div className="flex flex-col items-center gap-2">
        <p className="font-serif text-base text-cream/85">Got it. Reading you in.</p>
        <p className="max-w-[26ch] truncate font-mono text-[11px] text-cream/55">
          {accepted.url}
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="font-serif text-base text-cream/85">Got it. Reading you in.</p>
      <p className="font-mono text-[11px] text-cream/55">
        {[accepted.name, accepted.company].filter(Boolean).join(' · ')}
      </p>
    </div>
  );
}
