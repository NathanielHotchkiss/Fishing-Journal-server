UPDATE tackle
SET title = ${title},
    description = ${description},
    type = ${type}
WHERE tackle_id = ${tackle_id}
RETURNING *;