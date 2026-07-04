export type AxisKey =
  | "complexity"
  | "tangled_state"
  | "hidden_calls"
  | "exception_surface"
  | "naming"
  | "malformed";

export const AXIS_LABELS: Record<AxisKey, string> = {
  complexity: "complexity",
  tangled_state: "tangled state",
  hidden_calls: "hidden calls",
  exception_surface: "exception surface",
  naming: "naming",
  malformed: "malformed",
};

export const SCORE_DESCRIPTION =
  "The line's overall suspicion score: how much this line's spiking activity " +
  "deviates from what the SNN sees as \"normal\" for senior, real-world Python " +
  "(percentile rank against a reference corpus). Lines are only flagged well " +
  "above the middle of that range.";

export const AXIS_DESCRIPTIONS: Record<AxisKey, string> = {
  complexity:
    "Blends nesting depth, cyclomatic branching (if/for/while/try/etc.), and raw length. " +
    "A higher value means this line sits inside noticeably deep or branchy control flow — " +
    "more tangled than a typical straight-line statement.",
  tangled_state:
    "Measures how far a variable's use is from where it was defined, plus how many distinct " +
    "names get touched at once. A high value flags \"spooky action at a distance\" — this line " +
    "depends on state that was set up much earlier or reaches across a lot of names, making it " +
    "harder to reason about in isolation.",
  hidden_calls:
    "Reflects how much this line delegates to calls whose implementation isn't visible right " +
    "here — local/unresolved function calls and method calls weigh more than built-ins like " +
    "len() or range(). A high value means a lot of the line's real behavior is hidden behind " +
    "calls elsewhere.",
  exception_surface:
    "Tracks density of try/except/raise machinery around this line relative to the surrounding " +
    "code's size. A higher value means there's meaningful exception handling nearby, worth a " +
    "second look at what's being caught (and whether it's too broad).",
  naming:
    "Combines token entropy and identifier-character entropy — essentially how varied or " +
    "inconsistent the names and tokens on this line are compared to typical, well-named code.",
  malformed:
    "Whether this line parses as valid Python at all. A dedicated channel, separate from the " +
    "SNN's learned signal — if the line doesn't parse, this axis is forced to 1.0 and the line " +
    "is flagged regardless of what the other axes say.",
};

export type Axes = Record<AxisKey, number>;

export type RawFeatures = {
  nesting_depth: number;
  length: number;
  token_entropy: number;
  naming_entropy: number;
  cyclomatic_proxy: number;
  use_def_distance: number;
  name_flow: number;
  call_graph_shape: number;
  exception_density: number;
  parse_error: number;
  global_reach: number;
  attr_reach: number;
  call_graph_depth: number;
};

export type LineageEntry = {
  kind: string;
  label: string;
  line: number;
};

export type LineContext = {
  function: string;
  span: [number, number];
  function_score: number;
  function_score_before?: number;
  function_score_delta?: number;
  lineage?: LineageEntry[];
};

export type LineFeedback = {
  line: number;
  score: number;
  flag: boolean;
  axes: Axes;
  reason?: string;
  context?: LineContext;
  raw_features?: RawFeatures;
};

export type CompileResult = {
  verdict: string;
  dominant_axis: AxisKey | null;
  top_flagged: number[];
  lines: LineFeedback[];
};

export type HealthMode = "snn" | "mock";

export type HealthResponse = {
  status: string;
  supported_languages: string[];
  mode: HealthMode;
  threshold: number;
  hidden_size?: number;
  output_size?: number;
  hidden_baselines_distinct?: number;
  ecdf_reference_size?: number;
  reason?: string;
};

export type Mode = "fake" | "server";

export type Settings = {
  mode: Mode;
  serverUrl: string;
  snnEnabled: boolean;
  lintEnabled: boolean;
};

export type LintSeverity = "error" | "warning";

export type LintFinding = {
  line: number;
  rule: string;
  message: string;
  severity: LintSeverity;
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
