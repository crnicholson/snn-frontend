import { CompileResult, LineFeedback } from "./types";

// Simple seeded RNG so the same code produces stable-ish "gut reactions"
// instead of reshuffling on every keystroke debounce tick.
function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FLAG_THRESHOLD = 0.6;

export async function fakeCompile(code: string): Promise<CompileResult> {
  const lines = code.split("\n");
  const rand = mulberry32(hashSeed(code));

  // Simulate the "reading" latency of a real network + inference call.
  await new Promise((resolve) => setTimeout(resolve, 250 + rand() * 350));

  const feedback: LineFeedback[] = lines.map((text, idx) => {
    const lineNo = idx + 1;
    if (text.trim().length === 0) {
      return { line: lineNo, score: 0, flag: false };
    }

    const indent = text.match(/^\s*/)?.[0].length ?? 0;
    const nestingSignal = Math.min(indent / 16, 1);
    const lengthSignal = Math.min(text.length / 100, 1);
    const noise = rand();

    let score = nestingSignal * 0.45 + lengthSignal * 0.2 + noise * 0.45;
    score = Math.max(0, Math.min(1, score));
    score = Math.round(score * 100) / 100;

    return { line: lineNo, score, flag: score >= FLAG_THRESHOLD };
  });

  const flagged = feedback.filter((f) => f.flag).sort((a, b) => b.score - a.score);
  const topFlagged = flagged.slice(0, 3).map((f) => f.line);

  const verdict =
    flagged.length === 0
      ? "No high-intensity spikes — this reads clean"
      : `${flagged.length} high-intensity spike${flagged.length === 1 ? "" : "s"} detected`;

  return {
    verdict,
    lines: feedback,
    top_flagged: topFlagged,
  };
}
