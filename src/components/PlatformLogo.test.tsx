import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlatformLogo, resolvePlatformIdentity } from "./PlatformLogo";

describe("platform logos", () => {
  it("recognizes common Chinese and international platform aliases", () => {
    expect(resolvePlatformIdentity("aliyun")?.key).toBe("alibaba-cloud");
    expect(resolvePlatformIdentity("OpenAI")?.key).toBe("openai");
    expect(resolvePlatformIdentity("AWS")?.key).toBe("aws");
    expect(resolvePlatformIdentity("", "Kimi 长期 Key")?.key).toBe("moonshot");
  });

  it("recognizes database brands from non-sensitive core fields", () => {
    expect(
      resolvePlatformIdentity("", "生产数据库", [
        { key: "engine", label: "数据库类型", value: "PostgreSQL", sensitive: false },
      ])?.key,
    ).toBe("postgresql");
  });

  it("falls back to the asset-kind icon for an unknown platform", () => {
    render(<PlatformLogo platform="内部系统" title="自建服务" kind="server" />);
    expect(screen.getByTitle("内部系统")).toHaveClass("platform-logo--fallback");
  });
});
