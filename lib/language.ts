import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { rust } from "@codemirror/lang-rust";
import { go } from "@codemirror/lang-go";
import { Extension } from "@codemirror/state";
import { Language } from "./types";

export const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "text", label: "Plain text" },
];

const EXTENSION_MAP: Record<string, Language> = {
  py: "python",
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  ts: "typescript",
  tsx: "typescript",
  cpp: "cpp",
  cc: "cpp",
  cxx: "cpp",
  h: "cpp",
  hpp: "cpp",
  c: "cpp",
  java: "java",
  rs: "rust",
  go: "go",
};

export function languageFromFilename(filename: string): Language {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_MAP[ext] ?? "text";
}

export function codeMirrorExtension(language: Language): Extension[] {
  switch (language) {
    case "python":
      return [python()];
    case "javascript":
      return [javascript({ jsx: true })];
    case "typescript":
      return [javascript({ jsx: true, typescript: true })];
    case "cpp":
      return [cpp()];
    case "java":
      return [java()];
    case "rust":
      return [rust()];
    case "go":
      return [go()];
    default:
      return [];
  }
}
