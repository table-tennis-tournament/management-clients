CREATE TABLE IF NOT EXISTS `match_on_table` (
  `id` varchar(36) NOT NULL,
  `match_id` BIGINT NOT NULL,
  `table_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `typecolors` (
  `tyco_id` int(10) NOT NULL AUTO_INCREMENT,
  `tyco_type_id` int(10) NOT NULL,
  `tyco_bg_color` varchar(45) DEFAULT NULL,
  `tyco_text_color` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`tyco_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
