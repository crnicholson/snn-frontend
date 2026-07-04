"use client";

import { CompileResult, LintFinding } from "@/lib/types";
import MrSpikyMascot from "./MrSpikyMascot";

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
      <div className="flex items-start gap-2 border-b border-l-2 border-(--border) border-l-(--danger) bg-(--bg-surface) px-3 py-2.5">
        <MrSpikyMascot mood="stern" className="mt-0.5 h-20 w-20 shrink-0" />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-(--danger)">
            Connection fault
          </p>
          <p className="mt-1 text-xs text-(--text-primary)">{error}</p>
        </div>
      </div>
    );
  }

  if (notice) {
    return (
      <div className="flex items-start gap-2 border-b border-l-2 border-(--border) border-l-(--warning) bg-(--bg-surface) px-3 py-2.5">
        <MrSpikyMascot mood="curious" className="mt-0.5 h-20 w-20 shrink-0" />
        <p className="text-xs text-(--warning-light)">{notice}</p>
      </div>
    );
  }

  if (!snnEnabled && !lintEnabled) {
    return (
      <div className="border-b border-(--border) bg-(--bg-surface) px-3 py-2.5">
        <p className="text-xs text-(--text-secondary)">No engines enabled — check SNN or Lint above.</p>
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
  const mascotMood = snnWaiting ? "curious" : hasAnyFlags ? "stern" : "pleased";

  return (
    <div
      className={`flex items-start gap-2 border-b border-l-2 border-(--border) bg-(--bg-surface) px-3 py-2.5 transition-colors ${
        hasAnyFlags ? "border-l-(--danger)" : "border-l-(--success)"
      }`}
    >
      <MrSpikyMascot mood={mascotMood} className="mt-0.5 h-20 w-20 shrink-0" />
      <div className="min-w-0 flex-1">
        {snnEnabled && (
          <div className="flex items-center justify-between gap-3">
            <p
              className={`text-xs font-medium ${
                snnWaiting ? "text-(--text-secondary)" : snnHasFlags ? "text-(--danger-light)" : "text-(--success)"
              }`}
            >
              <span className="text-(--danger-light)">SNN · </span>
              {snnWaiting ? (isCompiling ? "Reading code…" : "Waiting for input") : result?.verdict}
            </p>
            {isCompiling && !snnWaiting && (
              <span className="text-[10px] uppercase tracking-wide text-(--text-secondary)">
                re-reading…
              </span>
            )}
          </div>
        )}
        {snnEnabled && snnHasFlags && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-(--text-secondary)">top offenders</span>
            {snnFlagged.map((line) => (
              <button
                key={line}
                onClick={() => onJumpToLine(line)}
                className="rounded-sm border border-[color-mix(in_srgb,var(--danger)_40%,transparent)] bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-1.5 py-0.5 font-mono text-[10px] text-(--danger-light) transition-colors hover:bg-[color-mix(in_srgb,var(--danger)_20%,transparent)]"
              >
                {line}
              </button>
            ))}
          </div>
        )}

        {snnEnabled && lintEnabled && <div className="my-2 border-t border-(--border)" />}

        {lintEnabled && (
          <div>
            <p
              className={`text-xs font-medium ${
                lintFindings.length > 0 ? "text-(--danger-light)" : "text-(--success)"
              }`}
            >
              <span className="text-(--info)">Lint · </span>
              {lintVerdict(lintFindings)}
            </p>
            {lintFindings.length > 0 && (
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-(--text-secondary)">findings</span>
                {lintFindings.slice(0, 6).map((f, i) => (
                  <button
                    key={`${f.line}-${f.rule}-${i}`}
                    onClick={() => onJumpToLine(f.line)}
                    title={f.message}
                    className="rounded-sm border border-[color-mix(in_srgb,var(--info)_40%,transparent)] bg-[color-mix(in_srgb,var(--info)_10%,transparent)] px-1.5 py-0.5 font-mono text-[10px] text-(--info) transition-colors hover:bg-[color-mix(in_srgb,var(--info)_20%,transparent)]"
                  >
                    {f.line}:{f.rule}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {snnEnabled && lintEnabled && (snnHasFlags || lintFindings.length > 0) && (
          <p className="mt-2 border-t border-(--border) pt-2 text-[10px] leading-relaxed text-(--text-muted)">
            {agreement.length > 0
              ? `${agreement.length} line${agreement.length === 1 ? "" : "s"} flagged by both engines — high-confidence signal.`
              : "No overlap this run — each engine is catching something the other misses."}
          </p>
        )}
      </div>
    </div>
  );
}
