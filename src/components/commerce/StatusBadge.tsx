const TONES: Record<string, string> = {
  paid: "bg-sand-100 text-stone-deep",
  succeeded: "bg-sand-100 text-stone-deep",
  partially_refunded: "bg-sand-100 text-accent-tac",
  refunded: "bg-sand-100 text-muted",
  failed: "bg-sand-100 text-accent-tac",
  pending: "bg-sand-100 text-muted",
  unfulfilled: "bg-sand-100 text-muted",
  fulfilled: "bg-sand-100 text-stone-deep",
};

export function StatusBadge({ value }: { value: string }) {
  const tone = TONES[value] ?? "bg-sand-100 text-muted";
  return (
    <span className={`inline-block px-2 py-0.5 text-[11px] uppercase tracking-[0.12em] ${tone}`}>
      {value.replaceAll("_", " ")}
    </span>
  );
}
