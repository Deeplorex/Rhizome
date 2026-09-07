import { describe, expect, it } from "vitest";
import {
  emptyAsset,
  FIELD_TEMPLATES,
  getServerAuthMethod,
  switchAssetKind,
  switchServerAuthMethod,
} from "./assetTemplates";

describe("asset templates", () => {
  it("covers every supported long-lived asset kind", () => {
    expect(Object.keys(FIELD_TEMPLATES)).toEqual([
      "web_account",
      "api_credential",
      "server",
      "database",
      "recovery",
      "secret_file",
    ]);
  });

  it("defines the concise standard field list for every asset kind", () => {
    expect(
      Object.fromEntries(
        Object.entries(FIELD_TEMPLATES).map(([kind, fields]) => [
          kind,
          fields.map((item) => item.key),
        ]),
      ),
    ).toEqual({
      web_account: [
        "username",
        "password",
        "login_url",
        "totp_secret",
        "backup_codes",
        "recovery_contact",
      ],
      api_credential: ["api_key", "access_key_id", "secret_access_key", "token", "scopes", "quota"],
      server: ["host", "port", "provider", "os", "auth_method", "username", "password"],
      database: ["engine", "host", "port", "database", "username", "password", "connection_mode"],
      recovery: ["recovery_code", "pin", "security_question", "security_answer", "license_key"],
      secret_file: ["passphrase", "purpose"],
    });
    expect(FIELD_TEMPLATES.web_account.find((item) => item.key === "totp_secret")?.label).toBe(
      "TOTP 密钥",
    );
  });

  it("preserves matching field values when switching kind", () => {
    const account = emptyAsset("web_account");
    const username = account.fields.find((item) => item.key === "username");
    if (username) username.value = "caozh";
    const server = switchAssetKind(account, "server");
    expect(server.fields.find((item) => item.key === "username")?.value).toBe("caozh");
    expect(server.fields.find((item) => item.key === "port")?.value).toBe("22");
  });

  it("uses mutually exclusive password and SSH key fields for servers", () => {
    const passwordServer = emptyAsset("server");
    expect(getServerAuthMethod(passwordServer)).toBe("password");
    expect(passwordServer.fields.some((item) => item.key === "password")).toBe(true);
    expect(passwordServer.fields.some((item) => item.key === "private_key")).toBe(false);

    const keyServer = switchServerAuthMethod(passwordServer, "ssh_key");
    expect(getServerAuthMethod(keyServer)).toBe("ssh_key");
    expect(keyServer.fields.some((item) => item.key === "password")).toBe(false);
    expect(keyServer.fields.some((item) => item.key === "private_key")).toBe(true);
    expect(keyServer.fields.some((item) => item.key === "key_passphrase")).toBe(true);
  });
});
