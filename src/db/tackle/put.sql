UPDATE tackle
SET title = ${title},
    brand =${brand},
    color = ${color},
    description = ${description}
WHERE tackle_id = ${tackle_id}
RETURNING *;