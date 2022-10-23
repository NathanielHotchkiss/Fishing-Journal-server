  ALTER TABLE fishing_logs 
    ADD COLUMN filename VARCHAR(255),
    ADD COLUMN filepath VARCHAR(255),
    ADD COLUMN mimetype VARCHAR(255),
    ADD COLUMN size VARCHAR(255);