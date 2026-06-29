/**
 * The quiet "by Mindmaker" endorsement.
 *
 * Portfolio cohesion: the shared MINDMAKER ICON (the emerald family mark,
 * /public/mindmaker-icon.png, identical to the one CTRL and the Mindmaker site
 * carry) is the single connective signal across the three products. Make Your
 * Mind Up keeps its own rose/ember BrandMonogram for ITS identity, but the
 * "by Mindmaker" lockup uses the family icon so the front door reads as part
 * of the same house.
 */
export function MindmakerEndorsement({ className = '' }: { className?: string }) {
  return (
    <p
      className={`flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-cream/55 ${className}`}
    >
      <span>makeyourmindup.ai · by</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/mindmaker-icon.png"
        alt=""
        width={12}
        height={12}
        className="opacity-80"
        style={{ objectFit: 'contain' }}
      />
      <span>Mindmaker</span>
    </p>
  );
}
