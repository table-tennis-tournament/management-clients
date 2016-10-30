package models

import java.sql.{Date, Timestamp}

import org.joda.time.DateTime

case class TTTableDAO(
                    id: Long,
                    name: String,
                    left: Long,
                    top: Long,
                    matchId: Option[Long],
                    tourId: Long,
                    groupId: Option[Long]
                  )

case class TTTable(
                       id: Long,
                       name: String,
                       left: Long,
                       top: Long,
                       ttMatch: Match
                     )

case class MatchDAO (
                 id: Long,
                 isPlaying: Boolean,
                 player1Id: Long,
                 player2Id: Long,
                 ttTableId: Option[Long]
                 )

case class Match (
                      id: Long,
                      isPlaying: Boolean,
                      player1: Player,
                      player2: Player,
                      ttTable: Option[TTTable]
                    )

case class PlayerDAO (
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
                  phone: Option[String],
                  clubId: Long
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
                        phone: Option[String],
                        club: Club
                      )

case class ClubDAO (
                id: Long,
                name: String
                )

case class Club (
                     id: Long,
                     name: String
                   )