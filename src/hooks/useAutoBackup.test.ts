import { act, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useAutoBackup } from "./useAutoBackup";

afterEach(() => vi.useRealTimers());
it("checks immediately on unlock and periodically, stops when locked or unmounted", async () => {
  vi.useFakeTimers();
  const backup = vi.fn().mockResolvedValue(null);
  const error = vi.fn();
  const { rerender, unmount } = renderHook(
    ({ enabled }) => useAutoBackup(enabled, "vault", backup, error),
    { initialProps: { enabled: false } },
  );
  expect(backup).not.toHaveBeenCalled();
  await act(async () => rerender({ enabled: true }));
  expect(backup).toHaveBeenCalledTimes(1);
  await act(async () => vi.advanceTimersByTimeAsync(60_000));
  expect(backup).toHaveBeenCalledTimes(2);
  rerender({ enabled: false });
  await act(async () => vi.advanceTimersByTimeAsync(120_000));
  expect(backup).toHaveBeenCalledTimes(2);
  await act(async () => rerender({ enabled: true }));
  expect(backup).toHaveBeenCalledTimes(3);
  unmount();
  await act(async () => vi.advanceTimersByTimeAsync(60_000));
  expect(backup).toHaveBeenCalledTimes(3);
});
it("prevents overlapping exports, reports failure once and retries", async () => {
  vi.useFakeTimers();
  let reject: (reason: Error) => void = () => {};
  const backup = vi.fn().mockImplementation(
    () =>
      new Promise<string | null>((_resolve, fail) => {
        reject = fail;
      }),
  );
  const error = vi.fn();
  const { unmount } = renderHook(() => useAutoBackup(true, "vault", backup, error));
  await act(async () => vi.advanceTimersByTimeAsync(120_000));
  expect(backup).toHaveBeenCalledTimes(1);
  await act(async () => reject(new Error("disk full")));
  backup.mockRejectedValue(new Error("disk full"));
  await act(async () => vi.advanceTimersByTimeAsync(120_000));
  expect(backup).toHaveBeenCalledTimes(3);
  expect(error).toHaveBeenCalledTimes(1);
  unmount();
});
