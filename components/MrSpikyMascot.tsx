type Mood = "idle" | "pleased" | "stern" | "curious";

type Props = {
  mood?: Mood;
  className?: string;
};

// One raised, skeptical brow over the monocle eye; the other stays put.
// The mouth is what actually swings the expression between moods.
const BROW: Record<Mood, string> = {
  idle: "M27 17.5 Q31 16.5 35 17.5",
  pleased: "M27 16 Q31 13.5 35 15.5",
  stern: "M27 18.5 Q31 13 35.5 16.5",
  curious: "M27 16.5 Q31 12.5 35 16",
};

const MOUTH: Record<Mood, string> = {
  idle: "M18 33.5 Q24 34.5 30 33.5",
  pleased: "M17.5 32.5 Q24 38 30.5 32.5",
  stern: "M18 34.5 Q24 32.5 30 34.5",
  curious: "M21 33.5 Q24 36.5 27 33.5",
};

export default function MrSpikyMascot({ mood = "idle", className }: Props) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label={`Mr. Spiky looking ${mood}`}
    >
      {/* bowtie */}
      <path
        d="M17 39 L23 36 L23 42 Z M31 39 L25 36 L25 42 Z"
        fill="var(--mascot-monocle-rim)"
      />
      <rect x="23" y="37.5" width="2" height="3" fill="var(--mascot-body-dark)" />

      {/* spikes */}
      <g fill="var(--mascot-spike)">
        <path d="M15 14 L17.5 6 L19.5 15 Z" />
        <path d="M22 12 L24 3 L26 12 Z" />
        <path d="M29 15 L31.5 6 L33.5 14 Z" />
      </g>

      {/* head */}
      <circle
        cx="24"
        cy="26"
        r="13.5"
        fill="var(--mascot-body)"
        stroke="var(--mascot-body-dark)"
        strokeWidth="1.5"
      />

      {/* plain eye */}
      <circle cx="16.5" cy="25.5" r="1.7" fill="var(--mascot-eye)" />
      <path d="M14 21.5 Q16.5 20.5 19 21.7" stroke="var(--mascot-body-dark)" strokeWidth="1.3" fill="none" strokeLinecap="round" />

      {/* monocle eye */}
      <circle cx="31" cy="25.5" r="1.7" fill="var(--mascot-eye)" />
      <circle
        cx="31"
        cy="25.5"
        r="6"
        fill="var(--mascot-monocle-glass)"
        stroke="var(--mascot-monocle-rim)"
        strokeWidth="1.6"
      />
      <path
        d="M36.2 29 Q40 32 37.5 37"
        stroke="var(--mascot-monocle-rim)"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />
      <path d={BROW[mood]} stroke="var(--mascot-body-dark)" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* mouth */}
      <path d={MOUTH[mood]} stroke="var(--mascot-body-dark)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}
