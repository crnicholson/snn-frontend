"use client";

import { useEffect, useRef, useState } from "react";
import CodeEditor from "./CodeEditor";
import TopBar from "./TopBar";
import VerdictBanner from "./VerdictBanner";
import SpikeTimeline from "./SpikeTimeline";
import { fakeCompile } from "@/lib/fakeCompile";
import { serverCompile } from "@/lib/serverCompile";
import {
  loadCode,
  loadLanguage,
  loadSettings,
  saveCode,
  saveLanguage,
  saveSettings,
} from "@/lib/storage";
import { CompileResult, Language, Settings } from "@/lib/types";

const DEBOUNCE_MS = 500;

export default function IntuitionCompiler() {
  const [ready, setReady] = useState(false);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<Language>("python");
  const [settings, setSettings] = useState<Settings>({ mode: "fake", serverUrl: "" });

  const [result, setResult] = useState<CompileResult | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionOk, setConnectionOk] = useState<boolean | null>(null);
  const [runId, setRunId] = useState(0);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestSeq = useRef(0);

  // Hydrate from localStorage on mount only, deferred past the first paint
  // so the client's initial render matches the server (no localStorage there).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setCode(loadCode());
    setLanguage(loadLanguage());
    setSettings(loadSettings());
    setReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (ready) saveCode(code);
  }, [code, ready]);

  useEffect(() => {
    if (ready) saveLanguage(language);
  }, [language, ready]);

  useEffect(() => {
    if (ready) saveSettings(settings);
  }, [settings, ready]);

  async function runCompile() {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const seq = ++requestSeq.current;
    setIsCompiling(true);
    setError(null);

    try {
      const res =
        settings.mode === "fake"
          ? await fakeCompile(code)
          : await serverCompile(code, language, settings.serverUrl, controller.signal);

      if (seq !== requestSeq.current) return;
      setResult(res);
      setRunId((n) => n + 1);
      if (settings.mode === "server") setConnectionOk(true);
    } catch (err) {
      if (controller.signal.aborted) return;
      if (seq !== requestSeq.current) return;
      setError(err instanceof Error ? err.message : "Compile failed");
      if (settings.mode === "server") setConnectionOk(false);
    } finally {
      if (seq === requestSeq.current) setIsCompiling(false);
    }
  }

  // Debounced auto-compile whenever code, language, or mode/server changes.
  useEffect(() => {
    if (!ready || !code.trim()) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      runCompile();
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, language, settings.mode, settings.serverUrl, ready]);

  function handleFileLoaded(fileCode: string, fileLanguage: Language) {
    setCode(fileCode);
    setLanguage(fileLanguage);
  }

  if (!ready) {
    return <div className="flex h-full items-center justify-center bg-[#0a0b0d]" />;
  }

  const hasCode = code.trim().length > 0;

  return (
    <div className="flex h-full flex-col bg-[#0a0b0d]">
      <TopBar
        language={language}
        onLanguageChange={setLanguage}
        settings={settings}
        onSettingsChange={setSettings}
        onFileLoaded={handleFileLoaded}
        connectionOk={connectionOk}
      />
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 lg:flex-row">
        <div className="min-h-[320px] flex-1 overflow-hidden rounded-md border border-[#22262b]">
          <CodeEditor
            code={code}
            onChange={setCode}
            language={language}
            lineFeedback={hasCode ? (result?.lines ?? []) : []}
          />
        </div>
        <div className="flex w-full flex-col gap-3 lg:w-[340px]">
          <VerdictBanner
            result={hasCode ? result : null}
            isCompiling={hasCode && isCompiling}
            error={hasCode ? error : null}
          />
          <SpikeTimeline lines={hasCode ? (result?.lines ?? []) : []} runId={runId} />
        </div>
      </div>
    </div>
  );
}
