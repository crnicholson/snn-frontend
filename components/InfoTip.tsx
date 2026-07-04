"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  text: string;
};

export default function InfoTip({ text }: Props) {
  const iconRef = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);

  function show() {
    const rect = iconRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
  }

  function hide() {
    setPos(null);
  }

  return (
    <>
      <span
        ref={iconRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        className="inline-flex h-3 w-3 shrink-0 cursor-help select-none items-center justify-center rounded-full border border-current text-[7px] font-mono leading-none opacity-70 hover:opacity-100"
      >
        i
      </span>
      {pos &&
        createPortal(
          <div
            role="tooltip"
            style={{ top: pos.top, right: pos.right }}
            className="fixed z-50 w-64 rounded-sm border border-(--border-strong) bg-(--bg-base) p-2 text-left text-[10px] font-sans font-normal normal-case leading-relaxed text-(--text-primary) shadow-lg"
          >
            {text}
          </div>,
          document.body
        )}
    </>
  );
}
