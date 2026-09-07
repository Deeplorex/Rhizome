import { Check, Clipboard, KeyRound } from "lucide-react";
import { useId, useState } from "react";
import { useI18n } from "../lib/i18n";

interface RecoveryKeyDialogProps {
  recoveryKey: string;
  rotated?: boolean;
  onDone: () => void;
}

export function RecoveryKeyDialog({
  recoveryKey,
  rotated = false,
  onDone,
}: RecoveryKeyDialogProps) {
  const { t } = useI18n();
  const titleId = useId();
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(recoveryKey);
    setCopied(true);
  };
  return (
    <div className="modal-backdrop modal-backdrop--critical">
      <section className="recovery-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <span className="recovery-modal__icon">
          <KeyRound size={25} />
        </span>
        <h2 id={titleId}>{rotated ? t("新的恢复密钥已生成") : t("保存恢复密钥")}</h2>
        <p>{t("忘记主密码时，可以用它恢复凭证库。关闭后不会再次显示，也无法找回。")}</p>
        <div className="recovery-key">
          <code>{recoveryKey}</code>
          <button type="button" onClick={copy}>
            {copied ? <Check size={17} /> : <Clipboard size={17} />}
            <span>{copied ? t("已复制") : t("复制")}</span>
          </button>
        </div>
        <ol>
          <li>{t("保存到另一处可信的离线位置。")}</li>
          <li>{t("不要和凭证库放在同一块磁盘。")}</li>
          <li>{t("更换后，旧恢复密钥立即失效。")}</li>
        </ol>
        <label className="check-row check-row--boxed">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
          />
          <span>{t("我已把恢复密钥保存到安全位置")}</span>
        </label>
        <button
          type="button"
          className="primary-button primary-button--wide"
          disabled={!confirmed}
          onClick={onDone}
        >
          {t("完成并进入凭证库")}
        </button>
      </section>
    </div>
  );
}
