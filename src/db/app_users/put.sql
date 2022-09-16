UPDATE app_users
SET first_name = ${first_name},
    last_name = ${last_name},
    email = ${email}
WHERE user_id = ${user_id}
RETURNING *;

