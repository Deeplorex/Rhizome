import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useI18n } from "../lib/i18n";
import type { AssetInput, AssetRelationType, AssetSummary, ConsumerKind, Project } from "../types";

const RELATIONS: Record<AssetRelationType, string> = {
  used_to_register: "用于注册",
  used_to_login: "用于登录",
  used_to_recover: "用于找回",
  issues_credential: "签发凭证",
  shared_account: "共用账号",
  other: "其他关联",
};

export function AssetLinksEditor({
  draft,
  assets,
  projects,
  onChange,
  disabled,
}: {
  draft: AssetInput;
  assets: AssetSummary[];
  projects: Project[];
  onChange: (next: Partial<AssetInput>) => void;
  disabled: boolean;
}) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const links = draft.links ?? { relations: [], bindings: [] };
  const [relationKeys, setRelationKeys] = useState(() =>
    links.relations.map(() => crypto.randomUUID()),
  );
  const [bindingKeys, setBindingKeys] = useState(() =>
    links.bindings.map(() => crypto.randomUUID()),
  );
  const self = draft.id || "";
  const candidates = assets.filter((asset) => asset.id !== draft.id && !asset.deletedAt);
  const matches = (name: string) =>
    name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
  const options = projects.flatMap((project) => [
    { key: `project:${project.id}`, name: project.name, environment: "" },
    ...project.services.map((service) => ({
      key: `service:${service.id}`,
      name: `${project.name} / ${service.name}`,
      environment: "",
    })),
    ...project.environments.map((environment) => ({
      key: `environment:${environment.id}`,
      name: [
        project.name,
        project.services.find((service) => service.id === environment.serviceId)?.name,
        environment.name,
      ]
        .filter(Boolean)
        .join(" / "),
      environment: environment.kind,
    })),
  ]);
  const assetOptions = (selected: string) =>
    candidates.filter(
      (asset) => asset.id === selected || matches(`${asset.title} ${asset.platform}`),
    );
  const changeRelations = (relations: typeof links.relations, removed?: number) => {
    setRelationKeys((keys) =>
      removed === undefined
        ? [
            ...keys,
            ...Array.from({ length: Math.max(0, relations.length - keys.length) }, () =>
              crypto.randomUUID(),
            ),
          ]
        : keys.filter((_, index) => index !== removed),
    );
    onChange({ links: { ...links, relations } });
  };
  const changeBindings = (bindings: typeof links.bindings, removed?: number) => {
    setBindingKeys((keys) =>
      removed === undefined
        ? [
            ...keys,
            ...Array.from({ length: Math.max(0, bindings.length - keys.length) }, () =>
              crypto.randomUUID(),
            ),
          ]
        : keys.filter((_, index) => index !== removed),
    );
    onChange({ links: { ...links, bindings } });
  };
  return (
    <details
      className="editor-links"
      onInvalidCapture={(event) => {
        event.currentTarget.open = true;
      }}
    >
      <summary>
        {t("关联")} ·{" "}
        {links.relations.length + links.bindings.length + (draft.parentAssetId ? 1 : 0)}
      </summary>
      <fieldset disabled={disabled} className="editor-links__body">
        <label className="field-group">
          <span>{t("搜索凭证或使用位置")}</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <label className="field-group">
          <span>{t("上级账号 / 凭证")}</span>
          <select
            value={draft.parentAssetId || ""}
            onChange={(event) => onChange({ parentAssetId: event.target.value || null })}
          >
            <option value="">{t("无")}</option>
            {assetOptions(draft.parentAssetId || "").map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.title}
              </option>
            ))}
          </select>
        </label>
        <h4>{t("关联凭证")}</h4>
        {links.relations.map((relation, index) => {
          const incoming = relation.targetAssetId === self;
          const related = incoming ? relation.sourceAssetId : relation.targetAssetId;
          const update = (next: Partial<typeof relation>) =>
            changeRelations(
              links.relations.map((item, i) => (i === index ? { ...item, ...next } : item)),
            );
          const relatedName =
            assets.find((asset) => asset.id === related)?.title || t("请选择凭证");
          const currentName = draft.title || t("当前凭证");
          return (
            <div className="editor-links__row" key={relationKeys[index]}>
              <div className="form-grid form-grid--two">
                <label>
                  <span>
                    {t("关联凭证")} {index + 1}
                  </span>
                  <select
                    required
                    value={related}
                    onChange={(event) =>
                      update(
                        incoming
                          ? { sourceAssetId: event.target.value }
                          : { targetAssetId: event.target.value },
                      )
                    }
                  >
                    <option value="">{t("请选择凭证")}</option>
                    {assetOptions(related).map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>{t("关系方向")}</span>
                  <select
                    value={incoming ? "incoming" : "outgoing"}
                    onChange={(event) =>
                      update(
                        event.target.value === "incoming"
                          ? { sourceAssetId: related, targetAssetId: self }
                          : { sourceAssetId: self, targetAssetId: related },
                      )
                    }
                  >
                    <option value="incoming">{t("所选凭证 → 当前凭证")}</option>
                    <option value="outgoing">{t("当前凭证 → 所选凭证")}</option>
                  </select>
                </label>
                <label>
                  <span>{t("关系类型")}</span>
                  <select
                    value={relation.relationType}
                    onChange={(event) =>
                      update({ relationType: event.target.value as AssetRelationType })
                    }
                  >
                    {Object.entries(RELATIONS).map(([value, label]) => (
                      <option value={value} key={value}>
                        {t(label)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>{t("备注")}</span>
                  <input
                    value={relation.notes}
                    onChange={(event) => update({ notes: event.target.value })}
                  />
                </label>
              </div>
              <p>
                {incoming ? relatedName : currentName} → {t(RELATIONS[relation.relationType])} →{" "}
                {incoming ? currentName : relatedName}
              </p>
              <button
                type="button"
                className="text-button"
                onClick={() =>
                  changeRelations(
                    links.relations.filter((_, i) => i !== index),
                    index,
                  )
                }
              >
                <Trash2 size={15} />
                {t("移除关联")}
              </button>
            </div>
          );
        })}
        <button
          type="button"
          className="text-button"
          onClick={() =>
            changeRelations([
              ...links.relations,
              {
                sourceAssetId: candidates[0]?.id || "",
                targetAssetId: self,
                relationType: "used_to_register",
                notes: "",
              },
            ])
          }
          disabled={!candidates.length}
        >
          <Plus size={15} />
          {t("添加关联凭证")}
        </button>
        {!candidates.length && <p>{t("暂无可关联的凭证")}</p>}
        <h4>{t("使用位置")}</h4>
        {links.bindings.map((binding, index) => {
          const selected = `${binding.consumerKind}:${binding.consumerId}`;
          const update = (next: Partial<typeof binding>) =>
            changeBindings(
              links.bindings.map((item, i) => (i === index ? { ...item, ...next } : item)),
            );
          return (
            <div className="editor-links__row" key={bindingKeys[index]}>
              <div className="form-grid form-grid--two">
                <label className="span-two">
                  <span>
                    {t("使用位置")} {index + 1}
                  </span>
                  <select
                    required
                    value={binding.consumerId ? selected : ""}
                    onChange={(event) => {
                      const [consumerKind, consumerId] = event.target.value.split(":");
                      update({
                        consumerKind: consumerKind as ConsumerKind,
                        consumerId,
                        environment:
                          options.find((option) => option.key === event.target.value)
                            ?.environment || "",
                      });
                    }}
                  >
                    <option value="">{t("请选择使用位置")}</option>
                    {options
                      .filter((option) => option.key === selected || matches(option.name))
                      .map((option) => (
                        <option key={option.key} value={option.key}>
                          {option.name}
                        </option>
                      ))}
                  </select>
                </label>
                <label>
                  <span>{t("用途")}</span>
                  <input
                    value={binding.purpose}
                    onChange={(event) => update({ purpose: event.target.value })}
                  />
                </label>
                <label>
                  <span>{t("配置项名称")}</span>
                  <input
                    value={binding.configKey}
                    onChange={(event) => update({ configKey: event.target.value })}
                  />
                </label>
                <label className="span-two">
                  <span>{t("备注")}</span>
                  <input
                    value={binding.notes}
                    onChange={(event) => update({ notes: event.target.value })}
                  />
                </label>
              </div>
              <button
                type="button"
                className="text-button"
                onClick={() =>
                  changeBindings(
                    links.bindings.filter((_, i) => i !== index),
                    index,
                  )
                }
              >
                <Trash2 size={15} />
                {t("移除使用位置")}
              </button>
            </div>
          );
        })}
        <button
          type="button"
          className="text-button"
          disabled={!options.length}
          onClick={() =>
            changeBindings([
              ...links.bindings,
              {
                assetId: self,
                consumerKind: "project",
                consumerId: "",
                purpose: "",
                configKey: "",
                environment: "",
                notes: "",
              },
            ])
          }
        >
          <Plus size={15} />
          {t("添加使用位置")}
        </button>
        {!options.length && <p>{t("暂无产品，可稍后添加使用位置")}</p>}
      </fieldset>
    </details>
  );
}
