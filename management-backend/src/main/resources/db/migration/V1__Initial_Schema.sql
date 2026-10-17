CREATE TABLE IF NOT EXISTS `bezirkekreise` (
  `BeKr_ID` int(10) NOT NULL AUTO_INCREMENT,
  `BeKr_Wert` varchar(10) DEFAULT NULL,
  `BeKr_Club` varchar(100) DEFAULT NULL,
  `BeKr_Bezirk` varchar(100) DEFAULT NULL,
  `BeKr_Kreis` varchar(100) DEFAULT NULL,
  `BeKr_Verband` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`BeKr_ID`)
);

CREATE TABLE IF NOT EXISTS `cashjournal` (
  `Cash_ID` int(10) NOT NULL AUTO_INCREMENT,
  `Cash_Club_ID` int(10) DEFAULT NULL,
  `Cash_Betrag` double DEFAULT NULL,
  `Cash_Date` datetime DEFAULT NULL,
  `Cash_Text` text NOT NULL,
  `Cash_Timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Cash_BezahlArt` int(10) DEFAULT NULL,
  PRIMARY KEY (`Cash_ID`)
);

CREATE TABLE IF NOT EXISTS `club` (
  `club_id` int(10) NOT NULL AUTO_INCREMENT,
  `club_name` varchar(255) DEFAULT NULL,
  `club_verband` varchar(45) DEFAULT NULL,
  `club_shortname` varchar(45) DEFAULT NULL,
  `club_adressename` varchar(100) DEFAULT NULL,
  `club_adressestrasse` varchar(100) DEFAULT NULL,
  `club_adresseort` varchar(100) DEFAULT NULL,
  `club_email` varchar(100) DEFAULT NULL,
  `club_clickttid` int(11) DEFAULT NULL,
  `club_nr` varchar(50) DEFAULT NULL,
  `club_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `club_bezirk` varchar(50) DEFAULT NULL,
  `club_kreis` varchar(50) DEFAULT NULL,
  `club_region` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`club_id`)
);

CREATE TABLE IF NOT EXISTS `doubles` (
  `doub_id` int(10) NOT NULL AUTO_INCREMENT,
  `doub_play1_id` int(10) NOT NULL,
  `doub_play2_id` int(10) NOT NULL,
  `doub_type_id` int(10) NOT NULL,
  `doub_kind` int(10) NOT NULL,
  `doub_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `doub_paid` int(10) NOT NULL,
  `doub_play1_name` varchar(45) NOT NULL,
  `doub_play2_name` varchar(45) NOT NULL,
  `doub_play1_firstname` varchar(45) NOT NULL,
  `doub_play2_firstname` varchar(45) NOT NULL,
  `doub_seed` int(10) DEFAULT NULL,
  `doub_externalid` varchar(45) DEFAULT NULL,
  `doub_startnr` int(10) DEFAULT NULL,
  PRIMARY KEY (`doub_id`)
);

CREATE TABLE IF NOT EXISTS `grouprounds` (
  `GrRo_ID` int(10) NOT NULL AUTO_INCREMENT,
  `GrRo_GroupSize` int(11) DEFAULT NULL,
  `GrRo_ReSort` int(11) DEFAULT '0',
  `GrRo_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `GrRo_Rounds` blob,
  PRIMARY KEY (`GrRo_ID`)
);

CREATE TABLE IF NOT EXISTS `groups` (
  `grou_id` int(10) NOT NULL AUTO_INCREMENT,
  `grou_name` varchar(255) DEFAULT NULL,
  `grou_tour_id` int(10) DEFAULT NULL,
  `grou_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `grou_qualpos` varchar(255) DEFAULT NULL,
  `grou_type_id` int(10) DEFAULT NULL,
  `grou_grouptype` int(10) DEFAULT NULL,
  PRIMARY KEY (`grou_id`)
);

CREATE TABLE IF NOT EXISTS `groupschedule` (
  `gsch_ID` int(10) NOT NULL AUTO_INCREMENT,
  `gsch_GroupSize` int(11) DEFAULT NULL,
  `gsch_RoundNumber` int(11) DEFAULT NULL,
  `gsch_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `gsch_MatchNr` int(11) DEFAULT NULL,
  PRIMARY KEY (`gsch_ID`)
);

CREATE TABLE IF NOT EXISTS `handicap` (
  `hand_ID` int(10) NOT NULL AUTO_INCREMENT,
  `hand_QTTRdifference` int(11) DEFAULT NULL,
  `hand_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `hand_value` int(11) DEFAULT '0',
  PRIMARY KEY (`hand_ID`)
);

