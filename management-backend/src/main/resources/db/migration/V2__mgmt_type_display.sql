-- How the clients show a discipline: its colors and its short name. mktt's `type` table has no columns for them
-- and must not be altered (ADR 0001). Each value is optional; a discipline without a row is shown by its full
-- name in the default colors.
CREATE TABLE IF NOT EXISTS `mgmt_type_display` (
  `tydi_type_id` BIGINT NOT NULL,
  -- a CSS color: a name like "white" or a hex color like "#ffffff"
  `tydi_bg_color` VARCHAR(7) NULL,
  `tydi_text_color` VARCHAR(7) NULL,
  `tydi_short_name` VARCHAR(30) NULL,
  PRIMARY KEY (`tydi_type_id`)
);
