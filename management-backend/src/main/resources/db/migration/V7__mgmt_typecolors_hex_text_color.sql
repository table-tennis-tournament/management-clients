-- The text color held only five characters ("white", "black"); a hex color like "#000000" needs seven,
-- as the background color already allows.
ALTER TABLE mgmt_typecolors MODIFY tyco_text_color VARCHAR(7) NOT NULL;
