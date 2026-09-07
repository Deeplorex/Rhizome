import type { AssetKind } from "../types";
import { KIND_LABELS } from "./assetTemplates";
import { type AppLanguage, translate } from "./i18n";

export function formatDate(value?: string | null, language: AppLanguage = "zh-CN"): string {
  if (!value) return translate("未设置", language);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat(language, { dateStyle: "medium" }).format(parsed);
}

export function formatBytes(value: number): string {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

export function formatEnvironment(value?: string | null, language: AppLanguage = "zh-CN"): string {
  const normalized = value?.trim().toLocaleLowerCase();
  if (!normalized) return "";
  const label =
    {
      dev: "开发",
      test: "测试",
      staging: "预发布",
      prod: "生产",
    }[normalized] ||
    value?.trim() ||
    "";
  return translate(label, language);
}

export function describeAsset(kind: AssetKind, platform: string, username: string): string {
  return [platform || KIND_LABELS[kind], username].filter(Boolean).join(" · ");
}
