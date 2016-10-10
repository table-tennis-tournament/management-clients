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
                 isPlaying: Boolean,
                 player1Id: Long,
                 player2Id: Long,
                 ttTableId: Option[Long]
                 )

case class Player (
                  id: Long,
                  firstName: String,
                  lastName: String,
                  ttr: Option[Int],
                  paid: Boolean,
                  sex: String,
                  email: Option[String],
                  zipCode: Option[String],
                  location: Option[String],
                  street: Option[String],
                  phone: Option[String]
                  )

case class MatchInfo (
                     ttMatch: Match,
                     ttTable: Option[TTTable],
                     player1: Option[Player],
                     player2: Option[Player]
                     )