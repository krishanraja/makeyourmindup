'use client'

import { useState } from 'react'
import { CONFIG, SITE } from '@/lib/content'

/**
 * A plain GET form to Substack's subscribe page, which prefills the email.
 * It works with JavaScript off. Substack owns the list; nothing is stored here.
 */
export function SubscribeForm({ tone = 'dark', id = 'subscribe' }: { tone?: 'dark' | 'light'; id?: string }) {
  const [sent, setSent] = useState(false)
  const t = SITE.subscribe
  const dark = tone === 'dark'

  return (
    <form
      action={`${CONFIG.substackUrl}/subscribe`}
      method="get"
      target="_blank"
      onSubmit={() => setSent(true)}
      className="w-full max-w-xl"
      aria-describedby={`${id}-note`}
    >
      <label htmlFor={`${id}-email`} className={`mono-label mb-2 block ${dark ? 'text-cream/70' : 'text-ink/70'}`}>
        {t.label}
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder={t.placeholder}
          className={`min-h-[52px] flex-1 border-2 px-4 text-lg outline-none placeholder:opacity-50 focus-visible:outline-offset-0 ${
            dark ? 'border-cream bg-ink text-cream placeholder:text-cream' : 'border-ink bg-cream text-ink placeholder:text-ink'
          }`}
        />
        <button
          type="submit"
          className={`heavy min-h-[52px] border-2 border-ink bg-mint px-6 text-lg uppercase text-ink transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 ${
            dark ? 'brutal-cream' : 'brutal'
          }`}
        >
          {t.button}
        </button>
      </div>
      <p id={`${id}-note`} className={`mt-3 text-sm ${dark ? 'text-cream/60' : 'text-ink/60'}`} aria-live="polite">
        {sent ? t.sent : t.note}
      </p>
    </form>
  )
}
