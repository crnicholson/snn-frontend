import { Language, LintFinding } from "./types";

// A small stand-in for a real static-analysis linter (think flake8/pyflakes).
// Unlike the SNN, it never "reads" the code — it pattern-matches known rules
// and is right or wrong with 100% confidence, never a probability.
const MAX_LINE_LENGTH = 79;
const MAX_BRANCHES = 4;

const BUILTIN_NAMES = new Set([
  "self", "cls", "args", "kwargs", "_", "__", "___",
]);

function stripStringsAndComments(line: string): string {
  // Rough enough for line-local heuristics — not a real tokenizer.
  return line.replace(/#.*/, "").replace(/(["'])(?:(?!\1).)*\1/g, '""');
}

function findImports(lines: string[]): { line: number; names: string[] }[] {
  const imports: { line: number; names: string[] }[] = [];
  lines.forEach((raw, idx) => {
    const line = raw.trim();
    const fromImport = line.match(/^from\s+[\w.]+\s+import\s+(.+)$/);
    const plainImport = line.match(/^import\s+(.+)$/);
    const match = fromImport ?? plainImport;
    if (!match) return;
    const names = match[1]
      .split(",")
      .map((part) => part.trim().split(/\s+as\s+/).pop()?.trim() ?? "")
      .filter(Boolean)
      .filter((n) => n !== "*");
    if (names.length) imports.push({ line: idx + 1, names });
  });
  return imports;
}

function findUnusedImports(lines: string[]): LintFinding[] {
  const imports = findImports(lines);
  const findings: LintFinding[] = [];
  imports.forEach(({ line, names }) => {
    names.forEach((name) => {
      const usagePattern = new RegExp(`\\b${name}\\b`, "g");
      const usages = lines.reduce((count, l, idx) => {
        if (idx + 1 === line) return count;
        return count + (l.match(usagePattern)?.length ?? 0);
      }, 0);
      if (usages === 0) {
        findings.push({
          line,
          rule: "F401",
          message: `'${name}' imported but unused`,
          severity: "warning",
        });
      }
    });
  });
  return findings;
}

function findUnusedAssignments(lines: string[]): LintFinding[] {
  const findings: LintFinding[] = [];
  lines.forEach((raw, idx) => {
    const line = raw.trim();
    // Only plain `name = expr` assignments — skip augmented, comparisons,
    // for/with targets, and keyword args, which need real scope analysis.
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s=(?!=)\s*(.+)$/);
    if (!match) return;
    const name = match[1];
    if (BUILTIN_NAMES.has(name) || name.startsWith("_")) return;

    const usagePattern = new RegExp(`\\b${name}\\b`, "g");
    const usedElsewhere = lines.some((l, i) => {
      if (i === idx) return false;
      return usagePattern.test(l);
    });
    if (!usedElsewhere) {
      findings.push({
        line: idx + 1,
        rule: "F841",
        message: `local variable '${name}' is assigned to but never used`,
        severity: "warning",
      });
    }
  });
  return findings;
}

function findLineLength(lines: string[]): LintFinding[] {
  return lines
    .map((line, idx) => ({ line: idx + 1, length: line.length }))
    .filter((l) => l.length > MAX_LINE_LENGTH)
    .map((l) => ({
      line: l.line,
      rule: "E501",
      message: `line too long (${l.length} > ${MAX_LINE_LENGTH} characters)`,
      severity: "warning" as const,
    }));
}

function findBareExcept(lines: string[]): LintFinding[] {
  const findings: LintFinding[] = [];
  lines.forEach((raw, idx) => {
    if (/^\s*except\s*:/.test(raw)) {
      findings.push({
        line: idx + 1,
        rule: "E722",
        message: "do not use bare 'except'",
        severity: "error",
      });
    }
  });
  return findings;
}

function findNoneComparisons(lines: string[]): LintFinding[] {
  const findings: LintFinding[] = [];
  lines.forEach((raw, idx) => {
    const stripped = stripStringsAndComments(raw);
    if (/[=!]=\s*None\b/.test(stripped) || /\bNone\s*[=!]=/.test(stripped)) {
      findings.push({
        line: idx + 1,
        rule: "E711",
        message: "comparison to None should use 'is' / 'is not'",
        severity: "warning",
      });
    }
    if (/[=!]=\s*(True|False)\b/.test(stripped)) {
      findings.push({
        line: idx + 1,
        rule: "E712",
        message: "comparison to True/False should use truthiness or 'is'",
        severity: "warning",
      });
    }
  });
  return findings;
}

function findMutableDefaults(lines: string[]): LintFinding[] {
  const findings: LintFinding[] = [];
  lines.forEach((raw, idx) => {
    const match = raw.match(/^\s*def\s+\w+\s*\(([^)]*)\)/);
    if (!match) return;
    if (/=\s*(\[\]|\{\}|\(\))/.test(match[1])) {
      findings.push({
        line: idx + 1,
        rule: "B006",
        message: "mutable default argument (list/dict/set)",
        severity: "error",
      });
    }
  });
  return findings;
}

function findComplexFunctions(lines: string[]): LintFinding[] {
  const findings: LintFinding[] = [];
  let defLine = -1;
  let defIndent = -1;
  let branchCount = 0;

  function flush() {
    if (defLine !== -1 && branchCount > MAX_BRANCHES) {
      findings.push({
        line: defLine + 1,
        rule: "C901",
        message: `function is too complex (${branchCount} branch points) — SNN's "complexity" axis usually agrees here`,
        severity: "warning",
      });
    }
  }

  lines.forEach((raw, idx) => {
    const indent = raw.match(/^\s*/)?.[0].length ?? 0;
    const defMatch = raw.match(/^(\s*)def\s+\w+/);
    if (defMatch) {
      flush();
      defLine = idx;
      defIndent = defMatch[1].length;
      branchCount = 0;
      return;
    }
    if (defLine === -1 || raw.trim().length === 0) return;
    if (indent <= defIndent) {
      flush();
      defLine = -1;
      return;
    }
    if (/^\s*(if|elif|for|while|except)\b/.test(raw)) branchCount += 1;
  });
  flush();

  return findings;
}

function findTrailingWhitespace(lines: string[]): LintFinding[] {
  return lines
    .map((line, idx) => ({ line: idx + 1, trailing: /[ \t]+$/.test(line) }))
    .filter((l) => l.trailing)
    .map((l) => ({
      line: l.line,
      rule: "W291",
      message: "trailing whitespace",
      severity: "warning" as const,
    }));
}

// Pretends to be a small flake8/pyflakes-style checker. It only understands
// Python syntax; other languages get no findings rather than false positives.
export function fakeLint(code: string, language: Language): LintFinding[] {
  if (language !== "python") return [];

  const lines = code.split("\n");
  const findings = [
    ...findUnusedImports(lines),
    ...findUnusedAssignments(lines),
    ...findLineLength(lines),
    ...findBareExcept(lines),
    ...findNoneComparisons(lines),
    ...findMutableDefaults(lines),
    ...findComplexFunctions(lines),
    ...findTrailingWhitespace(lines),
  ];

  return findings.sort((a, b) => a.line - b.line || a.rule.localeCompare(b.rule));
}
