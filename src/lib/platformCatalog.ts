import type { AssetKind } from "../types";

export interface PlatformOption {
  name: string;
  aliases: readonly string[];
  kinds: readonly AssetKind[];
}

const ALL: readonly AssetKind[] = [
  "web_account",
  "api_credential",
  "server",
  "database",
  "recovery",
  "secret_file",
];
const ACCOUNT: readonly AssetKind[] = ["web_account", "recovery"];
const CLOUD: readonly AssetKind[] = ["api_credential", "server", "database", "secret_file"];
const API: readonly AssetKind[] = ["api_credential"];
const DATABASE: readonly AssetKind[] = ["database"];
const KEY_FILE: readonly AssetKind[] = ["secret_file", "server"];

export const PLATFORM_CATALOG: readonly PlatformOption[] = [
  { name: "OpenAI", aliases: ["chatgpt"], kinds: API },
  { name: "Anthropic", aliases: ["claude"], kinds: API },
  { name: "Google Gemini", aliases: ["gemini", "google ai studio"], kinds: API },
  { name: "DeepSeek", aliases: ["深度求索"], kinds: API },
  { name: "通义千问", aliases: ["qwen", "千问"], kinds: API },
  { name: "月之暗面（Kimi）", aliases: ["kimi", "moonshot", "moonshot ai"], kinds: API },
  { name: "智谱 AI", aliases: ["智谱", "zhipu", "bigmodel"], kinds: API },
  { name: "MiniMax", aliases: ["海螺"], kinds: API },
  { name: "腾讯混元", aliases: ["hunyuan", "混元"], kinds: API },
  { name: "讯飞星火", aliases: ["sparkdesk", "星火"], kinds: API },
  { name: "硅基流动", aliases: ["siliconflow"], kinds: API },
  { name: "阿里云", aliases: ["aliyun", "alibaba cloud", "阿里"], kinds: CLOUD },
  { name: "腾讯云", aliases: ["tencent cloud"], kinds: CLOUD },
  { name: "华为云", aliases: ["huawei cloud"], kinds: CLOUD },
  { name: "火山引擎", aliases: ["volcengine", "volcano engine"], kinds: CLOUD },
  { name: "百度智能云", aliases: ["baidu cloud", "百度云"], kinds: CLOUD },
  { name: "Amazon Web Services", aliases: ["aws", "amazon aws", "亚马逊云"], kinds: CLOUD },
  { name: "Microsoft Azure", aliases: ["azure", "微软云"], kinds: CLOUD },
  { name: "Google Cloud", aliases: ["gcp", "google cloud platform"], kinds: CLOUD },
  { name: "Oracle Cloud", aliases: ["oci", "甲骨文云"], kinds: CLOUD },
  { name: "Cloudflare", aliases: [], kinds: CLOUD },
  { name: "DigitalOcean", aliases: ["digital ocean"], kinds: ["server"] },
  { name: "Hetzner Cloud", aliases: ["hetzner"], kinds: ["server"] },
  { name: "Vultr", aliases: [], kinds: ["server"] },
  { name: "Akamai Cloud（Linode）", aliases: ["linode", "akamai cloud"], kinds: ["server"] },
  { name: "Google", aliases: ["gmail", "谷歌"], kinds: ACCOUNT },
  { name: "Microsoft", aliases: ["microsoft account", "微软账号"], kinds: ACCOUNT },
  { name: "Apple", aliases: ["icloud", "苹果"], kinds: ACCOUNT },
  { name: "GitHub", aliases: [], kinds: [...ACCOUNT, "api_credential", "secret_file"] },
  { name: "GitLab", aliases: [], kinds: [...ACCOUNT, "api_credential", "secret_file"] },
  { name: "微信", aliases: ["wechat"], kinds: ACCOUNT },
  { name: "QQ", aliases: ["qq.com", "腾讯 qq"], kinds: ACCOUNT },
  { name: "支付宝", aliases: ["alipay"], kinds: ACCOUNT },
  { name: "淘宝", aliases: ["taobao"], kinds: ACCOUNT },
  { name: "京东", aliases: ["jd", "jd.com"], kinds: ACCOUNT },
  { name: "百度", aliases: ["baidu"], kinds: ACCOUNT },
  { name: "抖音", aliases: ["douyin", "tiktok"], kinds: ACCOUNT },
  { name: "哔哩哔哩", aliases: ["bilibili", "b站"], kinds: ACCOUNT },
  { name: "Notion", aliases: [], kinds: ACCOUNT },
  { name: "Dropbox", aliases: [], kinds: ACCOUNT },
  { name: "阿里云 RDS", aliases: ["alibaba cloud rds", "aliyun rds"], kinds: DATABASE },
  { name: "TencentDB", aliases: ["腾讯云数据库"], kinds: DATABASE },
  { name: "华为云 GaussDB", aliases: ["gaussdb"], kinds: DATABASE },
  { name: "Amazon RDS", aliases: ["aws rds"], kinds: DATABASE },
  { name: "Google Cloud SQL", aliases: ["cloud sql"], kinds: DATABASE },
  { name: "Azure Database", aliases: ["azure db"], kinds: DATABASE },
  { name: "MongoDB Atlas", aliases: ["atlas"], kinds: DATABASE },
  { name: "Supabase", aliases: [], kinds: DATABASE },
  { name: "Neon", aliases: ["neon database"], kinds: DATABASE },
  {
    name: "自建 / 本地",
    aliases: ["self hosted", "localhost", "本地"],
    kinds: ["server", "database"],
  },
  { name: "OpenSSH", aliases: ["ssh"], kinds: KEY_FILE },
  { name: "PuTTY", aliases: ["ppk"], kinds: KEY_FILE },
  { name: "Let's Encrypt", aliases: ["letsencrypt"], kinds: KEY_FILE },
  { name: "其他", aliases: [], kinds: ALL },
];

export function platformOptionsFor(kind: AssetKind): readonly PlatformOption[] {
  return PLATFORM_CATALOG.filter((option) => option.kinds.includes(kind));
}

export function normalizePlatformName(value: string): string {
  const input = value.trim();
  if (!input) return "";
  const folded = input.toLocaleLowerCase();
  const match = PLATFORM_CATALOG.find(
    (option) =>
      option.name.toLocaleLowerCase() === folded ||
      option.aliases.some((alias) => alias.toLocaleLowerCase() === folded),
  );
  return match?.name ?? input;
}
