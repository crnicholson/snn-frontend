"use client";

import { useRef } from "react";
import { LANGUAGE_OPTIONS, languageFromFilename } from "@/lib/language";
import { HealthResponse, Language, Mode, Settings } from "@/lib/types";

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
    ? "bg-[#f14c4c]"
    : health?.mode === "mock"
      ? "bg-[#cca700]"
      : health
        ? "bg-[#89d185]"
        : "bg-[#6a6a6a]";

  return (
    <div className="flex shrink-0 flex-col">
      {/* Title bar */}
      <div className="relative flex h-8 shrink-0 items-center justify-center bg-[#3c3c3c] px-3">
        <p className="text-xs text-[#cccccc]/80">Mr. Spiky — Intuition Compiler</p>
      </div>

      {/* Tab / toolbar strip */}
      <header className="flex flex-wrap items-center gap-2 border-b border-[#000000]/40 bg-[#252526] px-2 py-1.5">
        <div className="flex items-center overflow-hidden rounded-sm border border-[#454545]">
          <button
            onClick={() => setMode("fake")}
            className={`px-3 py-1 text-xs transition-colors ${
              settings.mode === "fake"
                ? "bg-[#1e1e1e] text-[#ffffff]"
                : "bg-[#2d2d2d] text-[#969696] hover:text-[#cccccc]"
            }`}
          >
            fake
          </button>
          <button
            onClick={() => setMode("server")}
            className={`border-l border-[#454545] px-3 py-1 text-xs transition-colors ${
              settings.mode === "server"
                ? "bg-[#1e1e1e] text-[#ffffff]"
                : "bg-[#2d2d2d] text-[#969696] hover:text-[#cccccc]"
            }`}
          >
            server
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <label
            className={`flex cursor-pointer items-center gap-1.5 rounded-sm border px-2 py-1 text-xs font-medium transition-colors ${
              settings.snnEnabled
                ? "border-[#f14c4c]/50 bg-[#f14c4c]/10 text-[#f48771]"
                : "border-[#454545] text-[#6a6a6a] hover:text-[#969696]"
            }`}
          >
            <input
              type="checkbox"
              checked={settings.snnEnabled}
              onChange={(e) => onSettingsChange({ ...settings, snnEnabled: e.target.checked })}
              className="accent-[#f14c4c]"
            />
            SNN
          </label>
          <label
            className={`flex cursor-pointer items-center gap-1.5 rounded-sm border px-2 py-1 text-xs font-medium transition-colors ${
              settings.lintEnabled
                ? "border-[#4fc1ff]/50 bg-[#4fc1ff]/10 text-[#4fc1ff]"
                : "border-[#454545] text-[#6a6a6a] hover:text-[#969696]"
            }`}
          >
            <input
              type="checkbox"
              checked={settings.lintEnabled}
              onChange={(e) => onSettingsChange({ ...settings, lintEnabled: e.target.checked })}
              className="accent-[#4fc1ff]"
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
              className="w-56 rounded-sm border border-[#3c3c3c] bg-[#3c3c3c] px-2 py-1 text-xs text-[#cccccc] outline-none focus:border-[#007fd4]"
            />
            {health && (
              <span className="rounded-sm border border-[#454545] px-1.5 py-0.5 font-mono text-[10px] uppercase text-[#969696]">
                {health.mode}
              </span>
            )}
          </div>
        )}

        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value as Language)}
          className="rounded-sm border border-[#3c3c3c] bg-[#3c3c3c] px-2 py-1 text-xs text-[#cccccc] outline-none focus:border-[#007fd4]"
        >
          {LANGUAGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="rounded-sm bg-[#0e639c] px-3 py-1 text-xs text-white transition-colors hover:bg-[#1177bb]"
        >
          Open File...
        </button>
        <input ref={fileInputRef} type="file" onChange={handleFile} className="hidden" />
      </header>
    </div>
  );
}
