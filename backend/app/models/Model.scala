package models

import java.sql.{Date, Timestamp}

import org.joda.time.DateTime

case class TTTable(
                    id: Long,
                    name: String,
                    left: Long,
                    top: Long,
                    matchId: Option[Long],
                    tourId: Long,
                    groupId: Option[Long]
                  )

case class Match (
                 id: Long,
                 isPlaying: Boolean
                 )