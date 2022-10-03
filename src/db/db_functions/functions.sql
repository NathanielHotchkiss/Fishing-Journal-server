CREATE OR REPLACE FUNCTION go_insert_new_app_user(
  _first_name TEXT,
  _last_name TEXT,
  _email TEXT,
  _password TEXT
) RETURNS SETOF app_users AS $$
DECLARE
  _app_user_id BIGINT;
BEGIN 
  INSERT INTO app_users (
    first_name, 
    last_name,
    email, 
    password
  ) VALUES (
    _first_name,
    _last_name,
    _email,
    _password
  ) RETURNING user_id INTO _app_user_id;
  RETURN QUERY SELECT * FROM app_users WHERE user_id = _app_user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION go_insert_new_fishing_log(
  _user_id BIGINT,
  _species TEXT,
  _fish_length TEXT,
  _pounds TEXT,
  _ounces TEXT,
  _bait TEXT,
  _fishing_method TEXT
) RETURNS SETOF fishing_logs AS $$
DECLARE
  _fish_id BIGINT;
BEGIN 
  INSERT INTO fishing_logs (
    user_id,
    species,
    fish_length,
    pounds,
    ounces,
    bait,
    fishing_method
  ) VALUES (
    _user_id,
    _species,
    _fish_length,
    _pounds,
    _ounces,
    _bait,
    _fishing_method
  ) RETURNING fish_id INTO _fish_id;
  RETURN QUERY SELECT * FROM fishing_logs WHERE fish_id = _fish_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION go_insert_new_tackle(
  _user_id BIGINT,
  _title TEXT,
  _description TEXT,
  _type TEXT
) RETURNS SETOF tackle AS $$
DECLARE
  _tackle_id BIGINT;
BEGIN 
  INSERT INTO tackle (
    user_id,
    title, 
    description,
    type
  ) VALUES (
    _user_id,
    _title,
    _description,
    _type
  ) RETURNING tackle_id INTO _tackle_id;
  RETURN QUERY SELECT * FROM tackle WHERE tackle_id = _tackle_id;
END;
$$ LANGUAGE plpgsql;
