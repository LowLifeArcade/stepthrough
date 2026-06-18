CREATE TABLE IF NOT EXISTS walkthrough_instances (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id),
    title TEXT NOT NULL,
    answers TEXT NOT NULL DEFAULT '{}',
    current_screen_index INTEGER NOT NULL DEFAULT 0,
    completed_at INTEGER DEFAULT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    deleted_at INTEGER DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_walkthrough_instances_project_updated
ON walkthrough_instances(project_id, updated_at DESC);