CREATE TABLE IF NOT EXISTS `kind` (
  `Kind_ID` int(10) NOT NULL AUTO_INCREMENT,
  `Kind_Name` varchar(255) DEFAULT NULL,
  `Kind_Timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Kind_ID`)
);

CREATE TABLE IF NOT EXISTS `masterdataplayer` (
  `VereinNummer` int(6) NOT NULL DEFAULT '0',
  `NuNummer` varchar(10) NOT NULL DEFAULT '',
  `Timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `VereinName` varchar(100) DEFAULT NULL,
  `Vorname` varchar(45) NOT NULL,
  `Nachname` varchar(45) NOT NULL,
  `Geburtsdatum` datetime NOT NULL,
  `Verband` varchar(45) NOT NULL,
  `Bezirk` varchar(45) DEFAULT NULL,
  `Kreis` varchar(45) DEFAULT NULL,
  `TTRWert` int(10) DEFAULT NULL,
  `TTRPosition` int(10) DEFAULT NULL,
  `BilanzwertGesamt` double DEFAULT NULL,
  `Spielklasse` varchar(45) DEFAULT NULL,
  `Geschlecht` varchar(1) DEFAULT NULL,
  `UpdateDatum` datetime DEFAULT NULL,
  `BilanzwertStr` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`NuNummer`)
);

CREATE TABLE IF NOT EXISTS `matches` (
  `matc_play1_id` int(10) DEFAULT NULL,
  `matc_play2_id` int(10) DEFAULT NULL,
  `matc_isplaying` int(10) DEFAULT NULL,
  `matc_winner_id` int(10) DEFAULT NULL,
  `matc_tabl_id` int(10) DEFAULT NULL,
  `matc_tabl2_id` int(10) DEFAULT NULL,
  `matc_plannedtable_id` int(10) DEFAULT NULL,
  `matc_plannedposition` int(10) DEFAULT NULL,
  `matc_starttime` datetime DEFAULT NULL,
  `matc_roundnumber` int(10) DEFAULT NULL,
  `matc_resultraw` varchar(600) DEFAULT NULL,
  `matc_grou_id` int(10) DEFAULT NULL,
  `matc_maty_id` int(10) DEFAULT NULL,
  `matc_id` int(10) NOT NULL AUTO_INCREMENT,
  `matc_type_id` int(10) DEFAULT NULL,
  `matc_result` varchar(255) DEFAULT NULL,
  `matc_played` int(10) DEFAULT NULL,
  `matc_printed` int(11) NOT NULL DEFAULT '0',
  `matc_uebernommen` int(10) NOT NULL DEFAULT '0',
  `matc_waitinglist` int(10) NOT NULL DEFAULT '0',
  `matc_kampflos` int(10) NOT NULL DEFAULT '0',
  `matc_nr` int(10) NOT NULL DEFAULT '0',
  `matc_parent_id` int(10) DEFAULT NULL,
  `matc_tesm_id` int(10) DEFAULT NULL,
  `matc_resultteam1` int(10) DEFAULT NULL,
  `matc_resultteam2` int(10) DEFAULT NULL,
  `matc_balls1` int(10) DEFAULT '0',
  `matc_balls2` int(10) DEFAULT '0',
  `matc_sets1` int(10) DEFAULT '0',
  `matc_sets2` int(10) DEFAULT '0',
  `matc_code` varchar(10) DEFAULT NULL,
  `matc_schiri_play_id` int(10) DEFAULT '0',
  `matc_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `matc_control` int(10) DEFAULT '0',
  `matc_tesy_id` int(10) DEFAULT '0',
  `matc_playedtable_id` int(10) DEFAULT '0',
  PRIMARY KEY (`matc_id`)
);

CREATE TABLE IF NOT EXISTS `matchtype` (
  `maty_id` int(10) NOT NULL AUTO_INCREMENT,
  `maty_name` varchar(255) DEFAULT NULL,
  `maty_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `maty_player` int(10) DEFAULT NULL,
  PRIMARY KEY (`maty_id`)
);

CREATE TABLE IF NOT EXISTS `platzierungen` (
  `plat_id` int(10) NOT NULL AUTO_INCREMENT,
  `plat_position` int(10) NOT NULL,
  `plat_type_id` int(10) NOT NULL,
  `plat_play1_id` int(10) DEFAULT NULL,
  `plat_play2_id` int(10) DEFAULT NULL,
  `Plat_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`plat_id`)
);

