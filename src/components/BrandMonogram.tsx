type Props = {
  size?: number;
  className?: string;
};

export function BrandMonogram({ size = 32, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Mindmaker monogram"
    >
      <defs>
        <linearGradient id="mm-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>
      <rect x="48" y="100" width="50" height="50" fill="url(#mm-grad)" />
      <rect x="102" y="100" width="50" height="50" fill="url(#mm-grad)" />
      <polygon points="65,96 81,96 89,72 57,72" fill="url(#mm-grad)" />
      <polygon points="104,96 148,96 138,52 114,52" fill="url(#mm-grad)" />
    </svg>
  );
}
