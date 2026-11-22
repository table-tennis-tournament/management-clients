-- Calls per player of a match (GLOSSARY: Call, Second call, Third call), replacing the per-match call state.
-- The calls of the matches at a table when this runs are dropped: they are announced again.
CREATE TABLE IF NOT EXISTS `mgmt_match_call` (
  `matc_id` BIGINT NOT NULL,
  `first_call_time` DATETIME NOT NULL,
  PRIMARY KEY (`matc_id`)
);

CREATE TABLE IF NOT EXISTS `mgmt_player_call` (
  `matc_id` BIGINT NOT NULL,
  `play_id` BIGINT NOT NULL,
  `call_number` INT NOT NULL,
  `requested` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`matc_id`, `play_id`)
);

DROP TABLE IF EXISTS `mgmt_match_call_state`;
