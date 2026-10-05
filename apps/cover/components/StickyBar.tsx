'use client'

import Image from 'next/image'
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'
import { useState } from 'react'
import { SITE, subscribeUrl } from '@/lib/content'

/** A slim bar with the wordmark and subscribe, once the cover has scrolled away. */
export function StickyBar() {
  const { scrollY } = useScroll()
  const [show, setShow] = useState(false)
  const reduce = useReducedMotion()
  useMotionValueEvent(scrollY, 'change', y => setShow(y > (typeof window === 'undefined' ? 800 : window.innerHeight * 0.9)))

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          data-sticky
          className="fixed inset-x-0 top-0 z-50 border-b-2 border-mint/40 bg-ink/95 backdrop-blur"
          initial={reduce ? { opacity: 0 } : { y: -70 }}
          animate={reduce ? { opacity: 1 } : { y: 0 }}
          exit={reduce ? { opacity: 0 } : { y: -70 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="page flex h-14 items-center justify-between gap-4">
            <a href="#top" aria-label={SITE.footer.top} className="block w-[128px] sm:w-[220px]">
              <Image src="/brand/wordmark.png" alt="" width={3319} height={391} sizes="220px" className="h-auto w-full" />
            </a>
            <a
              href={subscribeUrl()}
              target="_blank"
              rel="noopener"
              className="heavy inline-flex min-h-[44px] shrink-0 items-center whitespace-nowrap border-2 border-ink bg-mint px-3 text-sm uppercase text-ink"
            >
              {SITE.subscribe.button}
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
