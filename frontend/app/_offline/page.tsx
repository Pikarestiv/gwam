export default function OfflinePage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: "#0a0a0f" }}
    >
      <svg
        width="80"
        height="96"
        viewBox="0 0 100 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M50 10 C25 10 10 30 10 55 L10 100 L22 90 L34 100 L46 90 L58 100 L70 90 L82 100 L90 100 L90 55 C90 30 75 10 50 10Z"
          fill="#7c3aed"
          opacity="0.5"
        />
        <ellipse cx="37" cy="52" rx="8" ry="9" fill="#0a0a0f" />
        <ellipse cx="63" cy="52" rx="8" ry="9" fill="#0a0a0f" />
        <path
          d="M38 72 Q50 66 62 72"
          stroke="#0a0a0f"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <h1 className="text-2xl font-bold mt-6" style={{ color: "#e2e8f0" }}>
        You're offline 👻
      </h1>
      <p className="text-sm mt-2" style={{ color: "#94a3b8" }}>
        Gwam needs a connection to send and receive messages.
        <br />
        Check your internet and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-8 px-6 py-3 rounded-xl font-semibold text-white"
        style={{ background: "#7c3aed" }}
      >
        Try again
      </button>
    </div>
  );
}
