# Users schema

# --- !Ups

CREATE TABLE triggers (id INT(6) PRIMARY KEY, trigger_name VARCHAR(30) , trigger_val INTEGER);
INSERT INTO triggers (id, trigger_name, trigger_val) VALUES (0, 'tables', 0);
INSERT INTO triggers (id, trigger_name, trigger_val) VALUES (1, 'matches', 0);
INSERT INTO triggers (id, trigger_name, trigger_val) VALUES (2, 'player', 0);
CREATE TRIGGER tables_trigger BEFORE UPDATE ON tables FOR EACH ROW UPDATE triggers SET trigger_val = 1 where id = 0;
CREATE TRIGGER matches_update_trigger AFTER UPDATE ON matches FOR EACH ROW UPDATE triggers SET trigger_val = 1 where id = 1;
CREATE TRIGGER matches_insert_trigger AFTER INSERT ON matches FOR EACH ROW UPDATE triggers SET trigger_val = 1 where id = 1;
CREATE TRIGGER matches_delete_trigger AFTER DELETE ON matches FOR EACH ROW UPDATE triggers SET trigger_val = 1 where id = 1;
CREATE TRIGGER player_update_trigger AFTER UPDATE ON player FOR EACH ROW UPDATE triggers SET trigger_val = 1 where id = 2;
CREATE TRIGGER player_insert_trigger AFTER INSERT ON player FOR EACH ROW UPDATE triggers SET trigger_val = 1 where id = 2;
CREATE TRIGGER player_delete_trigger AFTER DELETE ON player FOR EACH ROW UPDATE triggers SET trigger_val = 1 where id = 2;
ALTER TABLE tables ADD Tabl_isLocked INT;


# --- !Downs

ALTER TABLE tables DROP COLUMN isLocked;
DROP TRIGGER player_delete_trigger;
DROP TRIGGER player_insert_trigger;
DROP TRIGGER player_update_trigger;
DROP TRIGGER matches_delete_trigger;
DROP TRIGGER matches_insert_trigger;
DROP TRIGGER matches_update_trigger;
DROP TRIGGER tables_trigger;
DROP TABLE triggers;