CREATE TABLE IF NOT EXISTS `player` (
  `play_id` int(10) NOT NULL AUTO_INCREMENT,
  `play_firstname` varchar(255) DEFAULT NULL,
  `play_lastname` varchar(255) DEFAULT NULL,
  `play_type_id` int(10) DEFAULT NULL,
  `play_birthdate` datetime DEFAULT NULL,
  `play_club_id` int(10) DEFAULT NULL,
  `play_paid` int(10) DEFAULT NULL,
  `play_seed` int(10) DEFAULT NULL,
  `play_firstnameshort` varchar(45) DEFAULT NULL,
  `play_externalid` int(10) DEFAULT NULL,
  `play_ttinfoid` varchar(30) DEFAULT NULL,
  `play_quote` double DEFAULT NULL,
  `play_ttr` double DEFAULT NULL,
  `play_ttrpos` double DEFAULT NULL,
  `play_ttrstr` varchar(45) DEFAULT NULL,
  `play_clickttid` varchar(50) DEFAULT NULL,
  `play_startnr` int(10) DEFAULT NULL,
  `play_sex` varchar(19) DEFAULT NULL,
  `play_email` varchar(70) DEFAULT NULL,
  `play_plz` varchar(10) DEFAULT NULL,
  `play_location` varchar(50) DEFAULT NULL,
  `play_street` varchar(50) DEFAULT NULL,
  `play_telnr` varchar(30) DEFAULT NULL,
  `play_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `play_licensenr` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`play_id`)
);

CREATE TABLE IF NOT EXISTS `playerpergroup` (
  `PPGr_ID` int(10) NOT NULL AUTO_INCREMENT,
  `PPGr_Play_ID` int(10) DEFAULT NULL,
  `PPGr_Grou_ID` int(10) DEFAULT NULL,
  `PPGr_Type` int(10) DEFAULT NULL,
  `PPGr_Position` int(10) DEFAULT NULL,
  `PPGr_StartPosition` int(10) DEFAULT NULL,
  `PPGr_Timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `PPGr_Name` varchar(50) DEFAULT NULL,
  `PPGr_GamesW` int(10) DEFAULT NULL,
  `PPGr_GamesL` int(10) DEFAULT NULL,
  `PPGr_SetW` int(10) DEFAULT NULL,
  `PPGr_SetL` int(10) DEFAULT NULL,
  `PPGr_PointsW` int(10) DEFAULT NULL,
  `PPGr_PointsL` int(10) DEFAULT NULL,
  `PPGr_ClubName` varchar(100) DEFAULT NULL,
  `PPGr_Games` varchar(45) DEFAULT NULL,
  `PPGr_Sets` varchar(45) DEFAULT NULL,
  `PPGr_Points` varchar(45) DEFAULT NULL,
  `PPGR_Checked` int(10) DEFAULT NULL,
  `PPGr_SetDiff` int(11) DEFAULT NULL,
  `PPGr_SetzPos` int(11) DEFAULT NULL,
  `PPGr_VsPos1` varchar(7) DEFAULT NULL,
  `PPGr_VsPos2` varchar(7) DEFAULT NULL,
  `PPGr_VsPos3` varchar(7) DEFAULT NULL,
  `PPGr_VsPos4` varchar(7) DEFAULT NULL,
  `PPGr_VsPos5` varchar(7) DEFAULT NULL,
  `PPGr_VsPos6` varchar(7) DEFAULT NULL,
  `PPGr_VsPos7` varchar(7) DEFAULT NULL,
  `PPGr_VsPos8` varchar(7) DEFAULT NULL,
  `PPGr_VsPos9` varchar(7) DEFAULT NULL,
  `PPGr_VsPos10` varchar(7) DEFAULT NULL,
  `PPGr_VsPos11` varchar(7) DEFAULT NULL,
  `PPGr_VsPos12` varchar(7) DEFAULT NULL,
  `PPGr_VsPos13` varchar(7) DEFAULT NULL,
  `PPGr_VsPos14` varchar(7) DEFAULT NULL,
  `PPGr_VsPos15` varchar(7) DEFAULT NULL,
  `PPGr_VsPos16` varchar(7) DEFAULT NULL,
  `PPGr_TTR` int(10) DEFAULT '0',
  `PPGr_inactive` int(10) DEFAULT '0',
  `PPGr_Buchholz` int(10) DEFAULT '0',
  `PPGr_FeinBuchholz` int(10) DEFAULT '0',
  `PPGr_ForcePos` int(10) DEFAULT NULL,
  `PPGr_Kreis` varchar(50) DEFAULT NULL,
  `PPGr_RegionName` varchar(50) DEFAULT NULL,
  `PPGr_Verband` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`PPGr_ID`)
);

