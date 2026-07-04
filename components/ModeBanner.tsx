"use client";

import { HealthResponse } from "@/lib/types";
import MrSpikyMascot from "./MrSpikyMascot";

type Props = {
  health: HealthResponse | null;
};

export default function ModeBanner({ health }: Props) {
  if (!health || health.mode !== "mock") return null;

  return (
    <div className="flex items-start gap-2 border-b border-l-2 border-(--border) border-l-(--warning) bg-(--bg-surface) px-3 py-2.5">
      <MrSpikyMascot mood="curious" className="mt-0.5 h-7 w-7 shrink-0" />
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-(--warning)">
          Running on mock scores
        </p>
        <p className="mt-1 text-xs text-(--text-primary)">
          {health.reason ?? "No trained weights loaded — retrain to enable the SNN."}
        </p>
      </div>
    </div>
  );
}
