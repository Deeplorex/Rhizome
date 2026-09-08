import { useEffect, useRef } from "react";

export function useAutoBackup(
  enabled: boolean,
  scheduleKey: string,
  backup: () => Promise<string | null>,
  onError: (reason: unknown) => void,
) {
  const running = useRef(false);
  const errorHandler = useRef(onError);
  errorHandler.current = onError;
  useEffect(() => {
    if (!enabled || !scheduleKey) return;
    let disposed = false;
    let reported = false;
    const check = async () => {
      if (disposed || running.current) return;
      running.current = true;
      try {
        await backup();
        reported = false;
      } catch (reason) {
        if (!disposed && !reported) {
          errorHandler.current(reason);
          reported = true;
        }
      } finally {
        running.current = false;
      }
    };
    void check();
    const timer = window.setInterval(() => void check(), 60_000);
    window.addEventListener("focus", check);
    return () => {
      disposed = true;
      window.clearInterval(timer);
      window.removeEventListener("focus", check);
    };
  }, [enabled, scheduleKey, backup]);
}
