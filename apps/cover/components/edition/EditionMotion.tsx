'use client'

import { useLayoutEffect, useRef } from 'react'
import './motion.css'

const entrances = [
  '.sp', '.thing', '.room', '.done', '.subs', '.fi', '.desk-stories article',
  '.section-body > h1', '.section-body > p', '.section-body h2', '.archive-month li',
  '.market-summary', '.market-data tbody tr', '.drill', '.ask',
].join(',')
const clamp = (n: number) => Math.max(0, Math.min(1, n))

// Measure the real typeset lines. The link stays in normal flow and paints immediately.
function wipeHeadline(root: HTMLElement) {
  const layer = root.querySelector<HTMLElement>('.headline-wipes')
  const link = layer?.previousElementSibling
  if (!layer || !link) return
  const range = document.createRange()
  range.selectNodeContents(link)
  const start = performance.now()
  function draw() {
    if (!layer) return
    const bounds = layer.getBoundingClientRect()
    const lines = Array.from(range.getClientRects()).filter(line => line.width > 0)
    const elapsed = performance.now() - start
    const fragment = document.createDocumentFragment()
    lines.forEach((line, i) => {
      const block = document.createElement('i')
      Object.assign(block.style, {
        left: line.left - bounds.left + 'px', top: line.top - bounds.top + 'px',
        width: line.width + 'px', height: line.height + 'px',
        animationDelay: (160 * i / Math.max(1, lines.length - 1) - elapsed) + 'ms',
      })
      fragment.append(block)
    })
    layer.replaceChildren(fragment)
  }
  draw()
  function clear() {
    window.removeEventListener('resize', draw)
    document.fonts.removeEventListener('loadingdone', draw)
    layer?.replaceChildren()
  }
  const timeout = window.setTimeout(clear, 600)
  window.addEventListener('resize', draw)
  document.fonts.addEventListener('loadingdone', draw)
  return () => {
    clearTimeout(timeout)
    clear()
  }
}

function enhance(root: HTMLElement, light: boolean) {
  const directory = light ? null : root.querySelector<HTMLElement>('.room-directory')
  const board = directory?.nextElementSibling as HTMLElement | null
  const figure = light ? null : root.querySelector<HTMLElement>('.lead-fig')
  const photo = figure?.querySelector('img')
  const active = new Set<Element>()
  const counts = new Map<HTMLElement, { from: number; to: number; start: number }>()
  const seen = new WeakSet<Element>()
  let frame = 0
  let scrollChanged = true
  root.dataset.motion = light ? 'light' : 'full'
  const clearWipe = !light && wipeHeadline(root)

  function paint(now: number) {
    frame = 0
    if (scrollChanged) {
      scrollChanged = false
      // All geometry reads precede writes. The measured boxes never transform.
      const mediaY = figure && active.has(figure) ? figure.getBoundingClientRect() : null
      const boardY = board && active.has(board) ? board.getBoundingClientRect().top : null
      const dirHeight = directory?.offsetHeight ?? 0
      const vh = window.innerHeight
      if (mediaY && photo) {
        const p = clamp((vh - mediaY.top) / (vh + mediaY.height))
        photo.style.transform = 'translateY(' + (p - 0.5) * 5 + '%) scale(' + (1.055 + p * 0.05) + ')'
      }
      if (directory && board) {
        const canStick = dirHeight < vh * 0.82
        directory.toggleAttribute('data-sticky', canStick)
        if (boardY !== null && canStick) {
          const p = clamp((dirHeight + vh * 0.09 - boardY) / Math.max(dirHeight, 1))
          directory.style.transform = 'scale(' + (1 - 0.065 * p) + ') rotate(' + (-1.6 * p) + 'deg)'
        } else {
          directory.style.removeProperty('transform')
        }
      }
    }
    for (const [el, count] of counts) {
      const p = clamp((now - count.start) / 540)
      el.textContent = (count.to + (count.from - count.to) * (1 - p) ** 3).toFixed(2)
      if (p === 1) counts.delete(el)
    }
    if (counts.size) schedule()
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(paint)
  }
  function scroll() {
    scrollChanged = true
    schedule()
  }
  const nearby = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) active.add(entry.target)
      else active.delete(entry.target)
    }
    scroll()
  }, { rootMargin: '15% 0px' })
  if (figure) nearby.observe(figure)
  if (board) nearby.observe(board)

  const enter = new IntersectionObserver(entries => {
    const now = performance.now()
    let stagger = 0
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      const el = entry.target as HTMLElement
      enter.unobserve(el)
      el.style.setProperty('--enter-delay', Math.min(stagger++, 3) * (light ? 25 : 55) + 'ms')
      el.dataset.entered = ''
      const level = el.querySelector<HTMLElement>('[data-level][data-from]')
      if (level && !light && level.dataset.counted !== level.dataset.level) {
        level.dataset.counted = level.dataset.level
        counts.set(level, { from: Number(level.dataset.from), to: Number(level.dataset.level), start: now })
        schedule()
      }
    }
  }, { threshold: 0.03 })
  function observe(el: Element) {
    if (seen.has(el)) return
    seen.add(el)
    enter.observe(el)
  }
  root.querySelectorAll(entrances).forEach(observe)
  // The full feed can gain new rows when its filters change.
  const additions = new MutationObserver(records => {
    for (const record of records) for (const node of record.addedNodes) {
      if (!(node instanceof Element)) continue
      if (node.matches(entrances)) observe(node)
      node.querySelectorAll(entrances).forEach(observe)
    }
  })
  const feed = root.querySelector('.flist')
  if (feed) additions.observe(feed, { childList: true, subtree: true })
  if (figure || directory) {
    window.addEventListener('scroll', scroll, { passive: true })
    window.addEventListener('resize', scroll)
    schedule()
  }
  return () => {
    enter.disconnect()
    nearby.disconnect()
    additions.disconnect()
    window.removeEventListener('scroll', scroll)
    window.removeEventListener('resize', scroll)
    cancelAnimationFrame(frame)
    if (clearWipe) clearWipe()
    for (const [el, count] of counts) el.textContent = count.to.toFixed(2)
    photo?.style.removeProperty('transform')
    directory?.style.removeProperty('transform')
    directory?.removeAttribute('data-sticky')
    root.querySelectorAll('[data-entered]').forEach(el => el.removeAttribute('data-entered'))
    delete root.dataset.motion
  }
}

export function EditionMotion({ light = false }: { light?: boolean }) {
  const marker = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    const root = marker.current?.parentElement
    if (!root) return
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let stop: (() => void) | undefined
    function sync() {
      stop?.()
      stop = undefined
      document.documentElement.classList.toggle('motion', !preference.matches)
      if (root && !preference.matches && window.IntersectionObserver) stop = enhance(root, light)
    }
    sync()
    preference.addEventListener('change', sync)
    return () => {
      preference.removeEventListener('change', sync)
      stop?.()
    }
  }, [light])
  return <span hidden ref={marker} />
}
