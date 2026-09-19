type Props = {
  title: string;
};

export function TypographicMark({ title }: Props) {
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <p className="text-center font-serif text-[clamp(2.4rem,8vw,3.4rem)] font-semibold leading-[1.05] tracking-tightest text-cream">
        {title}
      </p>
      <span aria-hidden className="h-px w-24 brand-gradient" />
    </div>
  );
}
