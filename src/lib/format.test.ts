import { describe, expect, it } from "vitest";
import { formatEnvironment } from "./format";

describe("formatEnvironment", () => {
  it("uses plain Chinese labels for common deployment environments", () => {
    expect(formatEnvironment("prod")).toBe("生产");
    expect(formatEnvironment("Staging")).toBe("预发布");
    expect(formatEnvironment("home")).toBe("home");
  });

  it("uses English labels when the interface is English", () => {
    expect(formatEnvironment("prod", "en-US")).toBe("Production");
    expect(formatEnvironment("Staging", "en-US")).toBe("Staging");
    expect(formatEnvironment("home", "en-US")).toBe("home");
  });
});
