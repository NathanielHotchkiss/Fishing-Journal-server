  CREATE TABLE app_users(
    user_id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password TEXT NOT NULL,
    created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    archived TIMESTAMPTZ DEFAULT NULL
  );

  CREATE TABLE fishing_logs (
    fish_id BIGSERIAL PRIMARY KEY,
    species VARCHAR(255) NOT NULL,
    user_id BIGINT references app_users(user_id) NOT NULL,
    fish_length VARCHAR(255) NOT NULL,
    pounds VARCHAR(255) NOT NULL,
    ounces VARCHAR(255) NOT NULL,
    bait VARCHAR(255) NOT NULL,
    fishing_method VARCHAR(255) NOT NULL,
    created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    archived TIMESTAMPTZ DEFAULT NULL
);