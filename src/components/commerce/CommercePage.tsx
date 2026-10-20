import type { ReactNode } from "react";

export function CommercePage({
  children,
  narrow = false,
}: {
  children: ReactNode;
  narrow?: boolean;
}) {
  return (
    <section className="commerce-page">
      <div className={narrow ? "commerce-container commerce-container--narrow" : "commerce-container"}>
        {children}
      </div>
    </section>
  );
}

export function CommerceHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="commerce-header">
      <p className="commerce-eyebrow">{eyebrow}</p>
      <h1 className="commerce-title text-balance">{title}</h1>
      {description ? <p className="commerce-lead">{description}</p> : null}
    </header>
  );
}
