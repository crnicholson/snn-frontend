"use client";

import { AXIS_DESCRIPTIONS, AXIS_LABELS, AxisKey, LineFeedback, LintFinding, SCORE_DESCRIPTION } from "@/lib/types";
import InfoTip from "./InfoTip";
import MrSpikyMascot from "./MrSpikyMascot";

type Props = {
  selectedLine: number | null;
  lineFeedback: LineFeedback | null;
  dominantAxis: AxisKey | null;
  lintFindings: LintFinding[];
  snnEnabled: boolean;
  lintEnabled: boolean;
};

const AXIS_ORDER: AxisKey[] = [
  "complexity",
  "tangled_state",
  "hidden_calls",
  "exception_surface",
  "naming",
];

export default function LineInspector({
  selectedLine,
  lineFeedback,
  dominantAxis,
  lintFindings,
  snnEnabled,
  lintEnabled,
}: Props) {
  if (selectedLine === null) {
    return (
      <div className="flex-1 bg-(--bg-surface) p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-(--text-primary)">
          Line Inspector
        </p>
        <div className="mt-3 flex items-start gap-2">
          <MrSpikyMascot mood="curious" className="h-8 w-8 shrink-0" />
          <p className="mt-1 text-xs text-(--text-muted)">
            Click a line to put it under the monocle.
          </p>
        </div>
      </div>
    );
  }

  const hasSnnSignal = snnEnabled && !!lineFeedback && lineFeedback.score > 0;
  const hasLintSignal = lintEnabled && lintFindings.length > 0;

  return (
    <div className="flex-1 overflow-y-auto bg-(--bg-surface) p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-(--text-primary)">
        Line {selectedLine}
      </p>

      {snnEnabled && (
        <div className="mt-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-(--danger-light)">SNN</p>
          {!hasSnnSignal || !lineFeedback ? (
            <p className="mt-1 text-xs text-(--text-muted)">No signal on this line.</p>
          ) : (
            <>
              <div className="mt-1 flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs text-(--text-secondary)">
                  score
                  <InfoTip text={SCORE_DESCRIPTION} />
                </span>
                <span
                  className={`font-mono text-xs font-semibold ${
                    lineFeedback.flag ? "text-(--danger)" : "text-(--warning-light)"
                  }`}
                >
                  {lineFeedback.score.toFixed(2)}
                </span>
              </div>

              <div className="mt-1.5 space-y-1.5">
                {AXIS_ORDER.map((axis) => {
                  const value = lineFeedback.axes[axis];
                  const isDominant = axis === dominantAxis;
                  return (
                    <div key={axis} className="flex items-center gap-2">
                      <span
                        className={`flex w-28 shrink-0 items-center gap-1 text-[10px] ${
                          isDominant ? "text-(--danger-light)" : "text-(--text-secondary)"
                        }`}
                      >
                        {AXIS_LABELS[axis]}
                        {isDominant ? " ●" : ""}
                        <InfoTip text={AXIS_DESCRIPTIONS[axis]} />
                      </span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-sm bg-(--border)">
                        <div
                          className={`h-full rounded-sm ${
                            isDominant ? "bg-(--danger)" : "bg-(--text-muted)"
                          }`}
                          style={{ width: `${Math.min(value, 1) * 100}%` }}
                        />
                      </div>
                      <span className="w-8 shrink-0 text-right font-mono text-[10px] text-(--text-muted)">
                        {value.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {lineFeedback.reason && (
                <p className="mt-2 text-xs leading-relaxed text-(--text-primary)">
                  {lineFeedback.reason}
                </p>
              )}

              {lineFeedback.context && (
                <p className="mt-1.5 font-mono text-[10px] text-(--text-muted)">
                  inside <span className="text-(--text-secondary)">{lineFeedback.context.function}</span>{" "}
                  (lines {lineFeedback.context.span[0]}–{lineFeedback.context.span[1]}) · fn score{" "}
                  {lineFeedback.context.function_score.toFixed(2)}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {snnEnabled && lintEnabled && <div className="my-3 border-t border-(--border)" />}

      {lintEnabled && (
        <div className={snnEnabled ? "" : "mt-2.5"}>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-(--info)">Lint</p>
          {!hasLintSignal ? (
            <p className="mt-1 text-xs text-(--text-muted)">No findings on this line.</p>
          ) : (
            <ul className="mt-1.5 space-y-1.5">
              {lintFindings.map((f, i) => (
                <li key={`${f.rule}-${i}`} className="text-xs leading-relaxed">
                  <span
                    className={`font-mono text-[10px] font-semibold ${
                      f.severity === "error" ? "text-(--danger)" : "text-(--warning-light)"
                    }`}
                  >
                    {f.rule}
                  </span>{" "}
                  <span className="text-(--text-primary)">{f.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
