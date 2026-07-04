import { Decoration, DecorationSet, EditorView } from "@codemirror/view";
import { Extension, RangeSetBuilder } from "@codemirror/state";
import { LineFeedback, LintFinding } from "./types";

// Bands follow the backend's score interpretation cheat-sheet:
// <0.5 normal, 0.5-0.7 subtle, 0.7-0.9 warm (hover only), >=0.9 flagged.
function snnStyleFor(fb: LineFeedback): string | null {
  if (fb.score < 0.5) return null;

  if (fb.flag) {
    const alpha = 0.28 + fb.score * 0.32;
    return `background-color: rgba(239, 68, 68, ${alpha}); border-left: 3px solid rgba(239, 68, 68, 0.9);`;
  }

  if (fb.score >= 0.7) {
    const alpha = 0.14 + (fb.score - 0.7) * 0.6;
    return `background-color: rgba(255, 148, 68, ${alpha}); border-left: 2px solid rgba(255, 148, 68, 0.55);`;
  }

  const alpha = 0.06 + (fb.score - 0.5) * 0.4;
  return `background-color: rgba(255, 180, 84, ${alpha});`;
}

function snnTooltipFor(fb: LineFeedback): string | null {
  if (fb.score < 0.5) return null;
  return `SNN: ${fb.reason ?? `score ${fb.score.toFixed(2)}`}`;
}

// Lint findings get their own visual channel (right-edge border) so a line
// flagged by both engines is visibly distinct from one flagged by only one.
function lintStyleFor(findings: LintFinding[]): string {
  const hasError = findings.some((f) => f.severity === "error");
  const color = hasError ? "rgba(79, 193, 255, 0.95)" : "rgba(79, 193, 255, 0.6)";
  return `border-right: 3px solid ${color};`;
}

function lintTooltipFor(findings: LintFinding[]): string {
  return findings.map((f) => `Lint ${f.rule}: ${f.message}`).join("\n");
}

export function heatmapExtension(
  lines: LineFeedback[],
  lintFindings: LintFinding[] = []
): Extension {
  const byLine = new Map(lines.map((l) => [l.line, l]));
  const lintByLine = new Map<number, LintFinding[]>();
  for (const f of lintFindings) {
    lintByLine.set(f.line, [...(lintByLine.get(f.line) ?? []), f]);
  }

  return EditorView.decorations.of((view): DecorationSet => {
    const builder = new RangeSetBuilder<Decoration>();
    const totalLines = view.state.doc.lines;

    for (let i = 1; i <= totalLines; i++) {
      const fb = byLine.get(i);
      const lintHere = lintByLine.get(i);

      const snnStyle = fb ? snnStyleFor(fb) : null;
      const lintStyle = lintHere ? lintStyleFor(lintHere) : null;
      if (!snnStyle && !lintStyle) continue;

      const tooltip = [fb ? snnTooltipFor(fb) : null, lintHere ? lintTooltipFor(lintHere) : null]
        .filter(Boolean)
        .join("\n");

      const line = view.state.doc.line(i);
      builder.add(
        line.from,
        line.from,
        Decoration.line({
          attributes: {
            style: `${snnStyle ?? ""} ${lintStyle ?? ""}`,
            title: tooltip,
          },
        })
      );
    }

    return builder.finish();
  });
}
