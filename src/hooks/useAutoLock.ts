import { useEffect, useRef } from "react";

export function useAutoLock(minutes: number, enabled: boolean, onLock: () => void): void {
  const callback = useRef(onLock);
  callback.current = onLock;

  useEffect(() => {
    if (!enabled || minutes <= 0) return;
    let timer = window.setTimeout(() => callback.current(), minutes * 60_000);
    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => callback.current(), minutes * 60_000);
    };
    const events: Array<keyof WindowEventMap> = ["pointerdown", "keydown", "wheel"];
    for (const event of events) window.addEventListener(event, reset, { passive: true });
    const lockWhenHidden = () => {
      if (document.visibilityState === "hidden") callback.current();
    };
    document.addEventListener("visibilitychange", lockWhenHidden);
    return () => {
      window.clearTimeout(timer);
      for (const event of events) window.removeEventListener(event, reset);
      document.removeEventListener("visibilitychange", lockWhenHidden);
    };
  }, [enabled, minutes]);
}
