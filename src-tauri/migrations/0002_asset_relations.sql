CREATE TABLE IF NOT EXISTS asset_relations (
  id TEXT PRIMARY KEY,
  source_asset_id TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  target_asset_id TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL CHECK (relation_type IN (
    'used_to_register',
    'used_to_login',
    'used_to_recover',
    'issues_credential',
    'shared_account',
    'other'
  )),
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (source_asset_id <> target_asset_id),
  UNIQUE(source_asset_id, target_asset_id, relation_type)
);

CREATE INDEX IF NOT EXISTS idx_asset_relations_source ON asset_relations(source_asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_relations_target ON asset_relations(target_asset_id);
