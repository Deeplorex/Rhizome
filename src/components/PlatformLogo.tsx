import { Database, FileKey2, Globe2, KeyRound, Server, ShieldQuestion } from "lucide-react";
import type { CSSProperties } from "react";
import type { SimpleIcon } from "simple-icons";
import {
  siAlibabacloud,
  siAnthropic,
  siApple,
  siBaidu,
  siClaude,
  siCloudflare,
  siDeepseek,
  siDigitalocean,
  siDocker,
  siDropbox,
  siFacebook,
  siGithub,
  siGitlab,
  siGoogle,
  siGooglegemini,
  siHuawei,
  siInstagram,
  siMinimax,
  siMongodb,
  siMoonshotai,
  siMysql,
  siNetlify,
  siNotion,
  siPostgresql,
  siQq,
  siQwen,
  siRedis,
  siSqlite,
  siVercel,
  siWechat,
  siX,
} from "simple-icons";
import type { AssetKind, AssetListField } from "../types";
import { useI18n } from "../lib/i18n";

type CustomMark = "openai" | "aws" | "azure" | "oracle" | "tencent" | "slack" | "linkedin";

interface PlatformIdentity {
  key: string;
  label: string;
  aliases: string[];
  icon?: SimpleIcon;
  custom?: CustomMark;
  color?: string;
}

const identities: PlatformIdentity[] = [
  { key: "deepseek", label: "DeepSeek", aliases: ["deepseek", "深度求索"], icon: siDeepseek },
  {
    key: "openai",
    label: "OpenAI",
    aliases: ["openai", "chatgpt", "gpt-"],
    custom: "openai",
    color: "#3C7468",
  },
  { key: "claude", label: "Claude", aliases: ["claude"], icon: siClaude },
  { key: "anthropic", label: "Anthropic", aliases: ["anthropic"], icon: siAnthropic },
  {
    key: "gemini",
    label: "Google Gemini",
    aliases: ["gemini", "谷歌双子座"],
    icon: siGooglegemini,
  },
  { key: "qwen", label: "通义千问", aliases: ["qwen", "通义", "千问"], icon: siQwen },
  {
    key: "moonshot",
    label: "Moonshot AI",
    aliases: ["moonshot", "kimi", "月之暗面"],
    icon: siMoonshotai,
  },
  { key: "minimax", label: "MiniMax", aliases: ["minimax", "海螺"], icon: siMinimax },
  {
    key: "alibaba-cloud",
    label: "阿里云",
    aliases: ["aliyun", "alibaba cloud", "阿里云"],
    icon: siAlibabacloud,
  },
  {
    key: "aws",
    label: "Amazon Web Services",
    aliases: ["amazon web services", "amazon aws", "aws", "亚马逊云"],
    custom: "aws",
    color: "#E68B20",
  },
  {
    key: "azure",
    label: "Microsoft Azure",
    aliases: ["microsoft azure", "azure", "微软云"],
    custom: "azure",
    color: "#1686C9",
  },
  {
    key: "tencent-cloud",
    label: "腾讯云",
    aliases: ["tencent cloud", "腾讯云"],
    custom: "tencent",
    color: "#2475D9",
  },
  { key: "huawei", label: "华为云", aliases: ["huawei", "华为云"], icon: siHuawei },
  { key: "google", label: "Google", aliases: ["google", "gmail", "谷歌"], icon: siGoogle },
  { key: "github", label: "GitHub", aliases: ["github"], icon: siGithub },
  { key: "gitlab", label: "GitLab", aliases: ["gitlab"], icon: siGitlab },
  { key: "cloudflare", label: "Cloudflare", aliases: ["cloudflare"], icon: siCloudflare },
  { key: "docker", label: "Docker", aliases: ["docker"], icon: siDocker },
  {
    key: "digitalocean",
    label: "DigitalOcean",
    aliases: ["digitalocean", "digital ocean"],
    icon: siDigitalocean,
  },
  { key: "vercel", label: "Vercel", aliases: ["vercel"], icon: siVercel },
  { key: "netlify", label: "Netlify", aliases: ["netlify"], icon: siNetlify },
  {
    key: "postgresql",
    label: "PostgreSQL",
    aliases: ["postgresql", "postgres"],
    icon: siPostgresql,
  },
  { key: "mysql", label: "MySQL", aliases: ["mysql"], icon: siMysql },
  { key: "mongodb", label: "MongoDB", aliases: ["mongodb", "mongo db"], icon: siMongodb },
  { key: "redis", label: "Redis", aliases: ["redis"], icon: siRedis },
  { key: "sqlite", label: "SQLite", aliases: ["sqlite"], icon: siSqlite },
  {
    key: "oracle",
    label: "Oracle",
    aliases: ["oracle", "甲骨文"],
    custom: "oracle",
    color: "#C74634",
  },
  { key: "baidu", label: "百度", aliases: ["baidu", "百度"], icon: siBaidu },
  { key: "wechat", label: "微信", aliases: ["wechat", "微信"], icon: siWechat },
  { key: "qq", label: "QQ", aliases: ["qq.com", "腾讯 qq", "腾讯qq"], icon: siQq },
  { key: "apple", label: "Apple", aliases: ["apple", "icloud", "苹果"], icon: siApple },
  { key: "facebook", label: "Facebook", aliases: ["facebook", "meta"], icon: siFacebook },
  { key: "instagram", label: "Instagram", aliases: ["instagram"], icon: siInstagram },
  { key: "x", label: "X", aliases: ["twitter", "x.com"], icon: siX },
  { key: "dropbox", label: "Dropbox", aliases: ["dropbox"], icon: siDropbox },
  { key: "notion", label: "Notion", aliases: ["notion"], icon: siNotion },
  {
    key: "slack",
    label: "Slack",
    aliases: ["slack"],
    custom: "slack",
    color: "#4A154B",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    aliases: ["linkedin", "领英"],
    custom: "linkedin",
    color: "#0A66C2",
  },
];

