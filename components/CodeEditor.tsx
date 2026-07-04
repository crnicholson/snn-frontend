"use client";

import CodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { useEffect, useMemo, useRef } from "react";
import { codeMirrorExtension } from "@/lib/language";
import { heatmapExtension } from "@/lib/heatmapExtension";
import { Language, LineFeedback, LintFinding } from "@/lib/types";

const instrumentTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "#1e1e1e",
      height: "100%",
      fontSize: "14px",
    },
    ".cm-content": {
      fontFamily: "var(--font-geist-mono), Consolas, ui-monospace, monospace",
      caretColor: "#aeafad",
    },
    ".cm-gutters": {
      backgroundColor: "#1e1e1e",
      color: "#858585",
      border: "none",
    },
    ".cm-activeLine": {
      backgroundColor: "#2a2d2e",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#2a2d2e",
      color: "#c6c6c6",
    },
    "&.cm-focused": {
      outline: "none",
    },
    ".cm-scroller": {
      overflow: "auto",
    },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
      backgroundColor: "#264f78 !important",
    },
  },
  { dark: true }
);

export type JumpTarget = { line: number; nonce: number };

type Props = {
  code: string;
  onChange: (code: string) => void;
  language: Language;
  lineFeedback: LineFeedback[];
  lintFindings: LintFinding[];
  onSelectLine: (line: number) => void;
  jumpTarget: JumpTarget | null;
};

export default function CodeEditor({
  code,
  onChange,
  language,
  lineFeedback,
  lintFindings,
  onSelectLine,
  jumpTarget,
}: Props) {
  const editorRef = useRef<ReactCodeMirrorRef>(null);

  const selectionListener = useMemo(
    () =>
      EditorView.updateListener.of((update) => {
        if (!update.selectionSet && !update.docChanged) return;
        const head = update.state.selection.main.head;
        onSelectLine(update.state.doc.lineAt(head).number);
      }),
    [onSelectLine]
  );

  const extensions = useMemo(
    () => [
      ...codeMirrorExtension(language),
      heatmapExtension(lineFeedback, lintFindings),
      instrumentTheme,
      selectionListener,
    ],
    [language, lineFeedback, lintFindings, selectionListener]
  );

  useEffect(() => {
    if (!jumpTarget) return;
    const view = editorRef.current?.view;
    if (!view) return;
    const lineNumber = Math.min(Math.max(jumpTarget.line, 1), view.state.doc.lines);
    const line = view.state.doc.line(lineNumber);
    view.dispatch({
      selection: { anchor: line.from, head: line.from },
      effects: EditorView.scrollIntoView(line.from, { y: "center" }),
    });
    view.focus();
    // jumpTarget.nonce makes this fire again even for a repeat click on the
    // same line; the line itself is applied above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpTarget?.nonce]);

  return (
    <CodeMirror
      ref={editorRef}
      value={code}
      onChange={onChange}
      extensions={extensions}
      theme="dark"
      basicSetup={{
        lineNumbers: true,
        foldGutter: false,
        highlightActiveLine: true,
        highlightActiveLineGutter: true,
      }}
      height="100%"
      className="h-full"
    />
  );
}
