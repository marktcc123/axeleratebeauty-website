export function PageIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted">{eyebrow}</p>
      <h1 className="mt-4 font-serif text-4xl leading-tight text-ink text-balance sm:text-5xl">{title}</h1>
      {children && <div className="mt-6 text-lg leading-relaxed text-muted">{children}</div>}
    </div>
  );
}
