"use client";

import { CSSProperties } from "react";
import { LineFeedback } from "@/lib/types";

type Props = {
  lines: LineFeedback[];
  runId: number;
  enabled: boolean;
};

function spikeColor(score: number) {
  // Idle amber -> hot red as intensity rises, matching the instrument's
  // neutral "activity" vs. "flagged" signal vocabulary.
  const r = 255;
  const g = Math.round(180 - score * 140);
  const b = Math.round(84 - score * 84);
  return `rgb(${r}, ${Math.max(g, 40)}, ${Math.max(b, 0)})`;
}

export default function SpikeTimeline({ lines, runId, enabled }: Props) {
  const active = lines.filter((l) => l.score > 0.02);

  if (!enabled) {
    return (
      <div className="border-b border-[#3c3c3c] bg-[#252526] px-3 py-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6a6a6a]">
          Spike Timeline
        </p>
        <p className="mt-1 text-xs text-[#6a6a6a]">Enable SNN above to see spike activity.</p>
      </div>
    );
  }

  return (
    <div className="border-b border-[#3c3c3c] bg-[#252526]">
      <div className="flex items-center justify-between px-3 pt-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#cccccc]">
          Spike Timeline
        </p>
        <p className="text-[10px] text-[#6a6a6a]">
          {active.length} line{active.length === 1 ? "" : "s"} fired
        </p>
      </div>
      {active.length === 0 ? (
        <div className="flex h-20 items-center justify-center">
          <p className="text-xs text-[#6a6a6a]">— no signal —</p>
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
