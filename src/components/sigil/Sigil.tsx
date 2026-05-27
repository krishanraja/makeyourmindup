import type { SigilParams } from './compose';

type Props = {
  params: SigilParams;
  size?: number;
  stroke?: string;
  fill?: string;
};

const VIEW = 512;
const CENTER = VIEW / 2;
const BASE_R = 180;

export function Sigil({ params, size = 320, stroke = '#0A0908', fill = '#0A0908' }: Props) {
  const { frame, form, rotation, scale, dots } = params;
  const r = BASE_R * scale;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Generated sigil"
    >
      {frame === 'ring' && (
        <circle cx={CENTER} cy={CENTER} r={BASE_R + 30} fill="none" stroke={stroke} strokeWidth={1.5} />
      )}
      {frame === 'broken' && (
        <>
          <path
            d={arcPath(CENTER, CENTER, BASE_R + 30, 100, 260)}
            fill="none"
            stroke={stroke}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
          <path
            d={arcPath(CENTER, CENTER, BASE_R + 30, 280, 80)}
            fill="none"
            stroke={stroke}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </>
      )}
      {frame === 'double' && (
        <>
          <circle cx={CENTER} cy={CENTER} r={BASE_R + 30} fill="none" stroke={stroke} strokeWidth={1.5} />
          <circle cx={CENTER} cy={CENTER} r={BASE_R + 42} fill="none" stroke={stroke} strokeWidth={1.5} />
        </>
      )}

      <g transform={`rotate(${rotation} ${CENTER} ${CENTER})`}>
        {form === 'vesica' && (
          <>
            <circle cx={CENTER} cy={CENTER - r * 0.4} r={r} fill="none" stroke={stroke} strokeWidth={2} />
            <circle cx={CENTER} cy={CENTER + r * 0.4} r={r} fill="none" stroke={stroke} strokeWidth={2} />
          </>
        )}
        {form === 'lozenge' && (
          <rect
            x={CENTER - r}
            y={CENTER - r}
            width={r * 2}
            height={r * 2}
            fill="none"
            stroke={stroke}
            strokeWidth={2}
            transform={`rotate(45 ${CENTER} ${CENTER})`}
          />
        )}
        {form === 'triangle' && (
          <polygon
            points={trianglePoints(CENTER, CENTER, r)}
            fill="none"
            stroke={stroke}
            strokeWidth={2}
          />
        )}
        {form === 'annulus' && (
          <>
            <circle cx={CENTER} cy={CENTER} r={r} fill={fill} />
            <circle cx={CENTER} cy={CENTER} r={r * 0.55} fill="#F5F1EA" />
          </>
        )}
      </g>

      {dots.map((d, i) => {
        const rad = (d.angle * Math.PI) / 180;
        const cx = CENTER + Math.cos(rad) * (BASE_R + 60);
        const cy = CENTER + Math.sin(rad) * (BASE_R + 60);
        return <circle key={i} cx={cx} cy={cy} r={4} fill={fill} />;
      })}
    </svg>
  );
}

function trianglePoints(cx: number, cy: number, r: number): string {
  const top = `${cx},${cy - r}`;
  const left = `${cx - r * Math.sin(Math.PI / 3)},${cy + r * 0.5}`;
  const right = `${cx + r * Math.sin(Math.PI / 3)},${cy + r * 0.5}`;
  return `${top} ${left} ${right}`;
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const startRad = (startDeg * Math.PI) / 180;
  const endRad = (endDeg * Math.PI) / 180;
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);
  let sweep = endDeg - startDeg;
  if (sweep < 0) sweep += 360;
  const largeArc = sweep > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}
