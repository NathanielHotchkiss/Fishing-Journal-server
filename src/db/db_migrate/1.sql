  CREATE TABLE app_users (
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
    user_id BIGINT references app_users(user_id) NOT NULL,
    species VARCHAR(255) NOT NULL,
    fish_length VARCHAR(255) NOT NULL,
    pounds VARCHAR(255) NOT NULL,
    ounces VARCHAR(255) NOT NULL,
    bait VARCHAR(255) NOT NULL,
    fishing_method VARCHAR(255) NOT NULL,
    clarity VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(255) NOT NULL,
    mimetype VARCHAR(255) NOT NULL,
    size BIGINT NOT NULL,
    created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    archived TIMESTAMPTZ DEFAULT NULL
);

  CREATE TABLE tackle (
    tackle_id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    user_id BIGINT references app_users(user_id) NOT NULL,
    brand VARCHAR(255),
    color VARCHAR(255),
    description VARCHAR(255),
    created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    archived TIMESTAMPTZ DEFAULT NULL
);

  CREATE TABLE species (
    species_id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    user_id BIGINT references app_users(user_id) NOT NULL,
    description VARCHAR(255),
    type VARCHAR(255),
    created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    archived TIMESTAMPTZ DEFAULT NULL
);