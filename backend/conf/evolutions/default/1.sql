# Users schema

# --- !Ups

ALTER TABLE tables ADD Tabl_isLocked INT;


# --- !Downs

ALTER TABLE tables DROP COLUMN isLocked;