CREATE TABLE IF NOT EXISTS `playerpermatch` (
  `PPMa_ID` int(10) NOT NULL AUTO_INCREMENT,
  `PPMa_Team_ID` int(10) NOT NULL,
  `PPMa_Matc_ID` int(10) NOT NULL,
  `PPMa_Play_ID` int(10) NOT NULL,
  `PPMa_Position` int(10) DEFAULT NULL,
  `PPMa_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `PPMa_Kind` int(10) DEFAULT NULL,
  PRIMARY KEY (`PPMa_ID`)
);

CREATE TABLE IF NOT EXISTS `playerperteam` (
  `PPTe_ID` int(10) NOT NULL AUTO_INCREMENT,
  `PPTe_Team_ID` int(10) NOT NULL,
  `PPTe_Play_ID` int(10) NOT NULL,
  `PPTe_Doub_ID` int(10) NOT NULL,
  `PPTe_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `PPTe_Position` int(10) DEFAULT NULL,
  PRIMARY KEY (`PPTe_ID`)
);

CREATE TABLE IF NOT EXISTS `playsystem` (
  `ID` int(10) NOT NULL AUTO_INCREMENT,
  `TypeID` int(10) DEFAULT NULL,
  `Timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `SystemID` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ID`)
);

CREATE TABLE IF NOT EXISTS `schedule` (
  `Sche_ID` int(10) NOT NULL AUTO_INCREMENT,
  `Sche_Date` datetime DEFAULT NULL,
  `Sche_Tabl_ID` int(10) NOT NULL,
  `Sche_Matc_ID` int(10) DEFAULT NULL,
  `Sche_Grou_ID` int(10) DEFAULT NULL,
  `Sche_MatchNr` int(10) DEFAULT NULL,
  `Sche_Timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Sche_RoundNumber` int(10) DEFAULT NULL,
  `Sche_Tabl_Name` varchar(20) NOT NULL,
  PRIMARY KEY (`Sche_ID`)
);

CREATE TABLE IF NOT EXISTS `settings` (
  `ID` int(10) NOT NULL AUTO_INCREMENT,
  `Name` varchar(45) NOT NULL,
  `Timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Value` varchar(150) NOT NULL,
  PRIMARY KEY (`ID`)
);

CREATE TABLE IF NOT EXISTS `tables` (
  `tabl_id` int(10) NOT NULL AUTO_INCREMENT,
  `tabl_name` varchar(255) DEFAULT NULL,
  `tabl_group` varchar(255) DEFAULT NULL,
  `tabl_left` int(10) DEFAULT NULL,
  `tabl_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `tabl_top` int(10) DEFAULT NULL,
  `tabl_matc_id` int(10) DEFAULT NULL,
  `tabl_tour_id` int(10) DEFAULT NULL,
  PRIMARY KEY (`tabl_id`)
);

CREATE TABLE IF NOT EXISTS `team` (
  `team_ID` int(10) NOT NULL AUTO_INCREMENT,
  `team_Name` varchar(100) NOT NULL,
  `team_club_id` int(10) NOT NULL,
  `team_type_id` int(10) NOT NULL,
  `team_paid` int(10) NOT NULL,
  `team_seed` int(10) NOT NULL,
  `team_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`team_ID`)
);

CREATE TABLE IF NOT EXISTS `teamsystem` (
  `TeSy_ID` int(10) NOT NULL AUTO_INCREMENT,
  `TeSy_Name` varchar(100) NOT NULL,
  `TeSy_PlayerCount` int(10) DEFAULT NULL,
  `TeSy_PlayerCountB` int(10) DEFAULT NULL,
  `TeSy_DoubleCount` int(10) DEFAULT NULL,
  `TeSy_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `TeSy_WinPoint` int(10) DEFAULT NULL,
  PRIMARY KEY (`TeSy_ID`)
);

CREATE TABLE IF NOT EXISTS `teamsystemmatches` (
  `TeSM_ID` int(10) NOT NULL AUTO_INCREMENT,
  `TeSM_TeSy_ID` int(10) NOT NULL,
  `TeSM_Round` int(10) DEFAULT NULL,
  `TeSM_Play1` varchar(10) NOT NULL,
  `TeSM_Play2` varchar(10) NOT NULL,
  `TeSM_Kind` int(10) DEFAULT NULL,
  `TeSM_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`TeSM_ID`)
);

