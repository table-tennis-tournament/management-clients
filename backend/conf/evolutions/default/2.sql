# Type Colors schema

# --- !Ups

CREATE TABLE IF NOT EXISTS `typecolors` (
  `tyco_id` BIGINT NOT NULL AUTO_INCREMENT,
  `tyco_type_id` BIGINT NOT NULL,
  `tyco_bg_color` VARCHAR(7) NOT NULL,
  `tyco_text_color` VARCHAR(5) NOT NULL,
  PRIMARY KEY (`tyco_id`),
  UNIQUE KEY `unique_type` (`tyco_type_id`),
  INDEX `idx_type_id` (`tyco_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

# --- !Downs

DROP TABLE IF EXISTS `typecolors`;
