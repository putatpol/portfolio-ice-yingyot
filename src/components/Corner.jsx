export default function Corner({ pos }) {
    return (
      <svg className={`corner ${pos}`} viewBox="0 0 100 100">
        <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 96 V24 Q4 4 24 4 H96" />
          <path d="M14 96 V34 Q14 14 34 14 H96" opacity=".6" />
          <path d="M24 24 Q40 24 40 40 Q40 52 28 50" />
        </g>
        <circle cx="24" cy="24" r="4" fill="currentColor" />
        <path d="M4 4 l6 -2 -2 6 z" fill="currentColor" />
      </svg>
    );
  }