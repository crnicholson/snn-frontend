"use client";

import { CSSProperties } from "react";
import { LineFeedback } from "@/lib/types";

type Props = {
  lines: LineFeedback[];
  runId: number;
};

function spikeColor(score: number) {
  // Idle amber -> hot red as intensity rises, matching the instrument's
  // neutral "activity" vs. "flagged" signal vocabulary.
  const r = 255;
  const g = Math.round(180 - score * 140);
  const b = Math.round(84 - score * 84);
  return `rgb(${r}, ${Math.max(g, 40)}, ${Math.max(b, 0)})`;
}

export default function SpikeTimeline({ lines, runId }: Props) {
  const active = lines.filter((l) => l.score > 0.02);

  if (active.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center rounded-md border border-[#22262b] bg-[#111317]">
        <p className="font-mono text-xs text-[#4d525c]">— no signal —</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-[#22262b] bg-[#111317] p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-wider text-[#868c98]">
          spike timeline
        </p>
        <p className="font-mono text-[10px] text-[#4d525c]">
          {active.length} line{active.length === 1 ? "" : "s"} fired
        </p>
      </div>
      <div key={runId} className="flex h-20 items-end gap-[2px] overflow-x-auto">
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
    </div>
  );
}
