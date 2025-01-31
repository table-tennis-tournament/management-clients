# --- !Ups

CREATE TABLE IF NOT EXISTS `type` (
  `Type_ID` int(10) NOT NULL AUTO_INCREMENT,
  `Type_Name` varchar(255) DEFAULT NULL,
  `Type_Kind` int(10) DEFAULT NULL,
  `Type_Syst_ID` int(10) DEFAULT NULL,
  `Type_Clas_id` int(10) DEFAULT NULL,
  `Type_KOSize` int(10) unsigned DEFAULT NULL,
  `Type_TrostrundeSize` int(10) unsigned DEFAULT 0,
  `Type_UrkundePrinted` int(10) unsigned DEFAULT NULL,
  `Type_StartGebuehr` double DEFAULT 0,
  `Type_NachmeldeGebuehr` double DEFAULT 0,
  `Type_PrintName` varchar(255) DEFAULT NULL,
  `Type_clickTTCompetition` blob DEFAULT NULL,
  `Type_Parenttype_ID` int(10) DEFAULT NULL,
  `Type_Active` int(10) DEFAULT 1,
  `Type_Blocked` int(10) DEFAULT 0,
  `Type_TeSy_ID` int(10) DEFAULT NULL,
  `Type_groups` int(10) DEFAULT 0,
  `Type_System` int(10) DEFAULT 0,
  `Type_nextmatches` int(10) DEFAULT 0,
  `Type_Sex` varchar(10) DEFAULT NULL,
  `Type_AgeFrom` int(10) DEFAULT 0,
  `Type_AgeTo` int(10) DEFAULT 0,
  `Type_YearFrom` int(10) DEFAULT 0,
  `Type_YearTo` int(10) DEFAULT 0,
  `Type_TTRFrom` int(10) DEFAULT 0,
  `Type_TTRTo` int(10) DEFAULT 0,
  `Type_TTRRemarks` varchar(200) DEFAULT NULL,
  `Type_StartTime` datetime DEFAULT NULL,
  `Type_Trostrunde` int(10) DEFAULT 0,
  `Type_DritterPlatz` int(10) DEFAULT 0,
  `Type_KomplettKO` int(10) DEFAULT 0,
  `type_Aufstellung` int(10) DEFAULT 0,
  `type_GewinnSaetze` int(10) DEFAULT 0,
  `type_Vorgabe` int(10) DEFAULT 0,
  `type_WinPoints` int(10) DEFAULT 0,
  `Type_timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `type_alleUrkunden` int(10) DEFAULT 0,
  `type_KORounds` int(10) DEFAULT 0,
  PRIMARY KEY (`Type_ID`),
  KEY `Type_Clas_id` (`Type_Clas_id`),
  KEY `Type_System_ID` (`Type_Syst_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


# --- !Downs

DROP TABLE IF EXISTS type; 