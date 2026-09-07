use std::{
    fs,
    io::{Read, Seek, Write},
    path::{Path, PathBuf},
};

use chrono::Utc;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use zeroize::Zeroizing;
use zip::{ZipArchive, ZipWriter, write::SimpleFileOptions};

use crate::{
    crypto::{KeyEnvelope, unlock_envelope},
    error::{AppError, AppResult},
    models::BackupInspection,
    platform,
    storage::{checkpoint, migrate, open_encrypted},
};

const MANIFEST_NAME: &str = "manifest.json";
const DATABASE_NAME: &str = "vault.db";
const ENVELOPE_NAME: &str = "key-envelope.json";
const SETTINGS_NAME: &str = "settings.json";

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct BackupManifest {
    version: u32,
    created_at: String,
    vault_id: String,
    database_bytes: u64,
    database_sha256: String,
    envelope_sha256: String,
    settings_sha256: Option<String>,
}

fn hash_bytes(value: &[u8]) -> String {
    hex::encode(Sha256::digest(value))
}

fn hash_file(path: &Path) -> AppResult<(String, u64)> {
    let mut file = fs::File::open(path)?;
    let mut digest = Sha256::new();
    let mut buffer = [0_u8; 64 * 1024];
    let mut length = 0_u64;
    loop {
        let read = file.read(&mut buffer)?;
        if read == 0 {
            break;
        }
        digest.update(&buffer[..read]);
        length += read as u64;
    }
    Ok((hex::encode(digest.finalize()), length))
}

fn add_file<W: Write + Seek>(zip: &mut ZipWriter<W>, name: &str, path: &Path) -> AppResult<()> {
    zip.start_file(
        name,
        SimpleFileOptions::default().compression_method(zip::CompressionMethod::Deflated),
    )?;
    let mut file = fs::File::open(path)?;
    std::io::copy(&mut file, zip)?;
    Ok(())
}

pub fn export_backup(
    connection: &rusqlite::Connection,
    vault_dir: &Path,
    target_path: &Path,
) -> AppResult<()> {
    checkpoint(connection)?;
    let database_path = vault_dir.join(DATABASE_NAME);
    let envelope_path = vault_dir.join(ENVELOPE_NAME);
    let settings_path = vault_dir.join(SETTINGS_NAME);
    let envelope_bytes = fs::read(&envelope_path)?;
    let envelope: KeyEnvelope = serde_json::from_slice(&envelope_bytes)?;
    let (database_sha256, database_bytes) = hash_file(&database_path)?;
    let settings_sha256 = if settings_path.exists() {
        Some(hash_file(&settings_path)?.0)
    } else {
        None
    };
    let manifest = BackupManifest {
        version: 1,
        created_at: Utc::now().to_rfc3339(),
        vault_id: envelope.vault_id,
        database_bytes,
        database_sha256,
        envelope_sha256: hash_bytes(&envelope_bytes),
        settings_sha256,
    };
    let target_parent = target_path
        .parent()
        .ok_or_else(|| AppError::Validation("备份路径无效".into()))?;
    fs::create_dir_all(target_parent)?;
    let temporary = target_path.with_extension("rhizome-backup.partial");
    let output = fs::OpenOptions::new()
        .create(true)
        .truncate(true)
        .write(true)
        .open(&temporary)?;
    let mut zip = ZipWriter::new(output);
    zip.start_file(
        MANIFEST_NAME,
        SimpleFileOptions::default().compression_method(zip::CompressionMethod::Stored),
    )?;
    zip.write_all(&serde_json::to_vec_pretty(&manifest)?)?;
    add_file(&mut zip, DATABASE_NAME, &database_path)?;
    add_file(&mut zip, ENVELOPE_NAME, &envelope_path)?;
    if settings_path.exists() {
        add_file(&mut zip, SETTINGS_NAME, &settings_path)?;
    }
    zip.finish()?.sync_all()?;
    platform::replace_file_atomic(&temporary, target_path)?;
    Ok(())
}

fn read_manifest<R: Read + Seek>(archive: &mut ZipArchive<R>) -> AppResult<BackupManifest> {
    let mut entry = archive.by_name(MANIFEST_NAME)?;
    if entry.size() > 64 * 1024 {
        return Err(AppError::BackupFormat);
    }
    let mut value = Vec::with_capacity(entry.size() as usize);
    entry.read_to_end(&mut value)?;
    let manifest: BackupManifest = serde_json::from_slice(&value)?;
    if manifest.version != 1 {
        return Err(AppError::BackupFormat);
    }
    Ok(manifest)
}

pub fn inspect_backup(path: &Path) -> AppResult<BackupInspection> {
    let input = fs::File::open(path)?;
    let mut archive = ZipArchive::new(input)?;
    let manifest = read_manifest(&mut archive)?;
    Ok(BackupInspection {
        version: manifest.version,
        created_at: manifest.created_at,
        vault_id: manifest.vault_id,
        database_bytes: manifest.database_bytes,
    })
}

fn extract_entry<R: Read + Seek>(
    archive: &mut ZipArchive<R>,
    name: &str,
    target: &Path,
    limit: u64,
) -> AppResult<()> {
    let mut entry = archive.by_name(name)?;
    if entry.size() > limit {
        return Err(AppError::BackupFormat);
    }
    let mut output = fs::OpenOptions::new()
        .create_new(true)
        .write(true)
        .open(target)?;
    std::io::copy(&mut entry, &mut output)?;
    output.sync_all()?;
    Ok(())
}

