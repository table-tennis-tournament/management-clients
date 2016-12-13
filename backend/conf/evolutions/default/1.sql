# Users schema

# --- !Ups

CREATE TABLE bezirkekreise (BeKr_ID INT(10) UNSIGNED, BeKr_StartPosition INT(11), BeKr_Laenge INT(10) UNSIGNED, BeKr_Wert VARCHAR(10),
  BeKr_Bezirk VARCHAR(100), BeKr_Kreis VARCHAR(100), BeKr_Verband VARCHAR(45));
CREATE TABLE cashjournal (Cash_ID INT(10) UNSIGNED, Cash_Club_ID INT(10) UNSIGNED, Cash_Betrag DOUBLE, Cash_Date DATETIME,
  Cash_Text VARCHAR(100), Cash_BezahlArt INT(10) UNSIGNED);
CREATE TABLE club (Club_ID INT(10), Club_Name VARCHAR(255), Club_Verband VARCHAR(45), Club_ShortName VARCHAR(45), Club_AdresseName VARCHAR(100),
  Club_AdresseStrasse VARCHAR(100), Club_AdresseOrt VARCHAR(100), Club_Email VARCHAR(100), Club_ClickTTID INT(11), Club_Nr VARCHAR(50),
  Club_Bezirk VARCHAR(50), Club_Kreis VARCHAR(50), Club_Region VARCHAR(50));
CREATE TABLE doubles (Doub_ID INT(10) UNSIGNED, Doub_Play1_ID INT(10) UNSIGNED, Doub_Play2_ID INT(10) UNSIGNED, Doub_Type_ID INT(10) UNSIGNED,
  Doub_Kind INT(10) UNSIGNED, Doub_Paid INT(10) UNSIGNED,, Doub_Play1_Name VARCHAR(45), Doub_Play2_Name VARCHAR(45), Doub_Play1_FirstName VARCHAR(45),
  Doub_Play2_FirstName VARCHAR(45), Doub_Seed INT(10), Doub_ExternalID VARCHAR(45), Doub_StartNr INT(10) UNSIGNED);
CREATE TABLE grouprounds (GrRo_ID INT(10) UNSIGNED, GrRo_GroupSize INT(11), GrRo_ReSort INT(11), GrRo_Rounds BLOB);
CREATE TABLE groups (Grou_ID INT(10), Grou_Name VARCHAR(255), Grou_Tour_ID INT(10), Grou_QualPos VARCHAR(255), Grou_Type_ID INT(10),
  Grou_GroupType INT(10));
CREATE TABLE groupschedule (gsch_ID INT(10) UNSIGNED, gsch_GroupSize INT(11), gsch_RoundNumber INT(11), gsch_MatchNr INT(11));
CREATE TABLE handcap (hand_ID INT(10) UNSIGNED, hand_QTTRdifference INT(11), hand_value INT(11));
CREATE TABLE kind (Kind_ID INT(10), Kind_Name VARCHAR(255));


# --- !Downs

DROP TABLE kind;
DROP TABLE handcap;
DROP TABLE groupschedule;
DROP TABLE groups;
DROP TABLE grouprounds;
DROP TABLE doubles;
DROP TABLE club;
DROP TABLE cashjournal;
DROP TABLE bezirkekreise;