const fallbackIcons: Record<AssetKind, typeof Globe2> = {
  web_account: Globe2,
  api_credential: KeyRound,
  server: Server,
  database: Database,
  recovery: ShieldQuestion,
  secret_file: FileKey2,
};

export function resolvePlatformIdentity(
  platform: string,
  title = "",
  coreFields: AssetListField[] = [],
): PlatformIdentity | undefined {
  const searchable = [platform, title, ...coreFields.flatMap((field) => [field.label, field.value])]
    .join(" ")
    .toLocaleLowerCase();
  return identities.find((identity) =>
    identity.aliases.some((alias) => searchable.includes(alias.toLocaleLowerCase())),
  );
}

function CustomLogo({ mark }: { mark: CustomMark }) {
  if (mark === "openai") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 3.1a4.2 4.2 0 0 1 7 3.15 4.2 4.2 0 0 1 1.66 7.5A4.2 4.2 0 0 1 15.3 20a4.2 4.2 0 0 1-7.05-.78 4.2 4.2 0 0 1-5.02-5.8A4.2 4.2 0 0 1 5.6 6.3 4.2 4.2 0 0 1 12 3.1Zm0 3.1-5.1 3v5.9l5.1 2.95 5.1-2.95V9.2L12 6.2Zm0 3.05 2.45 1.42v2.82L12 14.9l-2.45-1.41v-2.82L12 9.25Z"
          fill="currentColor"
          fillRule="evenodd"
        />
      </svg>
    );
  }
  if (mark === "azure") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M10.2 2.5h5.4L9.9 19.2H3.4L10.2 2.5Zm6.1 4.8 4.3 14.2H8.1l2.35-4.05h6.3l-2.5-7.5 2.05-2.65Z"
          fill="currentColor"
        />
      </svg>
    );
  }
  if (mark === "tencent") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 3a8.8 8.8 0 0 0-8.6 7h4.3a4.8 4.8 0 0 1 8.7-1.7l3.3-2.45A8.8 8.8 0 0 0 12 3Zm8.6 8H12l-2.7 4h6.95a4.8 4.8 0 0 1-8.05.7l-3.35 2.45A8.8 8.8 0 0 0 20.6 11Z"
          fill="currentColor"
        />
      </svg>
    );
  }
  const text =
    mark === "aws" ? "aws" : mark === "linkedin" ? "in" : mark === "slack" ? "#" : "ORACLE";
  return <span className={`platform-logo__word platform-logo__word--${mark}`}>{text}</span>;
}

function readableColor(identity: PlatformIdentity): string {
  if (identity.color) return identity.color;
  if (!identity.icon) return "var(--forest)";
  const numeric = Number.parseInt(identity.icon.hex, 16);
  return numeric < 0x3d3d3d ? "var(--ink)" : `#${identity.icon.hex}`;
}

interface PlatformLogoProps {
  platform?: string;
  title?: string;
  kind: AssetKind;
  coreFields?: AssetListField[];
  className?: string;
}

export function PlatformLogo({
  platform = "",
  title = "",
  kind,
  coreFields = [],
  className = "",
}: PlatformLogoProps) {
  const { t } = useI18n();
  const identity = resolvePlatformIdentity(platform, title, coreFields);
  const Fallback = fallbackIcons[kind];
  const style = identity
    ? ({ "--platform-logo-color": readableColor(identity) } as CSSProperties)
    : undefined;

  return (
    <span
      className={`platform-logo ${identity ? "platform-logo--brand" : "platform-logo--fallback"} ${className}`}
      style={style}
      title={identity?.label || platform || title || t("未识别平台")}
      aria-hidden="true"
    >
      {identity?.icon ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d={identity.icon.path} fill="currentColor" />
        </svg>
      ) : identity?.custom ? (
        <CustomLogo mark={identity.custom} />
      ) : (
        <Fallback aria-hidden="true" />
      )}
    </span>
  );
}
