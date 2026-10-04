/** One panel face, cut to a circle. Decorative unless it is given a label. */
export function Avatar({ id, label, className = '' }: { id: string; label?: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={`[clip-path:circle(50%)] ${className}`}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    >
      <use href={`#avatar-${id}`} />
    </svg>
  )
}
