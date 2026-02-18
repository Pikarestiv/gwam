export function GhostSVG({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Body */}
      <path
        d="M50 10 C25 10 10 30 10 55 L10 100 L22 90 L34 100 L46 90 L58 100 L70 90 L82 100 L90 100 L90 55 C90 30 75 10 50 10Z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Left eye */}
      <ellipse cx="37" cy="52" rx="8" ry="9" fill="var(--color-bg, #0a0a0f)" />
      <circle cx="39" cy="50" r="3" fill="white" opacity="0.8" />
      {/* Right eye */}
      <ellipse cx="63" cy="52" rx="8" ry="9" fill="var(--color-bg, #0a0a0f)" />
      <circle cx="65" cy="50" r="3" fill="white" opacity="0.8" />
      {/* Smile */}
      <path
        d="M38 68 Q50 76 62 68"
        stroke="var(--color-bg, #0a0a0f)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
