import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlatformLogo, resolvePlatformIdentity } from "./PlatformLogo";

describe("platform logos", () => {
  it("recognizes common Chinese and international platform aliases", () => {
    expect(resolvePlatformIdentity("aliyun")?.key).toBe("alibaba-cloud");
    expect(resolvePlatformIdentity("OpenAI")?.key).toBe("openai");
    expect(resolvePlatformIdentity("AWS")?.key).toBe("aws");
    expect(resolvePlatformIdentity("", "Kimi 长期 Key")?.key).toBe("moonshot");
    expect(resolvePlatformIdentity("", "GPT-4 API")?.key).toBe("openai");
  });

  it("recognizes database brands from non-sensitive core fields", () => {
    expect(
      resolvePlatformIdentity("", "生产数据库", [
        { key: "engine", label: "数据库类型", value: "PostgreSQL", sensitive: false },
      ])?.key,
    ).toBe("postgresql");
  });

  it.each([
    ["Figma", "Figma", "sample@gmail.com", "figma"],
    ["Twitter", "Sample account", "sample@gmail.com", "x"],
    ["X", "Sample account", "sample@gmail.com", "x"],
    ["小红书", "小红书开放平台", "sample@examplex.com", "xiaohongshu"],
  ])("identifies %s independently of the login email", (platform, title, email, key) => {
    expect(
      resolvePlatformIdentity(platform, title, [
        { key: "username", label: "用户名", value: email, sensitive: false },
      ])?.key,
    ).toBe(key);
  });

  it("prioritizes the platform over the title and database engine", () => {
    expect(
      resolvePlatformIdentity("GitHub", "Google sign-in", [
        { key: "engine", label: "数据库类型", value: "PostgreSQL", sensitive: false },
      ])?.key,
    ).toBe("github");
  });

  it("ignores account fields, custom labels and sensitive engine values", () => {
    expect(
      resolvePlatformIdentity("内部系统", "测试账号", [
        { key: "username", label: "Google 邮箱", value: "sample@gmail.com", sensitive: false },
        { key: "custom", label: "GitHub", value: "twitter", sensitive: false },
        { key: "engine", label: "数据库类型", value: "PostgreSQL", sensitive: true },
      ]),
    ).toBeUndefined();
  });

  it.each([
    "examplex.com",
    "https://examplex.com",
    "x.company",
    "x.com.example.org",
    "metadata",
    "Dawson",
  ])("does not match a brand inside unrelated text: %s", (value) => {
    expect(resolvePlatformIdentity(value)).toBeUndefined();
  });

  it("still recognizes platform domains and names within descriptive titles", () => {
    expect(resolvePlatformIdentity("https://x.com/sample")?.key).toBe("x");
    expect(resolvePlatformIdentity("https://www.x.com/sample")?.key).toBe("x");
    expect(resolvePlatformIdentity("", "Figma 设计账号")?.key).toBe("figma");
    expect(resolvePlatformIdentity("", "小红书开放平台")?.key).toBe("xiaohongshu");
    expect(resolvePlatformIdentity("", "sample@gmail.com")).toBeUndefined();
  });

  it.each([
    ["provider", "aliyun", "alibaba-cloud"],
    ["login_url", "https://x.com/login", "x"],
  ])("uses the non-sensitive %s field as a fallback", (field, value, key) => {
    expect(
      resolvePlatformIdentity("", "测试账号", [
        { key: field, label: "GitHub", value, sensitive: false },
      ])?.key,
    ).toBe(key);
  });

  it.each([
    ["Figma", "Figma"],
    ["Twitter", "X"],
    ["小红书", "小红书"],
  ])("renders the %s brand icon with an email username", (platform, label) => {
    render(
      <PlatformLogo
        platform={platform}
        kind="web_account"
        coreFields={[
          { key: "username", label: "用户名", value: "sample@gmail.com", sensitive: false },
        ]}
      />,
    );
    expect(screen.getByTitle(label)).toHaveClass("platform-logo--brand");
    expect(screen.getByTitle(label).querySelector("svg path")).toBeInTheDocument();
  });

  it("falls back to the asset-kind icon for an unknown platform", () => {
    render(<PlatformLogo platform="内部系统" title="自建服务" kind="server" />);
    expect(screen.getByTitle("内部系统")).toHaveClass("platform-logo--fallback");
  });
});
