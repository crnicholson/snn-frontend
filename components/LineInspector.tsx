"use client";

import { AXIS_DESCRIPTIONS, AXIS_LABELS, AxisKey, LineFeedback, LintFinding, SCORE_DESCRIPTION } from "@/lib/types";
import InfoTip from "./InfoTip";

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
      <div className="flex-1 bg-[#252526] p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#cccccc]">
          Line Inspector
        </p>
        <p className="mt-2 text-xs text-[#6a6a6a]">
          Click a line in the editor to inspect its axes.
        </p>
      </div>
    );
  }

  const hasSnnSignal = snnEnabled && !!lineFeedback && lineFeedback.score > 0;
  const hasLintSignal = lintEnabled && lintFindings.length > 0;

  return (
    <div className="flex-1 overflow-y-auto bg-[#252526] p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#cccccc]">
        Line {selectedLine}
      </p>

      {snnEnabled && (
        <div className="mt-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#f48771]">SNN</p>
          {!hasSnnSignal || !lineFeedback ? (
            <p className="mt-1 text-xs text-[#6a6a6a]">No signal on this line.</p>
          ) : (
            <>
              <div className="mt-1 flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs text-[#969696]">
                  score
                  <InfoTip text={SCORE_DESCRIPTION} />
                </span>
                <span
                  className={`font-mono text-xs font-semibold ${
                    lineFeedback.flag ? "text-[#f14c4c]" : "text-[#e2c08d]"
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
                          isDominant ? "text-[#f48771]" : "text-[#969696]"
                        }`}
                      >
                        {AXIS_LABELS[axis]}
                        {isDominant ? " ●" : ""}
                        <InfoTip text={AXIS_DESCRIPTIONS[axis]} />
                      </span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-sm bg-[#3c3c3c]">
                        <div
                          className={`h-full rounded-sm ${
                            isDominant ? "bg-[#f14c4c]" : "bg-[#6a6a6a]"
                          }`}
                          style={{ width: `${Math.min(value, 1) * 100}%` }}
                        />
                      </div>
                      <span className="w-8 shrink-0 text-right font-mono text-[10px] text-[#6a6a6a]">
                        {value.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {lineFeedback.reason && (
                <p className="mt-2 text-xs leading-relaxed text-[#cccccc]">
                  {lineFeedback.reason}
                </p>
              )}

              {lineFeedback.context && (
                <p className="mt-1.5 font-mono text-[10px] text-[#6a6a6a]">
                  inside <span className="text-[#969696]">{lineFeedback.context.function}</span>{" "}
                  (lines {lineFeedback.context.span[0]}–{lineFeedback.context.span[1]}) · fn score{" "}
                  {lineFeedback.context.function_score.toFixed(2)}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {snnEnabled && lintEnabled && <div className="my-3 border-t border-[#3c3c3c]" />}

      {lintEnabled && (
        <div className={snnEnabled ? "" : "mt-2.5"}>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#4fc1ff]">Lint</p>
          {!hasLintSignal ? (
            <p className="mt-1 text-xs text-[#6a6a6a]">No findings on this line.</p>
          ) : (
            <ul className="mt-1.5 space-y-1.5">
              {lintFindings.map((f, i) => (
                <li key={`${f.rule}-${i}`} className="text-xs leading-relaxed">
                  <span
                    className={`font-mono text-[10px] font-semibold ${
                      f.severity === "error" ? "text-[#f14c4c]" : "text-[#e2c08d]"
                    }`}
                  >
                    {f.rule}
                  </span>{" "}
                  <span className="text-[#cccccc]">{f.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
