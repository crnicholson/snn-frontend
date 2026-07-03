"use client";

import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { useMemo } from "react";
import { codeMirrorExtension } from "@/lib/language";
import { heatmapExtension } from "@/lib/heatmapExtension";
import { Language, LineFeedback } from "@/lib/types";

const instrumentTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "#111317",
      height: "100%",
      fontSize: "13.5px",
    },
    ".cm-content": {
      fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
      caretColor: "#ffb454",
    },
    ".cm-gutters": {
      backgroundColor: "#111317",
      color: "#4d525c",
      border: "none",
    },
    ".cm-activeLine": {
      backgroundColor: "rgba(255,255,255,0.03)",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "rgba(255,255,255,0.04)",
      color: "#c7cbd1",
    },
    "&.cm-focused": {
      outline: "none",
    },
    ".cm-scroller": {
      overflow: "auto",
    },
  },
  { dark: true }
);

type Props = {
  code: string;
  onChange: (code: string) => void;
  language: Language;
  lineFeedback: LineFeedback[];
};

export default function CodeEditor({ code, onChange, language, lineFeedback }: Props) {
  const extensions = useMemo(
    () => [...codeMirrorExtension(language), heatmapExtension(lineFeedback), instrumentTheme],
    [language, lineFeedback]
  );

  return (
    <CodeMirror
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
