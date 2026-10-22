import Link from "next/link";

export function CartNavLink({
  count,
  className = "",
  onNavigate,
}: {
  count: number;
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href="/cart"
      onClick={onNavigate}
      className={`relative inline-flex items-center text-stone-deep transition hover:text-ink ${className}`}
      aria-label={count > 0 ? `View cart, ${count} items` : "View cart"}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.5 5h1.6l1.4 10.2a1.5 1.5 0 0 0 1.5 1.3h8.7a1.5 1.5 0 0 0 1.5-1.2L19.5 8H7"
        />
        <circle cx="9.5" cy="19.5" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="16.5" cy="19.5" r="1.2" fill="currentColor" stroke="none" />
      </svg>
      {count > 0 ? (
        <span className="absolute -right-2 -top-2 min-w-[1.1rem] rounded-full bg-charcoal px-1 text-center text-[10px] font-medium leading-4 text-cream">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
