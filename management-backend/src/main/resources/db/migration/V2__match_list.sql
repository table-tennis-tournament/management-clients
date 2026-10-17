CREATE TABLE IF NOT EXISTS `match_list` (
  `uuid` varchar(36) NOT NULL,
  `match_ids` varchar(600) NOT NULL,
  `as_group` int(10) DEFAULT NULL,
  `position` int(10) NOT NULL,
  PRIMARY KEY (`uuid`)
);
