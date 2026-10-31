CREATE TABLE IF NOT EXISTS `mgmt_matchtable` (
  `id` char(50) NOT NULL,
  `tableId` int(10) NOT NULL,
  `matchId` int(10) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
