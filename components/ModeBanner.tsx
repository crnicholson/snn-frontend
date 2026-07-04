"use client";

import { HealthResponse } from "@/lib/types";

type Props = {
  health: HealthResponse | null;
};

export default function ModeBanner({ health }: Props) {
  if (!health || health.mode !== "mock") return null;

  return (
    <div className="border-b border-l-2 border-[#3c3c3c] border-l-[#cca700] bg-[#252526] px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#cca700]">
        Running on mock scores
      </p>
      <p className="mt-1 text-xs text-[#cccccc]">
        {health.reason ?? "No trained weights loaded — retrain to enable the SNN."}
      </p>
    </div>
  );
}
