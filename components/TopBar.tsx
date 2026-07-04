"use client";

import { useRef } from "react";
import { LANGUAGE_OPTIONS, languageFromFilename } from "@/lib/language";
import { HealthResponse, Language, Mode, Settings } from "@/lib/types";
import MrSpikyMascot from "./MrSpikyMascot";

type Props = {
  language: Language;
  onLanguageChange: (l: Language) => void;
  settings: Settings;
  onSettingsChange: (s: Settings) => void;
  onFileLoaded: (code: string, language: Language) => void;
  health: HealthResponse | null;
  healthError: string | null;
};

export default function TopBar({
  language,
  onLanguageChange,
  settings,
  onSettingsChange,
  onFileLoaded,
  health,
  healthError,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    onFileLoaded(text, languageFromFilename(file.name));
    e.target.value = "";
  }

  function setMode(mode: Mode) {
    onSettingsChange({ ...settings, mode });
  }

  const dotColor = healthError
    ? "bg-(--danger)"
    : health?.mode === "mock"
      ? "bg-(--warning)"
      : health
        ? "bg-(--success)"
        : "bg-(--text-muted)";

  return (
    <div className="flex shrink-0 flex-col">
      {/* Title bar */}
      <div className="relative flex h-8 shrink-0 items-center justify-center gap-1.5 bg-(--bg-elevated) px-3">
        <MrSpikyMascot mood="curious" className="h-5 w-5 shrink-0" />
        <p className="text-xs text-(--text-secondary)">Mr. Spiky — Intuition Compiler</p>
      </div>

      {/* Tab / toolbar strip */}
      <header className="flex flex-wrap items-center gap-2 border-b border-[color-mix(in_srgb,black_40%,transparent)] bg-(--bg-surface) px-2 py-1.5">
        <div className="flex items-center overflow-hidden rounded-sm border border-(--border-strong)">
          <button
            onClick={() => setMode("fake")}
            className={`px-3 py-1 text-xs transition-colors ${
              settings.mode === "fake"
                ? "bg-(--bg-base) text-(--text-bright)"
                : "bg-(--bg-surface-alt) text-(--text-secondary) hover:text-(--text-primary)"
            }`}
          >
            fake
          </button>
          <button
            onClick={() => setMode("server")}
            className={`border-l border-(--border-strong) px-3 py-1 text-xs transition-colors ${
              settings.mode === "server"
                ? "bg-(--bg-base) text-(--text-bright)"
                : "bg-(--bg-surface-alt) text-(--text-secondary) hover:text-(--text-primary)"
            }`}
          >
            server
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <label
            className={`flex cursor-pointer items-center gap-1.5 rounded-sm border px-2 py-1 text-xs font-medium transition-colors ${
              settings.snnEnabled
                ? "border-[color-mix(in_srgb,var(--danger)_50%,transparent)] bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] text-(--danger-light)"
                : "border-(--border-strong) text-(--text-muted) hover:text-(--text-secondary)"
            }`}
          >
            <input
              type="checkbox"
              checked={settings.snnEnabled}
              onChange={(e) => onSettingsChange({ ...settings, snnEnabled: e.target.checked })}
              className="accent-(--danger)"
            />
            SNN
          </label>
          <label
            className={`flex cursor-pointer items-center gap-1.5 rounded-sm border px-2 py-1 text-xs font-medium transition-colors ${
              settings.lintEnabled
                ? "border-[color-mix(in_srgb,var(--info)_50%,transparent)] bg-[color-mix(in_srgb,var(--info)_10%,transparent)] text-(--info)"
                : "border-(--border-strong) text-(--text-muted) hover:text-(--text-secondary)"
            }`}
          >
            <input
              type="checkbox"
              checked={settings.lintEnabled}
              onChange={(e) => onSettingsChange({ ...settings, lintEnabled: e.target.checked })}
              className="accent-(--info)"
            />
            Lint
          </label>
        </div>

        {settings.mode === "server" && (
          <div className="flex items-center gap-1.5">
            <span
              className={`h-1.5 w-1.5 rounded-full ${dotColor}`}
              title={healthError ?? (health ? `mode: ${health.mode}` : "not connected")}
            />
            <input
              value={settings.serverUrl}
              onChange={(e) => onSettingsChange({ ...settings, serverUrl: e.target.value })}
              placeholder="http://localhost:8000"
              className="w-56 rounded-sm border border-(--border) bg-(--bg-surface-alt) px-2 py-1 text-xs text-(--text-primary) outline-none focus:border-(--accent-strong)"
            />
            {health && (
              <span className="rounded-sm border border-(--border-strong) px-1.5 py-0.5 font-mono text-[10px] uppercase text-(--text-secondary)">
                {health.mode}
              </span>
            )}
          </div>
        )}

        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value as Language)}
          className="rounded-sm border border-(--border) bg-(--bg-surface-alt) px-2 py-1 text-xs text-(--text-primary) outline-none focus:border-(--accent-strong)"
        >
          {LANGUAGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="rounded-sm bg-(--accent) px-3 py-1 text-xs text-(--text-bright) transition-colors hover:bg-(--accent-strong)"
        >
          Open File...
        </button>
        <input ref={fileInputRef} type="file" onChange={handleFile} className="hidden" />
      </header>
    </div>
  );
}
