CREATE TABLE
    IF NOT EXISTS user_connections (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
        user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        driver text NOT NULL,
        name text NOT NULL,
        host text NOT NULL,
        port int NOT NULL,
        database text NOT NULL,
        db_user text NOT NULL,
        password_enc text NULL,
        created_at timestamptz NOT NULL DEFAULT now (),
        updated_at timestamptz NOT NULL DEFAULT now (),
        last_used_at timestamptz NULL
    );

CREATE INDEX IF NOT EXISTS idx_user_connections_user_id ON user_connections (user_id);