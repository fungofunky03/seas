// SEAS logo mark — geometric. A bold red wedge crossed by a horizontal bar
// (the "install line" / circuit run) with the wordmark beside it.
export function SeasLogo({ className = "", showWord = true }: { className?: string; showWord?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`} aria-label="SEAS">
      <svg
        viewBox="0 0 40 40"
        width="32"
        height="32"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect x="1" y="1" width="38" height="38" rx="6" className="fill-foreground" />
        <path d="M9 28 L20 8 L31 28 L25 28 L20 18 L15 28 Z" className="fill-primary" />
        <rect x="7" y="30" width="26" height="2.5" className="fill-background" />
        <circle cx="9.5" cy="31.25" r="1.5" className="fill-primary" />
        <circle cx="30.5" cy="31.25" r="1.5" className="fill-primary" />
      </svg>
      {showWord && (
        <span className="font-display font-black tracking-tight text-[1.25rem] leading-none">
          SEAS
        </span>
      )}
    </span>
  );
}
