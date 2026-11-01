CREATE TABLE IF NOT EXISTS `mgmt_player_active` (
  `play_id` BIGINT NOT NULL,
  `active` int(10) NOT NULL,
  PRIMARY KEY (`play_id`)
);
