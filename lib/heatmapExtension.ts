import { Decoration, DecorationSet, EditorView } from "@codemirror/view";
import { Extension, RangeSetBuilder } from "@codemirror/state";
import { LineFeedback } from "./types";

export function heatmapExtension(lines: LineFeedback[]): Extension {
  const byLine = new Map(lines.map((l) => [l.line, l]));

  return EditorView.decorations.of((view): DecorationSet => {
    const builder = new RangeSetBuilder<Decoration>();
    const totalLines = view.state.doc.lines;

    for (let i = 1; i <= totalLines; i++) {
      const fb = byLine.get(i);
      if (!fb || fb.score <= 0.02) continue;

      const alpha = Math.min(fb.score, 1) * 0.5;
      const style = fb.flag
        ? `background-color: rgba(239, 68, 68, ${alpha}); border-left: 3px solid rgba(239, 68, 68, 0.9);`
        : `background-color: rgba(239, 68, 68, ${alpha * 0.5});`;

      const line = view.state.doc.line(i);
      builder.add(
        line.from,
        line.from,
        Decoration.line({ attributes: { style } })
      );
    }

    return builder.finish();
  });
}
