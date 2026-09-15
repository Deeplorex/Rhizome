import { Boxes, Component, GitBranch, Layers3, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { type FormEvent, useEffect, useId, useState } from "react";
import { consumerPath, formatEnvironment } from "../lib/format";
import { useI18n } from "../lib/i18n";
import type { EnvironmentInput, Project, ProjectInput, ServiceInput } from "../types";
import { ProjectLogo } from "./ProjectLogo";

interface ProjectPanelProps {
  projects: Project[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onOpenAsset: (id: string) => void;
  onSave: (input: ProjectInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSaveService: (input: ServiceInput) => Promise<void>;
  onDeleteService: (id: string) => Promise<void>;
  onSaveEnvironment: (input: EnvironmentInput) => Promise<void>;
  onDeleteEnvironment: (id: string) => Promise<void>;
}

const ENVIRONMENT_LABELS: Record<string, string> = {
  dev: "开发",
  staging: "预发布",
  prod: "生产",
  other: "其他",
};

export function ProjectPanel({
  projects,
  selectedId,
  onSelect,
  onOpenAsset,
  onSave,
  onDelete,
  onSaveService,
  onDeleteService,
  onSaveEnvironment,
  onDeleteEnvironment,
}: ProjectPanelProps) {
  const { language, t } = useI18n();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [logo, setLogo] = useState("");
  const [readingLogo, setReadingLogo] = useState(false);
  const openProduct = (project?: Project) => {
    setEditing(project || null);
    setName(project?.name || "");
    setDescription(project?.description || "");
    setLogo(project?.logo || "");
    setError("");
    setCreating(true);
  };
  const chooseLogo = async (file?: File) => {
    if (!file) return;
    setError("");
    if (!["image/png", "image/jpeg"].includes(file.type) || file.size > 1024 * 1024) {
      setError(t("Logo 必须为不超过 1 MB 的 PNG 或 JPEG 图片"));
      return;
    }
    setReadingLogo(true);
    try {
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error(t("无法读取图片")));
        reader.readAsDataURL(file);
      });
      await new Promise<void>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve();
        image.onerror = () => reject(new Error(t("无法读取图片")));
        image.src = data;
      });
      setLogo(data);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setReadingLogo(false);
    }
  };
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [structureForm, setStructureForm] = useState<"service" | "environment" | null>(null);
  const [structureServiceId, setStructureServiceId] = useState<string | null>(null);
  const [structureName, setStructureName] = useState("");
  const [structureDescription, setStructureDescription] = useState("");
  const [environmentKind, setEnvironmentKind] = useState("prod");
  const [environmentService, setEnvironmentService] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const productTitleId = useId();
  const structureTitleId = useId();
  const selected = projects.find((project) => project.id === selectedId) || projects[0];

  useEffect(() => {
    if (!selectedId && projects[0]) onSelect(projects[0].id);
  }, [projects, selectedId, onSelect]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave({
        ...(editing ? { id: editing.id } : {}),
        name: name.trim(),
        description,
        logo,
        repoPath: editing?.repoPath || "",
        favorite: editing?.favorite || false,
      });
      setName("");
      setDescription("");
      setCreating(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setSaving(false);
    }
  };

  const submitStructure = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected || !structureForm) return;
    setSaving(true);
    setError("");
    try {
      if (structureForm === "service") {
        await onSaveService({
          id: structureServiceId,
          projectId: selected.id,
          name: structureName,
          description: structureDescription,
        });
      } else {
        await onSaveEnvironment({
          projectId: selected.id,
          serviceId: environmentService || null,
          name: structureName,
          kind: environmentKind,
        });
      }
      setStructureName("");
      setStructureDescription("");
      setEnvironmentService("");
      setStructureServiceId(null);
      setStructureForm(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setSaving(false);
    }
  };

  const attempt = async (operation: () => Promise<void>) => {
    setError("");
    try {
      await operation();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  };

  return (
    <section className="projects-view">
      <aside className="projects-list">
        <header>
          <div>
            <h1>{t("产品")}</h1>
          </div>
          <button
            type="button"
            className="primary-icon"
            onClick={() => openProduct()}
            aria-label={t("新建产品")}
          >
            <Plus size={20} />
          </button>
        </header>
        <p className="projects-list__intro">{t("管理产品以及它们使用的凭证。")}</p>
        {projects.length === 0 ? (
          <div className="empty-list">
            <span>
              <Boxes size={23} />
            </span>
            <h3>{t("还没有产品")}</h3>
            <p>{t("例如小程序、自媒体品牌、个人网站或线上店铺。")}</p>
            <button type="button" className="secondary-button" onClick={() => openProduct()}>
              <Plus size={16} />
              {t("新建产品")}
            </button>
          </div>
        ) : (
          <div className="project-items">
            {projects.map((project) => (
              <button
                type="button"
                key={project.id}
                className={selected?.id === project.id ? "active" : ""}
                onClick={() => onSelect(project.id)}
              >
                <span>
                  <ProjectLogo logo={project.logo} size={24} />
                </span>
                <div>
                  <strong>
                    {project.name}
                    {project.favorite && <Star size={12} fill="currentColor" />}
                  </strong>
                  <small>{t("{count} 项凭证", { count: project.bindings.length })}</small>
                </div>
              </button>
            ))}
          </div>
        )}
      </aside>
      <div className="project-detail">
        {!selected ? (
          <div className="project-empty">
            <GitBranch size={32} />
            <h2>{t("先新建一个产品")}</h2>
            <p>{t("用产品归拢它的组成和凭证。")}</p>
          </div>
        ) : (
          <>
            <header className="project-detail__head">
              <div>
                <h2 className="project-heading">
                  <ProjectLogo logo={selected.logo} size={40} />
                  {selected.name}
                </h2>
                <p>{selected.description || t("尚未填写产品说明")}</p>
              </div>
              <div className="project-actions">
                <button
                  type="button"
                  className="icon-button"
                  onClick={() =>
                    void attempt(() =>
                      onSave({
                        id: selected.id,
                        name: selected.name,
                        description: selected.description,
                        logo: selected.logo,
                        repoPath: selected.repoPath,
                        favorite: !selected.favorite,
                      }),
                    )
                  }
                  aria-label={selected.favorite ? t("取消产品星标") : t("星标产品")}
                  disabled={saving || readingLogo}
                >
                  <Star size={16} fill={selected.favorite ? "currentColor" : "none"} />
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => openProduct(selected)}
                  disabled={saving || readingLogo}
                >
                  <Pencil size={15} />
                  {t("编辑产品")}
                </button>
                <button
                  type="button"
                  className="text-danger"
                  onClick={() => {
                    if (window.confirm(t("删除产品“{name}”及其关联？", { name: selected.name }))) {
                      void attempt(() => onDelete(selected.id));
                    }
                  }}
                  disabled={saving || readingLogo}
                >
                  <Trash2 size={15} />
                  {t("删除")}
                </button>
              </div>
            </header>
            <div className="project-stats">
              <span>
                <small>{t("使用的凭证")}</small>
                <strong>{selected.bindings.length}</strong>
              </span>
              <span>
                <small>{t("产品组成")}</small>
                <strong>{selected.services.length}</strong>
              </span>
              <span>
                <small>{t("环境")}</small>
                <strong>{selected.environments.length}</strong>
              </span>
            </div>
            <section className="project-structure">
              <div className="structure-column">
                <div className="section-title">
                  <div>
                    <h3>{t("产品组成")}</h3>
                  </div>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => {
                      setStructureServiceId(null);
                      setStructureForm("service");
                    }}
                  >
                    <Plus size={15} />
                    {t("添加")}
                  </button>
                </div>
                {selected.services.length === 0 ? (
                  <p className="section-empty">
                    {t("例如国内版小程序、海外版小程序、公众号或视频栏目。")}
                  </p>
                ) : (
                  <div className="structure-list">
                    {selected.services.map((service) => (
                      <div className="structure-row" key={service.id}>
                        <span>
                          <Component size={16} />
                        </span>
                        <div>
                          <strong>{service.name}</strong>
                          <small>{service.description || t("未填写说明")}</small>
                        </div>
                        <div className="structure-row__actions">
                          <button
                            type="button"
                            className="text-button"
                            aria-label={t("编辑产品组成 {name}", { name: service.name })}
                            onClick={() => {
                              setStructureServiceId(service.id);
                              setStructureName(service.name);
                              setStructureDescription(service.description);
                              setStructureForm("service");
                            }}
                            disabled={saving || readingLogo}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            className="bare-danger"
                            aria-label={t("删除产品组成 {name}", { name: service.name })}
                            onClick={() => {
                              if (
                                window.confirm(
                                  t("删除产品组成“{name}”及其环境和关联？", {
                                    name: service.name,
                                  }),
                                )
                              )
                                void attempt(() => onDeleteService(service.id));
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="structure-column">
                <div className="section-title">
                  <div>
                    <h3>{t("部署环境")}</h3>
                  </div>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setStructureForm("environment")}
                  >
                    <Plus size={15} />
                    {t("添加")}
                  </button>
                </div>
                {selected.environments.length === 0 ? (
                  <p className="section-empty">{t("按需添加开发、测试或生产环境。")}</p>
                ) : (
                  <div className="structure-list">
                    {selected.environments.map((environment) => (
                      <div className="structure-row" key={environment.id}>
                        <span>
                          <Layers3 size={16} />
                        </span>
                        <div>
                          <strong>{environment.name}</strong>
                          <small>
                            {t(ENVIRONMENT_LABELS[environment.kind] || environment.kind)} ·{" "}
                            {selected.services.find(
                              (service) => service.id === environment.serviceId,
                            )?.name || t("产品级")}
                          </small>
                        </div>
                        <div className="structure-row__actions">
                          <button
                            type="button"
                            className="bare-danger"
                            aria-label={t("删除环境 {name}", { name: environment.name })}
                            onClick={() => {
                              if (
                                window.confirm(
                                  t("删除环境“{name}”及其关联？", {
                                    name: environment.name,
                                  }),
                                )
                              )
                                void attempt(() => onDeleteEnvironment(environment.id));
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
            <section className="project-dependencies">
              <div className="section-title">
                <div>
                  <h3>{t("使用的凭证")}</h3>
                </div>
              </div>
              {selected.bindings.length === 0 ? (
                <div className="section-empty-box">
                  <GitBranch size={21} />
                  <span>{t("暂时没有关联")}</span>
                  <small>{t("打开凭证详情，在“用在哪里”中添加关联。")}</small>
                </div>
              ) : (
                selected.bindings.map((binding) => (
                  <button
                    type="button"
                    className="dependency-card"
                    key={binding.id}
                    onClick={() => onOpenAsset(binding.assetId)}
                    aria-label={t("查看凭证 {title} 详情", { title: binding.assetTitle })}
                  >
                    <span className="dependency-card__track" />
                    <span className="dependency-card__dot" />
                    <div>
                      <strong>{binding.assetTitle}</strong>
                      <small>
                        {[
                          consumerPath(projects, binding),
                          binding.purpose,
                          binding.configKey,
                          formatEnvironment(binding.environment, language),
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </small>
                    </div>
                  </button>
                ))
              )}
            </section>
          </>
        )}
      </div>
      {creating && (
        <div className="modal-backdrop">
          <form
            className="small-modal"
            onSubmit={submit}
            role="dialog"
            aria-modal="true"
            aria-labelledby={productTitleId}
          >
            <header className="modal-head">
              <div>
                <h2 id={productTitleId}>{editing ? t("编辑产品") : t("新建产品")}</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setCreating(false)}
                aria-label={editing ? t("关闭编辑产品") : t("关闭新建产品")}
                disabled={saving || readingLogo}
              >
                <X size={18} />
              </button>
            </header>
            <label className="field-group">
              <span>{t("产品名称")}</span>
              <input
                value={name}
                name="project-name"
                onChange={(event) => setName(event.target.value)}
                required
                placeholder={t("例如：个人网站")}
              />
            </label>
            <label className="field-group">
              <span>{t("说明")}</span>
              <textarea
                rows={3}
                value={description}
                name="project-description"
                onChange={(event) => setDescription(event.target.value)}
                placeholder={t("它解决什么问题？")}
              />
            </label>
            <div className="project-logo-editor">
              <ProjectLogo logo={logo} size={56} />
              <label className="field-group">
                <span>{t("自定义 Logo")}</span>
                <input
                  type="file"
                  aria-label={t("自定义 Logo")}
                  accept="image/png,image/jpeg"
                  disabled={saving || readingLogo}
                  onChange={(event) => {
                    void chooseLogo(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
                <small>{t("PNG 或 JPEG，最大 1 MB")}</small>
              </label>
              {logo && (
                <button
                  type="button"
                  className="text-button"
                  disabled={saving || readingLogo}
                  onClick={() => setLogo("")}
                >
                  {t("恢复默认图标")}
                </button>
              )}
            </div>
            {error && (
              <div className="inline-error small-modal__message" role="alert">
                {error}
              </div>
            )}
            <footer className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setCreating(false)}
                disabled={saving || readingLogo}
              >
                {t("取消")}
              </button>
              <button
                type="submit"
                className="primary-button"
                disabled={!name.trim() || saving || readingLogo}
              >
                {saving ? t("正在保存…") : t("保存产品")}
              </button>
            </footer>
          </form>
        </div>
      )}
      {structureForm && selected && (
        <div className="modal-backdrop">
          <form
            className="small-modal"
            onSubmit={submitStructure}
            role="dialog"
            aria-modal="true"
            aria-labelledby={structureTitleId}
          >
            <header className="modal-head">
              <div>
                <h2 id={structureTitleId}>
                  {structureForm === "environment"
                    ? t("添加部署环境")
                    : structureServiceId
                      ? t("编辑产品组成")
                      : t("添加产品组成")}
                </h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => {
                  setStructureForm(null);
                  setStructureServiceId(null);
                }}
                aria-label={t("关闭结构编辑")}
                disabled={saving || readingLogo}
              >
                <X size={18} />
              </button>
            </header>
            <label className="field-group">
              <span>{t("名称")}</span>
              <input
                value={structureName}
                name="structure-name"
                onChange={(event) => setStructureName(event.target.value)}
                required
                placeholder={
                  structureForm === "service" ? t("例如：国内版小程序") : t("例如：生产环境")
                }
              />
            </label>
            {structureForm === "service" ? (
              <label className="field-group">
                <span>{t("说明")}</span>
                <textarea
                  rows={3}
                  value={structureDescription}
                  name="service-description"
                  onChange={(event) => setStructureDescription(event.target.value)}
                  placeholder={t("它在产品中是什么？")}
                />
              </label>
            ) : (
              <>
                <label className="field-group">
                  <span>{t("类型")}</span>
                  <select
                    value={environmentKind}
                    name="environment-kind"
                    onChange={(event) => setEnvironmentKind(event.target.value)}
                  >
                    <option value="dev">{t("开发")}</option>
                    <option value="staging">{t("预发布")}</option>
                    <option value="prod">{t("生产")}</option>
                    <option value="other">{t("其他")}</option>
                  </select>
                </label>
                <label className="field-group">
                  <span>{t("所属产品组成（可选）")}</span>
                  <select
                    value={environmentService}
                    name="environment-service"
                    onChange={(event) => setEnvironmentService(event.target.value)}
                  >
                    <option value="">{t("产品级环境")}</option>
                    {selected.services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}
            {error && (
              <div className="inline-error small-modal__message" role="alert">
                {error}
              </div>
            )}
            <footer className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setStructureForm(null);
                  setStructureServiceId(null);
                }}
                disabled={saving || readingLogo}
              >
                {t("取消")}
              </button>
              <button
                type="submit"
                className="primary-button"
                disabled={!structureName.trim() || saving}
              >
                {saving ? t("正在保存…") : t("保存")}
              </button>
            </footer>
          </form>
        </div>
      )}
    </section>
  );
}
