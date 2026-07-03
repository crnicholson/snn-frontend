export type LineFeedback = {
  line: number;
  score: number;
  flag: boolean;
};

export type CompileResult = {
  verdict: string;
  lines: LineFeedback[];
  top_flagged: number[];
};

export type Mode = "fake" | "server";

export type Settings = {
  mode: Mode;
  serverUrl: string;
};

export type Language =
  | "javascript"
  | "typescript"
  | "python"
  | "cpp"
  | "java"
  | "rust"
  | "go"
  | "text";
