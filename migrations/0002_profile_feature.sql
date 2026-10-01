-- Composite foreign key enforces that a selected list belongs to this profile.
CREATE UNIQUE INDEX tier_lists_owner_identity ON tier_lists(owner_id, id);
CREATE TABLE profile_features (
    user_id INTEGER PRIMARY KEY REFERENCES users(id),
    list_id INTEGER NOT NULL,
    FOREIGN KEY (user_id, list_id) REFERENCES tier_lists(owner_id, id) ON DELETE CASCADE
);
-- Eligibility and most-liked fallback are evaluated when authorized profiles load.
