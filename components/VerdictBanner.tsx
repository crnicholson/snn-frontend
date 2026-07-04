"use client";

import { CompileResult, LintFinding } from "@/lib/types";

type Props = {
  snnEnabled: boolean;
  lintEnabled: boolean;
  result: CompileResult | null;
  isCompiling: boolean;
  error: string | null;
  notice: string | null;
  lintFindings: LintFinding[];
  onJumpToLine: (line: number) => void;
};

function lintVerdict(findings: LintFinding[]): string {
  if (findings.length === 0) return "No lint findings — reads clean by the rulebook";
  const errors = findings.filter((f) => f.severity === "error").length;
  return `${findings.length} lint finding${findings.length === 1 ? "" : "s"}${
    errors ? ` (${errors} error${errors === 1 ? "" : "s"})` : ""
  }`;
}

export default function VerdictBanner({
  snnEnabled,
  lintEnabled,
  result,
  isCompiling,
  error,
  notice,
  lintFindings,
  onJumpToLine,
}: Props) {
  if (error) {
    return (
      <div className="border-b border-l-2 border-[#3c3c3c] border-l-[#f14c4c] bg-[#252526] px-3 py-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#f14c4c]">
          Connection fault
        </p>
        <p className="mt-1 text-xs text-[#cccccc]">{error}</p>
      </div>
    );
  }

  if (notice) {
    return (
      <div className="border-b border-l-2 border-[#3c3c3c] border-l-[#cca700] bg-[#252526] px-3 py-2.5">
        <p className="text-xs text-[#e2c08d]">{notice}</p>
      </div>
    );
  }

  if (!snnEnabled && !lintEnabled) {
    return (
      <div className="border-b border-[#3c3c3c] bg-[#252526] px-3 py-2.5">
        <p className="text-xs text-[#969696]">No engines enabled — check SNN or Lint above.</p>
      </div>
    );
  }

  const snnWaiting = snnEnabled && !result;
  const snnFlagged = snnEnabled ? (result?.top_flagged ?? []) : [];
  const snnHasFlags = snnFlagged.length > 0;
  const lintLines = new Set(lintFindings.map((f) => f.line));
  const snnLines = new Set(snnFlagged);
  const agreement = [...snnLines].filter((l) => lintLines.has(l));

  const hasAnyFlags = (snnEnabled && snnHasFlags) || (lintEnabled && lintFindings.length > 0);

  return (
    <div
      className={`border-b border-l-2 border-[#3c3c3c] bg-[#252526] px-3 py-2.5 transition-colors ${
        hasAnyFlags ? "border-l-[#f14c4c]" : "border-l-[#89d185]"
      }`}
    >
      {snnEnabled && (
        <div className="flex items-center justify-between gap-3">
          <p
            className={`text-xs font-medium ${
              snnWaiting ? "text-[#969696]" : snnHasFlags ? "text-[#f48771]" : "text-[#89d185]"
            }`}
          >
            <span className="text-[#f48771]">SNN · </span>
            {snnWaiting ? (isCompiling ? "Reading code…" : "Waiting for input") : result?.verdict}
          </p>
          {isCompiling && !snnWaiting && (
            <span className="text-[10px] uppercase tracking-wide text-[#969696]">
              re-reading…
            </span>
          )}
        </div>
      )}
      {snnEnabled && snnHasFlags && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-[#969696]">top offenders</span>
          {snnFlagged.map((line) => (
            <button
              key={line}
              onClick={() => onJumpToLine(line)}
              className="rounded-sm border border-[#f14c4c]/40 bg-[#f14c4c]/10 px-1.5 py-0.5 font-mono text-[10px] text-[#f48771] transition-colors hover:bg-[#f14c4c]/20"
            >
              {line}
            </button>
          ))}
        </div>
      )}

      {snnEnabled && lintEnabled && <div className="my-2 border-t border-[#3c3c3c]" />}

      {lintEnabled && (
        <div>
          <p
            className={`text-xs font-medium ${
              lintFindings.length > 0 ? "text-[#f48771]" : "text-[#89d185]"
            }`}
          >
            <span className="text-[#4fc1ff]">Lint · </span>
            {lintVerdict(lintFindings)}
          </p>
          {lintFindings.length > 0 && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-[#969696]">findings</span>
              {lintFindings.slice(0, 6).map((f, i) => (
                <button
                  key={`${f.line}-${f.rule}-${i}`}
                  onClick={() => onJumpToLine(f.line)}
                  title={f.message}
                  className="rounded-sm border border-[#4fc1ff]/40 bg-[#4fc1ff]/10 px-1.5 py-0.5 font-mono text-[10px] text-[#4fc1ff] transition-colors hover:bg-[#4fc1ff]/20"
                >
                  {f.line}:{f.rule}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {snnEnabled && lintEnabled && (snnHasFlags || lintFindings.length > 0) && (
        <p className="mt-2 border-t border-[#3c3c3c] pt-2 text-[10px] leading-relaxed text-[#6a6a6a]">
          {agreement.length > 0
            ? `${agreement.length} line${agreement.length === 1 ? "" : "s"} flagged by both engines — high-confidence signal.`
            : "No overlap this run — each engine is catching something the other misses."}
        </p>
      )}
    </div>
  );
}
