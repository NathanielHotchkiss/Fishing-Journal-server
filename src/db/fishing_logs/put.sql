UPDATE fishing_logs
SET species = ${species},
    fish_length = ${fish_length},
    pounds = ${pounds},
    ounces = ${ounces},
    bait = ${bait},
    fishing_method = ${fishing_method},
    filename = ${filename},
    filepath = ${filepath},
    mimetype = ${mimetype},
    size = ${size}
WHERE fish_id = ${fish_id}
RETURNING *;

