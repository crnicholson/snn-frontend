"use client";

import { CSSProperties } from "react";
import { LineFeedback } from "@/lib/types";

type Props = {
  lines: LineFeedback[];
  runId: number;
  enabled: boolean;
};

function spikeColor(score: number) {
  // Idle (--spike-idle) -> hot (--spike-hot) as intensity rises; both tokens
  // live in globals.css so the whole gradient reskins with the theme.
  const pct = Math.round(Math.min(Math.max(score, 0), 1) * 100);
  return `color-mix(in srgb, var(--spike-hot) ${pct}%, var(--spike-idle))`;
}

export default function SpikeTimeline({ lines, runId, enabled }: Props) {
  const active = lines.filter((l) => l.score > 0.02);

  if (!enabled) {
    return (
      <div className="border-b border-(--border) bg-(--bg-surface) px-3 py-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-(--text-muted)">
          Spike Timeline
        </p>
        <p className="mt-1 text-xs text-(--text-muted)">Enable SNN above to see spike activity.</p>
      </div>
    );
  }

  return (
    <div className="border-b border-(--border) bg-(--bg-surface)">
      <div className="flex items-center justify-between px-3 pt-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-(--text-primary)">
          Spike Timeline
        </p>
        <p className="text-[10px] text-(--text-muted)">
          {active.length} line{active.length === 1 ? "" : "s"} fired
        </p>
      </div>
      {active.length === 0 ? (
        <div className="flex h-20 items-center justify-center">
          <p className="text-xs text-(--text-muted)">— no signal —</p>
        </div>
      ) : (
        <div key={runId} className="flex h-20 items-end gap-[2px] overflow-x-auto px-3 py-2.5">
          {active.map((l, i) => (
            <div
              key={l.line}
              title={`line ${l.line} · ${l.score.toFixed(2)}`}
              className="spike-bar w-[3px] shrink-0 rounded-t-sm"
              style={
                {
                  height: `${Math.max(l.score * 100, 4)}%`,
                  backgroundColor: spikeColor(l.score),
                  boxShadow: l.flag ? `0 0 6px ${spikeColor(l.score)}` : undefined,
                  animationDelay: `${Math.min(i * 8, 900)}ms`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