pub struct RestoredVault {
    pub vault_dir: PathBuf,
    pub key: Zeroizing<Vec<u8>>,
}

pub fn restore_backup(
    backup_path: &Path,
    target_dir: &Path,
    credential: &str,
    use_recovery: bool,
) -> AppResult<RestoredVault> {
    if target_dir.exists() && fs::read_dir(target_dir)?.next().is_some() {
        return Err(AppError::VaultExists);
    }
    fs::create_dir_all(target_dir)?;
    let staging = target_dir.join(format!(".restore-{}", uuid::Uuid::new_v4()));
    fs::create_dir(&staging)?;
    let result = (|| {
        let input = fs::File::open(backup_path)?;
        let mut archive = ZipArchive::new(input)?;
        let manifest = read_manifest(&mut archive)?;
        let database_path = staging.join(DATABASE_NAME);
        let envelope_path = staging.join(ENVELOPE_NAME);
        let settings_path = staging.join(SETTINGS_NAME);
        extract_entry(
            &mut archive,
            DATABASE_NAME,
            &database_path,
            2 * 1024 * 1024 * 1024,
        )?;
        extract_entry(&mut archive, ENVELOPE_NAME, &envelope_path, 1024 * 1024)?;
        if manifest.settings_sha256.is_some() {
            extract_entry(&mut archive, SETTINGS_NAME, &settings_path, 1024 * 1024)?;
        }
        let envelope_bytes = fs::read(&envelope_path)?;
        if hash_bytes(&envelope_bytes) != manifest.envelope_sha256 {
            return Err(AppError::BackupIntegrity);
        }
        let (database_hash, database_bytes) = hash_file(&database_path)?;
        if database_hash != manifest.database_sha256 || database_bytes != manifest.database_bytes {
            return Err(AppError::BackupIntegrity);
        }
        if let Some(expected) = manifest.settings_sha256
            && (!settings_path.exists() || hash_file(&settings_path)?.0 != expected)
        {
            return Err(AppError::BackupIntegrity);
        }
        let envelope: KeyEnvelope = serde_json::from_slice(&envelope_bytes)?;
        if envelope.vault_id != manifest.vault_id {
            return Err(AppError::BackupIntegrity);
        }
        let key = unlock_envelope(&envelope, credential, use_recovery)?;
        let connection = open_encrypted(&database_path, &key)?;
        migrate(&connection)?;
        drop(connection);
        for name in [DATABASE_NAME, ENVELOPE_NAME, SETTINGS_NAME] {
            let staged = staging.join(name);
            if staged.exists() {
                fs::rename(staged, target_dir.join(name))?;
            }
        }
        Ok(RestoredVault {
            vault_dir: target_dir.to_path_buf(),
            key,
        })
    })();
    let _ = fs::remove_dir_all(&staging);
    result
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{crypto::create_envelope, storage::initialize_database};

    #[test]
    fn encrypted_backup_restores_with_password_or_recovery_key() {
        let root = tempfile::tempdir().unwrap();
        let source = root.path().join("source");
        fs::create_dir(&source).unwrap();
        let (key, envelope, recovery) = create_envelope("correct horse battery staple").unwrap();
        fs::write(
            source.join(ENVELOPE_NAME),
            serde_json::to_vec(&envelope).unwrap(),
        )
        .unwrap();
        fs::write(source.join(SETTINGS_NAME), b"{\"theme\":\"system\",\"autoLockMinutes\":5,\"revealSeconds\":30,\"clipboardSeconds\":30}").unwrap();
        let connection =
            initialize_database(&source.join(DATABASE_NAME), &key, &envelope.vault_id).unwrap();
        let backup = root.path().join("vault.rhizome-backup");
        export_backup(&connection, &source, &backup).unwrap();
        drop(connection);
        let password_target = root.path().join("password-target");
        restore_backup(
            &backup,
            &password_target,
            "correct horse battery staple",
            false,
        )
        .unwrap();
        let recovery_target = root.path().join("recovery-target");
        restore_backup(&backup, &recovery_target, &recovery, true).unwrap();
        assert!(password_target.join(DATABASE_NAME).exists());
        assert!(recovery_target.join(DATABASE_NAME).exists());
    }

    #[test]
    fn wrong_backup_credential_does_not_publish_vault_files() {
        let root = tempfile::tempdir().unwrap();
        let source = root.path().join("source");
        fs::create_dir(&source).unwrap();
        let (key, envelope, _) = create_envelope("correct horse battery staple").unwrap();
        fs::write(
            source.join(ENVELOPE_NAME),
            serde_json::to_vec(&envelope).unwrap(),
        )
        .unwrap();
        let connection =
            initialize_database(&source.join(DATABASE_NAME), &key, &envelope.vault_id).unwrap();
        let backup = root.path().join("vault.rhizome-backup");
        export_backup(&connection, &source, &backup).unwrap();
        drop(connection);
        let target = root.path().join("target");
        assert!(restore_backup(&backup, &target, "wrong password", false).is_err());
        assert!(!target.join(DATABASE_NAME).exists());
    }
}
