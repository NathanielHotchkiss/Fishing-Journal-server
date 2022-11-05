SELECT * FROM go_insert_new_fishing_log(
  ${user_id},
  ${species},
  ${fish_length},
  ${pounds},
  ${ounces},
  ${bait},
  ${fishing_method},
  ${filename},
  ${filepath},
  ${mimetype},
  ${size}
);