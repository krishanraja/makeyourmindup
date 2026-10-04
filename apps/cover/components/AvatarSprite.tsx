import { AVATARS } from '@/lib/avatars'

/** Every panel face, once, as symbols that components/Avatar.tsx points at. */
export function AvatarSprite() {
  const symbols = Object.entries(AVATARS)
    .map(([id, svg]) => `<symbol id="avatar-${id}" viewBox="0 0 120 120">${svg}</symbol>`)
    .join('')
  return <svg aria-hidden="true" width="0" height="0" className="absolute" dangerouslySetInnerHTML={{ __html: symbols }} />
}
