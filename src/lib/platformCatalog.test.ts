import { describe, expect, it } from "vitest";
import { normalizePlatformName, platformOptionsFor } from "./platformCatalog";

describe("platform catalog", () => {
  it("provides relevant domestic and international platform choices", () => {
    const apiNames = platformOptionsFor("api_credential").map((option) => option.name);
    expect(apiNames).toContain("OpenAI");
    expect(apiNames).toContain("DeepSeek");
    expect(apiNames).toContain("阿里云");
    expect(apiNames).not.toContain("MongoDB Atlas");
  });

  it("normalizes known aliases while preserving custom platforms", () => {
    expect(normalizePlatformName("aws")).toBe("Amazon Web Services");
    expect(normalizePlatformName("  aliyun ")).toBe("阿里云");
    expect(normalizePlatformName("我的家庭服务器")).toBe("我的家庭服务器");
  });
});
