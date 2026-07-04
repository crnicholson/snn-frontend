"use client";

import { CompileResult, HealthResponse, Language, LintFinding, Settings } from "@/lib/types";

type Props = {
  settings: Settings;
  language: Language;
  health: HealthResponse | null;
  healthError: string | null;
  result: CompileResult | null;
  lintFindings: LintFinding[];
  selectedLine: number | null;
};

const LANGUAGE_LABEL: Record<Language, string> = {
  python: "Python",
  javascript: "JavaScript",
  typescript: "TypeScript",
  cpp: "C++",
  java: "Java",
  rust: "Rust",
  go: "Go",
  text: "Plain text",
};

export default function StatusBar({
  settings,
  language,
  health,
  healthError,
  result,
  lintFindings,
  selectedLine,
}: Props) {
  const hasFlags = !!result && result.top_flagged.length > 0;
  const isServerBad = settings.mode === "server" && (healthError || health?.mode === "mock");

  return (
    <footer
      className={`flex h-[22px] shrink-0 items-center justify-between px-2 text-[11px] text-white ${
        isServerBad ? "bg-[#cca700] text-[#1e1e1e]" : "bg-[#007acc]"
      }`}
    >
      <div className="flex items-center gap-3">
        {settings.snnEnabled && (
          <span className="flex items-center gap-1">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                healthError
                  ? "bg-[#f14c4c]"
                  : health?.mode === "mock"
                    ? "bg-[#1e1e1e]"
                    : "bg-white"
              }`}
            />
            {settings.mode === "fake" ? "fake mode" : health ? `server · ${health.mode}` : "server · offline"}
          </span>
        )}
        {settings.snnEnabled && result && (
          <span>SNN: {hasFlags ? `⚠ ${result.top_flagged.length} flagged` : "✓ no flags"}</span>
        )}
        {settings.lintEnabled && (
          <span>
            Lint: {lintFindings.length > 0 ? `⚠ ${lintFindings.length} finding${lintFindings.length === 1 ? "" : "s"}` : "✓ clean"}
          </span>
        )}
        {!settings.snnEnabled && !settings.lintEnabled && <span>no engines enabled</span>}
      </div>
      <div className="flex items-center gap-3">
        {selectedLine !== null && <span>Ln {selectedLine}</span>}
        <span>{LANGUAGE_LABEL[language]}</span>
        <span>UTF-8</span>
      </div>
    </footer>
  );
}
