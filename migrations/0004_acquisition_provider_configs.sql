/* Provider-neutral extensions. Existing Apify tables and evidence remain unchanged. */
CREATE TABLE provider_configs (
 id TEXT PRIMARY KEY,
 workspace_id TEXT NOT NULL REFERENCES workspaces(id),
 provider TEXT NOT NULL,
 candidate_id TEXT NOT NULL,
 source TEXT NOT NULL,
 capability TEXT NOT NULL,
 definition TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'DISCOVERED',
 mode TEXT NOT NULL DEFAULT 'MOCK',
 enabled INTEGER NOT NULL DEFAULT 0 CHECK(enabled IN (0,1)),
 reviewed_by TEXT REFERENCES users(id),
 reviewed_at INTEGER,
 policy TEXT NOT NULL DEFAULT '{}',
 policy_reviewed_at INTEGER,
 validated_at INTEGER,
 approved_at INTEGER,
 revision INTEGER NOT NULL,
 UNIQUE(workspace_id,provider,candidate_id)
);
CREATE TABLE provider_quota_budgets (
 id TEXT PRIMARY KEY,
 provider TEXT NOT NULL,
 candidate_id TEXT NOT NULL,
 period_end INTEGER NOT NULL,
 available INTEGER NOT NULL CHECK(available>=0),
 reserved INTEGER NOT NULL DEFAULT 0 CHECK(reserved>=0),
 observed_remaining INTEGER,
 updated_at INTEGER NOT NULL
);
CREATE TABLE acquisition_runs (
 job_id TEXT PRIMARY KEY REFERENCES jobs(id),
 workspace_id TEXT NOT NULL REFERENCES workspaces(id),
 provider_config_id TEXT NOT NULL REFERENCES provider_configs(id),
 provider TEXT NOT NULL,
 source TEXT NOT NULL,
 capability TEXT NOT NULL,
 quota_id TEXT NOT NULL REFERENCES provider_quota_budgets(id),
 snapshot TEXT NOT NULL,
 bounds TEXT NOT NULL,
 request_fingerprint TEXT NOT NULL,
 phase TEXT NOT NULL DEFAULT 'PREPARED',
 mode TEXT NOT NULL,
 reserved_requests INTEGER NOT NULL CHECK(reserved_requests=1),
 request_count INTEGER NOT NULL DEFAULT 0,
 max_spend REAL NOT NULL CHECK(max_spend=0),
 estimated_cost_usd REAL NOT NULL CHECK(estimated_cost_usd=0),
 actual_cost_usd REAL,
 response_status INTEGER,
 response_metadata TEXT NOT NULL DEFAULT '{}',
 normalized_buffer TEXT,
 result TEXT,
 error_code TEXT,
 created_at INTEGER NOT NULL,
 completed_at INTEGER
);
CREATE INDEX idx_acquisition_runs_workspace ON acquisition_runs(workspace_id,created_at);
CREATE INDEX idx_acquisition_runs_provider ON acquisition_runs(provider,created_at);
CREATE TABLE evidence_receipts (
 job_id TEXT NOT NULL REFERENCES acquisition_runs(job_id),
 signal_id TEXT NOT NULL REFERENCES signals(id),
 provider TEXT NOT NULL,
 source TEXT NOT NULL,
 provenance TEXT NOT NULL,
 captured_at INTEGER NOT NULL,
 PRIMARY KEY(job_id,signal_id)
);