CREATE TABLE IF NOT EXISTS `tournament` (
  `Tour_ID` int(10) NOT NULL AUTO_INCREMENT,
  `Tour_Name` varchar(255) DEFAULT NULL,
  `Tour_Date` datetime DEFAULT NULL,
  `Tour_TableCount` int(10) DEFAULT NULL,
  `Tour_PrintSchiri` int(10) DEFAULT NULL,
  `Tour_UseThirdPlace` int(10) DEFAULT NULL,
  `Tour_DisplayTables` int(10) DEFAULT NULL,
  `Tour_DisplayPos` varchar(45) DEFAULT NULL,
  `Tour_PrintSchiriFormat` int(10) DEFAULT NULL,
  `Tour_Timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Tour_Verband` int(10) DEFAULT NULL,
  PRIMARY KEY (`Tour_ID`)
);

CREATE TABLE IF NOT EXISTS `type` (
  `type_id` int(10) NOT NULL AUTO_INCREMENT,
  `type_name` varchar(255) DEFAULT NULL,
  `type_class` varchar(255) DEFAULT NULL,
  `type_kind` int(10) DEFAULT NULL,
  `type_syst_id` int(10) DEFAULT NULL,
  `type_clas_id` int(10) DEFAULT NULL,
  `type_kosize` int(10) DEFAULT NULL,
  `type_trostrundesize` int(10) DEFAULT '0',
  `type_urkundeprinted` int(10) DEFAULT NULL,
  `type_startgebuehr` double DEFAULT '0',
  `type_nachmeldegebuehr` double DEFAULT '0',
  `type_printname` varchar(255) DEFAULT NULL,
  `type_clickttcompetition` blob,
  `type_parenttype_id` int(10) DEFAULT NULL,
  `type_active` int(10) DEFAULT '1',
  `type_blocked` int(10) DEFAULT '0',
  `type_tesy_id` int(10) DEFAULT NULL,
  `type_groups` int(10) DEFAULT '0',
  `type_system` int(10) DEFAULT '0',
  `type_nextmatches` int(10) DEFAULT '0',
  `type_sex` varchar(10) DEFAULT NULL,
  `type_agefrom` int(10) DEFAULT '0',
  `type_ageto` int(10) DEFAULT '0',
  `type_yearfrom` int(10) DEFAULT '0',
  `type_yearto` int(10) DEFAULT '0',
  `type_ttrfrom` int(10) DEFAULT '0',
  `type_ttrto` int(10) DEFAULT '0',
  `type_ttrremarks` varchar(200) DEFAULT NULL,
  `type_starttime` datetime DEFAULT NULL,
  `type_trostrunde` int(10) DEFAULT '0',
  `type_dritterplatz` int(10) DEFAULT '0',
  `type_komplettko` int(10) DEFAULT '0',
  `type_aufstellung` int(10) DEFAULT '0',
  `type_gewinnsaetze` int(10) DEFAULT '0',
  `type_vorgabe` int(10) DEFAULT '0',
  `type_winpoints` int(10) DEFAULT '0',
  `type_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `type_alleurkunden` int(10) DEFAULT '0',
  PRIMARY KEY (`type_id`)
);

CREATE TABLE IF NOT EXISTS `typeperplayer` (
  `typl_id` int(10) NOT NULL AUTO_INCREMENT,
  `typl_play_id` int(10) NOT NULL,
  `typl_type_id` int(10) NOT NULL,
  `typl_seed` int(10) NOT NULL,
  `typl_paid` int(10) NOT NULL,
  `typl_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `typl_Cash_ID` int(10) NOT NULL DEFAULT '0',
  `Typl_ExternalID` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`typl_id`)
);

CREATE TABLE IF NOT EXISTS `match_on_table` (
  `id` varchar(36) NOT NULL,
  `match_id` BIGINT NOT NULL,
  `table_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `typecolors` (
  `tyco_id` int(10) NOT NULL AUTO_INCREMENT,
  `tyco_type_id` int(10) NOT NULL,
  `tyco_bg_color` varchar(45) DEFAULT NULL,
  `tyco_text_color` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`tyco_id`)
);
