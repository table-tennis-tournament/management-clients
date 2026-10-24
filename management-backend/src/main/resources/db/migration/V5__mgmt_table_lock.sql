CREATE TABLE IF NOT EXISTS `mgmt_table_lock` (
  `tabl_id` BIGINT NOT NULL,
  `locked` int(10) NOT NULL,
  PRIMARY KEY (`tabl_id`)
);
