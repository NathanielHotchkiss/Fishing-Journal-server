CREATE TABLE fish_images (
    id SERIAL NOT NULL PRIMARY KEY,
    log_id BIGINT REFERENCES fishing_logs(fish_id),
    filename TEXT UNIQUE NOT NULL,
    filepath TEXT NOT NULL,
    mimetype TEXT NOT NULL,
    size BIGINT NOT NULL
);