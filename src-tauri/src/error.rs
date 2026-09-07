use std::io;

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("凭证库尚未初始化")]
    Uninitialized,
    #[error("凭证库已经锁定")]
    Locked,
    #[error("主密码或恢复密钥不正确")]
    InvalidCredential,
    #[error("凭证库目录已经包含数据")]
    VaultExists,
    #[error("找不到请求的记录")]
    NotFound,
    #[error("输入内容无效：{0}")]
    Validation(String),
    #[error("文件超过 10 MB 限制")]
    AttachmentTooLarge,
    #[error("备份损坏或内容被修改")]
    BackupIntegrity,
    #[error("当前系统不支持快速解锁")]
    SystemUnlockUnavailable,
    #[error("系统验证未通过或已取消")]
    SystemUnlockDenied,
    #[error("本地存储操作失败")]
    Storage(#[from] rusqlite::Error),
    #[error("本地文件操作失败：{0}")]
    Io(#[from] io::Error),
    #[error("加密操作失败")]
    Crypto,
    #[error("备份格式不受支持")]
    BackupFormat,
    #[error("{0}")]
    Message(String),
}

impl From<serde_json::Error> for AppError {
    fn from(_: serde_json::Error) -> Self {
        Self::BackupFormat
    }
}

impl From<zip::result::ZipError> for AppError {
    fn from(_: zip::result::ZipError) -> Self {
        Self::BackupFormat
    }
}

pub type AppResult<T> = Result<T, AppError>;
pub type CommandResult<T> = Result<T, String>;

pub fn command<T>(result: AppResult<T>) -> CommandResult<T> {
    result.map_err(|error| error.to_string())
}

#[cfg(test)]
mod tests {
    use super::AppError;

    #[test]
    fn vault_errors_use_credential_library_wording() {
        assert_eq!(AppError::Uninitialized.to_string(), "凭证库尚未初始化");
        assert_eq!(AppError::Locked.to_string(), "凭证库已经锁定");
        assert_eq!(AppError::VaultExists.to_string(), "凭证库目录已经包含数据");
    }
}
