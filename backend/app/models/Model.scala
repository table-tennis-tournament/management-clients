package models

case class TTTable(id: Long, name: String, left: Long, top: Long, matchId: Option[Long], tourId: Long, groupId: Option[Long])