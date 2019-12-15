# Users schema

# --- !Ups

CREATE TABLE IF NOT EXISTS `matchtable` (
  `id` char(50) NOT NULL,
  `tableId` int(10) NOT NULL,
  `matchId` int(10) NOT NULL,
  `state` int(10) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

# --- !Downs

DROP TABLE IF EXISTS `matchtable`;

