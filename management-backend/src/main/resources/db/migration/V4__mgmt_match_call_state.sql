CREATE TABLE IF NOT EXISTS `mgmt_match_call_state` (
  `matc_id` BIGINT NOT NULL,
  `call_state` int(10) NOT NULL,
  PRIMARY KEY (`matc_id`)
);
