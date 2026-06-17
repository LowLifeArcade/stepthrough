INSERT OR IGNORE INTO users (uid, email, name, avatar_url)
VALUES ('dev-user', 'dev@example.com', 'Dev User', '');

INSERT OR IGNORE INTO projects (id, user_id, title, description, status, step_count, created_at, updated_at)
VALUES
    ('demo-onboarding', 'dev-user', 'Onboarding walkthrough', 'A first-pass flow for turning a rough idea into a guided step-through.', 'active', 6, unixepoch() - 7200, unixepoch() - 1800),
    ('demo-launch', 'dev-user', 'Launch checklist', 'A reusable sequence for the final review before publishing.', 'draft', 9, unixepoch() - 86400, unixepoch() - 3600);
