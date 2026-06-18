ALTER TABLE walkthrough_instances ADD COLUMN user_id TEXT REFERENCES users(uid);

CREATE INDEX IF NOT EXISTS idx_walkthrough_instances_user_project_updated
ON walkthrough_instances(user_id, project_id, updated_at DESC);
