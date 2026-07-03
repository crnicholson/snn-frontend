"use client";

import { CompileResult } from "@/lib/types";

type Props = {
  result: CompileResult | null;
  isCompiling: boolean;
  error: string | null;
};

export default function VerdictBanner({ result, isCompiling, error }: Props) {
  if (error) {
    return (
      <div className="rounded-md border border-[#ff5468]/40 bg-[#ff5468]/10 px-4 py-3">
        <p className="font-mono text-xs uppercase tracking-wider text-[#ff5468]">Connection fault</p>
        <p className="mt-1 text-sm text-[#e7e9ec]">{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="rounded-md border border-[#22262b] bg-[#111317] px-4 py-3">
        <p className="text-sm text-[#868c98]">
          {isCompiling ? "Reading code…" : "Waiting for input"}
        </p>
      </div>
    );
  }

  const hasFlags = result.top_flagged.length > 0;

  return (
    <div
      className={`rounded-md border px-4 py-3 transition-colors ${
        hasFlags
          ? "border-[#ff5468]/40 bg-[#ff5468]/10"
          : "border-[#3ddc84]/30 bg-[#3ddc84]/[0.06]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p
          className={`text-sm font-medium ${
            hasFlags ? "text-[#ff8f9b]" : "text-[#3ddc84]"
          }`}
        >
          {result.verdict}
        </p>
        {isCompiling && (
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#868c98]">
            re-reading…
          </span>
        )}
      </div>
      {hasFlags && (
        <p className="mt-1.5 font-mono text-xs text-[#868c98]">
          top offenders — line{result.top_flagged.length > 1 ? "s" : ""}{" "}
          {result.top_flagged.join(", ")}
        </p>
      )}
    </div>
  );
}
