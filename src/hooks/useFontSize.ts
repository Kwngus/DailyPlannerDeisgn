"use client";

import { useState, useEffect } from "react";

export type FontSize = "small" | "medium" | "large";

const SIZE_MAP: Record<FontSize, string> = {
  small: "1rem",
  medium: "1.125rem",
  large: "1.25rem",
};

const STORAGE_KEY = "planner-font-size";

export function useFontSize(): [FontSize, (size: FontSize) => void] {
  const [fontSize, setFontSizeState] = useState<FontSize>("medium");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as FontSize | null;
    if (stored && stored in SIZE_MAP) {
      setFontSizeState(stored);
      document.documentElement.style.setProperty("--base-font-size", SIZE_MAP[stored]);
    }
  }, []);

  function setFontSize(size: FontSize) {
    setFontSizeState(size);
    localStorage.setItem(STORAGE_KEY, size);
    document.documentElement.style.setProperty("--base-font-size", SIZE_MAP[size]);
  }

  return [fontSize, setFontSize];
}
