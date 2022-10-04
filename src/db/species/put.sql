UPDATE species
SET title = ${title},
    description = ${description},
    type = ${type}
WHERE species_id = ${species_id}
RETURNING *;