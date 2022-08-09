SELECT a.user_id,
  mh.handle
FROM members m
INNER JOIN member_handles mh USING(member_id)
WHERE m.archived IS NULL
  AND mh.archived IS NULL
  AND mh.protocol = 'email'
  AND mh.handle = ANY(${emails});