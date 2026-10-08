/* Additive: existing jobs/scoring/evidence histories remain unchanged. */
CREATE TABLE actor_registry (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  capability TEXT NOT NULL,
  source TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'apify',
  actor_id TEXT,
  profile TEXT NOT NULL DEFAULT 'metadata-only',
  metadata TEXT NOT NULL DEFAULT '{}',
  review_hash TEXT,
  status TEXT NOT NULL DEFAULT 'NOT_CONFIGURED',
  permission_status TEXT NOT NULL DEFAULT 'REVIEW_REQUIRED',
  security_status TEXT NOT NULL DEFAULT 'REVIEW_REQUIRED',
  enabled INTEGER NOT NULL DEFAULT 0 CHECK(enabled IN (0,1)),
  reviewed_by TEXT REFERENCES users(id),
  reviewed_at INTEGER,
  run_validated_at INTEGER,
  revision INTEGER NOT NULL,
  UNIQUE(workspace_id,capability)
);
CREATE TABLE acquisition_jobs (
  job_id TEXT PRIMARY KEY REFERENCES jobs(id),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  registry_id TEXT NOT NULL REFERENCES actor_registry(id),
  provider TEXT NOT NULL DEFAULT 'apify',
  capability TEXT NOT NULL,
  source TEXT NOT NULL,
  snapshot TEXT NOT NULL,
  input_fingerprint TEXT NOT NULL,
  bounds TEXT NOT NULL,
  actor_input TEXT NOT NULL,
  phase TEXT NOT NULL DEFAULT 'PREPARED',
  run_id TEXT UNIQUE,
  dataset_id TEXT,
  reserved_usd REAL NOT NULL CHECK(reserved_usd>0 AND reserved_usd<=1),
  actual_usage_usd REAL,
  usage TEXT NOT NULL DEFAULT '{}',
  result_count INTEGER NOT NULL DEFAULT 0,
  rejected_count INTEGER NOT NULL DEFAULT 0,
  opportunity_count INTEGER NOT NULL DEFAULT 0,
  validation_run INTEGER NOT NULL DEFAULT 0,
  cancel_requested INTEGER NOT NULL DEFAULT 0,
  abort_sent INTEGER NOT NULL DEFAULT 0,
  started_at INTEGER,
  completed_at INTEGER,
  request_deadline INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_acquisition_workspace ON acquisition_jobs(workspace_id,created_at DESC);
CREATE INDEX idx_acquisition_budget ON acquisition_jobs(created_at,phase);
CREATE TABLE acquisition_signals (
  job_id TEXT NOT NULL REFERENCES acquisition_jobs(job_id),
  signal_id TEXT NOT NULL REFERENCES signals(id),
  row_index INTEGER NOT NULL,
  captured_at INTEGER NOT NULL,
  PRIMARY KEY(job_id,signal_id)
);
