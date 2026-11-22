-- A short name per discipline, for places with little room such as the table cards. mktt's `type` table
-- has no column for it and must not be altered (ADR 0001), so it lives here. A discipline without a row
-- is shown by its full name.
CREATE TABLE IF NOT EXISTS `mgmt_type_short_name` (
  `tysn_type_id` BIGINT NOT NULL,
  `tysn_short_name` VARCHAR(30) NOT NULL,
  PRIMARY KEY (`tysn_type_id`)
);
