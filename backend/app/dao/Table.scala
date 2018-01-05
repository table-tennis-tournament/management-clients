package dao

import java.util.UUID
import javax.inject.{Inject, Named}
import javax.print.{PrintService, PrintServiceLookup}

import actors.PrinterActor.Print
import akka.actor.ActorRef
import com.github.tototoshi.slick.MySQLJodaSupport
import models._
import org.joda.time.DateTime
import play.api.Logger
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import slick.driver.JdbcProfile
import com.github.tototoshi.slick.MySQLJodaSupport._
import play.api.libs.json.Json
import slick.ast.Union
import websocket.WebSocketActor.{MatchListDelete, MatchToTable}

import scala.concurrent.Future
import scala.concurrent.duration._

/**
  * Created by jonas on 29.09.16.
  */
class Tables @Inject()(protected val dbConfigProvider: DatabaseConfigProvider, @Named("printer_actor") printerActor: ActorRef, @Named("publisher_actor") pub: ActorRef) extends HasDatabaseConfigProvider[JdbcProfile] {

  import driver.api._

  object PortableJodaSupport extends com.github.tototoshi.slick.GenericJodaSupport(dbConfigProvider.get.driver)

  import PortableJodaSupport._

  var printOnStart: Boolean = true
  var autoStart: Boolean = false

  // Tables
  private val ttTables = TableQuery[TTTablesTable]
  private val matches = TableQuery[MatchesTable]
  private val player = TableQuery[PlayerTable]
  private val matchTypes = TableQuery[MatchTypeTable]
  private val types = TableQuery[TypeTable]
  private val groups = TableQuery[GroupTable]
  private val clubs = TableQuery[ClubTable]
  private val doubles = TableQuery[DoubleTable]
  // private val matchList = TableQuery[MatchListTable]

  var ttTablesSeq = Seq.empty[TTTable]
  var ttMatchSeq = Seq.empty[TTMatch]
  var ttPlayerSeq = Seq.empty[Player]
  var ttClubsSeq = Seq.empty[Club]
  var ttMatchTypeSeq = Seq.empty[MatchType]
  var ttTypeSeq = Seq.empty[Type]
  var ttGroupsSeq = Seq.empty[Group]
  var ttDoublesSeq = Seq.empty[Double]
  var ttMatchListSeq = Seq.empty[MatchList]

  class ContainsAnyOf[T](seq: Seq[T]) {
    def containsAnyOf(xs: Seq[T]) = seq.exists(xs.contains(_))
  }

  implicit def seqToContainsAnyOf[T](seq: Seq[T]) = new ContainsAnyOf(seq)

  def updateTTTables() = {
    Logger.info("update()")
    val ttTableF = dbConfigProvider.get.db.run(ttTables.filterNot(_.name === 0).sortBy(_.name.asc).result)
    ttTableF map { ttTables =>
      ttTablesSeq = ttTables.map(t => toTTTable(t))
      Logger.debug("read Tables: " + ttTablesSeq.size.toString)
      true
    }
  }

  def toTTTable(ttTableDAO: TTTableDAO) = TTTable(ttTableDAO.id, ttTableDAO.tableNumber, ttTableDAO.isLocked)

  def allTTTables(): Seq[TTTable] = {
    Logger.info("all()")
    ttTablesSeq
  }

  def getFreeTables(): Seq[TTTable] = {
    ttTablesSeq.filter(t => t.matchId.isEmpty && !t.isLocked.getOrElse(false))
  }

  // def getFreeTable(): Future[Option[TTTable]] = getFreeTable(Seq.empty[Long])

  def getFreeTable(tableIds: Seq[Long]): Option[TTTable] = {
    val freeTables = getFreeTables
    if (tableIds.isEmpty) {
      freeTables.headOption
    } else {
      freeTables.filter(t => tableIds.contains(t.id)).headOption
    }
  }

  def getTTTable(id: Option[Long]): Option[TTTable] = {
    if (id.isDefined) getTTTable(id.get) else None
  }

  def getTTTableFromName(name: Int): Option[TTTable] = {
    ttTablesSeq.filter(_.tableNumber == name).headOption
  }

  def getTTTable(id: Long): Option[TTTable] = {
    ttTablesSeq.filter(_.id == id).headOption
  }

  def freeTTTable(matchId: Long) = {
    ttTablesSeq = ttTablesSeq map { t =>
      t.copy(matchId = t.matchId.filterNot(_ == matchId))
    }
    ttMatchSeq = ttMatchSeq map { m =>
      if (m.id == matchId) m.copy(isPlayed = true, isPlaying = false)
      else m
    }
  }

  def takeBackTTTable(matchId: Long) = {
    ttTablesSeq = ttTablesSeq map { t =>
      t.copy(matchId = t.matchId.filterNot(_ == matchId))
    }
    ttMatchSeq = ttMatchSeq map { m =>
      if (m.id == matchId) m.copy(isPlaying = false, isPlayed = false)
      else m
    }
  }

  def lockTTTable(id: Long) = {
    ttTablesSeq = ttTablesSeq map { t =>
      if (t.id == id) t.copy(isLocked = Some(true))
      else t
    }
  }

  def unlockTTTable(id: Long) = {
    ttTablesSeq = ttTablesSeq map { t =>
      if (t.id == id) t.copy(isLocked = Some(false))
      else t
    }
  }

  def getTTTableFromMatchId(id: Long): Seq[Int] = {
    ttTablesSeq.filter(_.matchId.contains(id)).map(_.tableNumber).sortBy(a => a)
  }

  class TTTablesTable(tag: Tag) extends Table[TTTableDAO](tag, "tables") {

    def id = column[Long]("Tabl_ID", O.PrimaryKey, O.AutoInc)

    def name = column[Int]("Tabl_Name")

    def left = column[Long]("Tabl_Left")

    def top = column[Long]("Tabl_Top")

    // def matchId = column[Long]("Tabl_Matc_ID")

    def tourId = column[Long]("Tabl_Tour_ID")

    def groupId = column[Option[Long]]("Tabl_Group")

    //def isLocked = column[Option[Boolean]]("Tabl_isLocked")

    //def ttMatch = foreignKey("Matc_FK", matchId, matches)(_.id.?)

    def * = (id, name, None) <> (TTTableDAO.tupled, TTTableDAO.unapply _)
  }

  // Matches

  def isPossibleMatch(ml: MatchList) = {
    val matches = ml.matchId.map(matchId => getMatch(matchId).get)
    val p = matches map { m =>
      if (!(m.isPlayed || m.isPlaying)) {
        val matches = allMatches()
        (m.player1Ids ++ m.player2Ids).forall { p =>
          val ml = matches.filter { ma =>
            ma.isPlaying && (ma.player1Ids.contains(p) || ma.player2Ids.contains(p))
          }
          ml.isEmpty // p is not playing
        }
      } else {
        false
      }
    }
    p.fold(true)((x, y) => x && y)
  }

  def startNextMatch = if(autoStart) {
    val tl = getFreeTables().sortBy(_.tableNumber)
    val tl2 = tl.filter(_.tableNumber % 2 == 1) ++ tl.filter(_.tableNumber % 2 == 0)
    tl2 map { table =>
      Logger.debug("start next Match")
      val ml = getMatchList
      val inverseFilteredML = ml.filterNot(mlItem => isPossibleMatch(mlItem))
      val filteredML = ml.filter { mlItem =>
        val m1PlayerIds = mlItem.matchId.map(id => getMatch(id).get.player1Ids ++ getMatch(id).get.player2Ids).flatten.distinct
        Logger.debug("m1: " + m1PlayerIds.toString())
        isPossibleMatch(mlItem) &&
        inverseFilteredML.forall{ml =>
          val m2PlayerIds = ml.matchId.map(id => getMatch(id).get.player1Ids ++ getMatch(id).get.player2Ids).flatten.distinct
          Logger.debug("m2: " + m1PlayerIds.toString())
          ml.position > mlItem.position || m2PlayerIds.forall(id => !m1PlayerIds.contains(id))
        }
      }
      filteredML.sortBy(_.position).headOption match {
        case Some(ml) =>
          val matchIds = ml.matchId
          val tableId = table.id
          val matches = allMatches()
          Logger.info("matches: " + matches.toString())
          val m = matchIds.map(id => matches.filter(_.id == id).head)
          val matchReady = m.forall(m => if (!(m.isPlayed || m.isPlaying)) {
            (m.player1Ids ++ m.player2Ids).forall { p =>
              val ml = matches.filter { ma =>
                ma.isPlaying && (ma.player1Ids.contains(p) || ma.player2Ids.contains(p))
              }
              ml.isEmpty // p is not playing
            }
          } else {
            false
          })
          val res = if (matchReady) {
            val result = matchIds map { matchId =>
              Logger.info("Set match to Table")
              Logger.info(getMatchList.toString())
              Logger.info("matchId: " + matchId)
              val ml = getMatchList
              ml.filter(_.matchId.contains(matchId)).headOption match {
                case Some(mlItem) => {
                  Logger.info("delMatchList")
                  delMatchListItem(mlItem.uuid.get, matchId)
                  startMatch(matchId, table.id, true)
                }
                case _ => {
                  startMatch(matchId, table.id, true)
                }
              }
            }
            result.forall(x => x)
          } else {
            Logger.error("Match not ready")
            false
          }
          Logger.info("result: " + res.toString() + " " + table.toString + " " + m.toString())
          if(res) {
            pub ! MatchToTable(tableId)
            pub ! MatchListDelete
          }
        case _ =>
      }
    }
  }

  def updateMatches(): Future[Boolean] = {
    dbConfigProvider.get.db.run(matches.result) map { res =>
      val x = res map { r =>
        toMatch(r)
      }
      ttMatchSeq = x
      Logger.debug("read Matches: " + ttMatchSeq.size.toString)
      true
    }
  }

  def loadNewMatches(): Future[Boolean] = {
    dbConfigProvider.get.db.run(matches.result) map { res =>
      val x = res map { r =>
        toMatch(r)
      }
      val matchSeqIds = ttMatchSeq.map(_.id)
      val newMatches = x.filter(m => !matchSeqIds.contains(m.id))
      ttMatchSeq = ttMatchSeq ++ newMatches
      Logger.info("add Matches " + newMatches.size.toString)
      true
    }
  }

  def allMatches(): Seq[TTMatch] = {
    ttMatchSeq
  }

  def getMatchesOnTable(id: Long): Seq[TTMatch] = {
    ttMatchSeq.filter( m => ttTablesSeq.filter(_.id == id).head.matchId.contains(m.id))
  }

  def isPlayable(ttMatch: TTMatch): Boolean = {
    val players = ttMatch.player1Ids ++ ttMatch.player2Ids
    val playingSeq = players map {p =>
      ttMatchSeq.filter(_.isPlaying).filter(m => (m.player1Ids ++ m.player2Ids).contains(p)).isEmpty
    }
    playingSeq.forall(x => x)
  }

  def toMatch(m: MatchDAO): TTMatch = {
    if (m.team1Id < 100000 && m.team2Id < 100000) {
      Logger.debug("single")
      TTMatch(m.id, m.isPlaying, m.team1Id, m.team2Id, Seq(m.team1Id), Seq(m.team2Id), m.isPlayed, m.matchTypeId,
        m.typeId, m.groupId, m.startTime, m.resultRaw, m.result, m.balls1, m.balls2, m.sets2, m.sets2, m.nr, m.plannedTableId, 1,
        if(m.matchTypeId == 9) Some(m.roundNumber) else None)
    } else {
      Logger.debug("double")
      val d1 = getDouble(m.team1Id - 100000)
      val d2 = getDouble(m.team2Id - 100000)
      val x = TTMatch(m.id, m.isPlaying, m.team1Id, m.team2Id, if (d1.isDefined) Seq(d1.get.player1Id, d1.get.player2Id) else Seq.empty,
        if (d2.isDefined) Seq(d2.get.player1Id, d2.get.player2Id) else Seq.empty, m.isPlayed, m.matchTypeId,
        m.typeId, m.groupId, m.startTime, m.resultRaw, m.result, m.balls1, m.balls2, m.sets2, m.sets2, m.nr, m.plannedTableId,
        2, if(m.matchTypeId == 9) Some(m.roundNumber) else None)
      Logger.debug(x.toString)
      x
    }
  }

  def toMatchDAO(m: TTMatch): MatchDAO = {
    if(m.player1Ids.length == 1)
      MatchDAO(m.id, m.isPlaying, m.player1Ids.headOption.getOrElse(0), m.player2Ids.headOption.getOrElse(0), None, m.isPlayed, m.matchTypeId,
        m.typeId, m.groupId, m.startTime, m.resultRaw, m.result, m.balls1, m.balls2, m.sets2, m.sets2, m.nr, m.plannedTableId,
        m.roundNumber.getOrElse(0))
    else {
      MatchDAO(m.id, m.isPlaying, m.team1Id, m.team2Id, None, m.isPlayed, m.matchTypeId,
        m.typeId, m.groupId, m.startTime, m.resultRaw, m.result, m.balls1, m.balls2, m.sets2, m.sets2, m.nr, m.plannedTableId,
        m.roundNumber.getOrElse(0))
    }
  }

  def startMatch(matchId: Long, tableId: Long, print: Boolean = true): Boolean= {
    Logger.debug("start match")
    if(ttTablesSeq.filter(_.matchId == matchId).isEmpty) {
      ttMatchSeq = ttMatchSeq map { m =>
        if (m.id == matchId) m.copy(isPlaying = true)
        else m
      }
      ttTablesSeq = ttTablesSeq map { t =>
        if (t.id == tableId) t.copy(matchId = t.matchId :+ matchId)
        else t
      }
      if(printOnStart && print) printerActor ! Print(getAllMatchInfo(getMatch(matchId).get).get)
      true
    } else {
      false
    }
  }

  def deleteMatch(matchId: Long) = ttMatchSeq = ttMatchSeq.filter(_.id != matchId)

  def startGroup(matchIds: Seq[Long], tableId: Long) = {
    matchIds foreach { mId =>
      startMatch(mId, tableId)
    }
  }

  def getMatch(id: Long): Option[TTMatch] = {
    ttMatchSeq.filter(_.id == id).headOption
  }

  def getAllMatchInfo(ttMatch: TTMatch): Option[AllMatchInfo] = {
    val p1 = ttMatch.player1Ids map {id => getPlayerTypes(getPlayer(id))}
    val p2 = ttMatch.player2Ids map {id => getPlayerTypes(getPlayer(id))}
    val mt = getMatchType(ttMatch.matchTypeId)
    val ty = getType(ttMatch.typeId)
    val g = getGroup(ttMatch.groupId)
    val pl = isPlayable(ttMatch)
    val inML = isInMatchList(ttMatch)
    val tn = getTTTableFromMatchId(ttMatch.id)
    if (mt.isDefined && ty.isDefined)
      Some(AllMatchInfo(ttMatch, p1.filter(_.isDefined).map(_.get), p2.filter(_.isDefined).map(_.get), mt.get, ty.get, g, pl, inML, tn))
    else
      None
  }

  def getMatchesInGroup(id: Long): Seq[TTMatch] = {
    ttMatchSeq.filter(_.groupId.getOrElse(0) == id)
  }

  def isPossibleMatch(id: Long): Boolean = {
    val matchO = ttMatchSeq.filter(_.id == id).headOption
    matchO match {
      case Some(m) => {
        val playerIds = ttMatchSeq.filter(_.isPlaying).map(m => m.player1Ids ++ m.player2Ids).flatten
        playerIds.containsAnyOf(m.player1Ids ++ m.player2Ids)
      }
      case _ => false
    }
  }

  def setResult(id: Long, result: Seq[Seq[Int]]): Future[Boolean] = {
    val x = result map (r => r.mkString("="))
    val resultRaw = x.mkString(",")
    val balls = result.foldRight(Seq(0,0)){(x,y) => Seq(x(0)+y(0), x(1)+y(1))}
    var sets1 = 0
    var sets2 = 0
    for(s <- result) {
      if(s(0) > s(1)){
        sets1 += 1
      } else {
        sets2 += 1
      }
    }
    ttTablesSeq = ttTablesSeq map { t =>
      if (t.matchId.contains(id)) t.copy(matchId = t.matchId.filterNot(_ == id))
      else t
    }
    ttMatchSeq = ttMatchSeq map { m =>
      if (m.id == id) {
        m.copy(
          resultRaw = x.mkString(","),
          isPlaying = false,
          isPlayed = true,
          result = sets1 + " : " + sets2,
          balls1 = balls(0),
          balls2 = balls(1),
          sets1 = sets1,
          sets2 = sets2
        )
      } else m
    }
    ttMatchSeq.find(_.id == id) match {
      case Some(ttMatch) => writeMatch(ttMatch) flatMap { b =>
        if(
               b                                          // write successful
            && ttMatch.groupId.getOrElse(0) == 999        // KO match
            && (2 to 8).contains(ttMatch.matchTypeId)     // not the final match
        ) {
          writeNextKoMatch(ttMatch)
        } else Future.successful(b)
      }
      case _ => Future.successful(false)
    }
  }

  def writeNextKoMatch(ttMatch: TTMatch): Future[Boolean] = {
    val nr = ttMatch.nr
    val newNr =  ((nr/1000)-1)*1000+((nr%1000)+1)/2
    Logger.debug("newNr " + newNr)
    val uMatch = ttMatchSeq.filter(m => m.nr == newNr && m.typeId == ttMatch.typeId).head
    val newMatch = if(nr%1000%2 == 1) {
      uMatch.copy(player1Ids = ttMatch.getWinnerIds, team1Id = ttMatch.team1Id)
    } else {
      uMatch.copy(player2Ids = ttMatch.getWinnerIds, team2Id = ttMatch.team2Id)
    }
    Logger.debug("writeNextKoMatch" + newMatch.toString)
    ttMatchSeq = ttMatchSeq map { m =>
      if (m.id == newMatch.id) newMatch
      else m
    }
    writeMatch(newMatch) map {res =>
      res
    }
  }

  def writeMatch(ttMatch: TTMatch): Future[Boolean] = {
    dbConfigProvider.get.db.run(matches.insertOrUpdate(toMatchDAO(ttMatch))) map {r =>
      Logger.debug("result " + r)
      if(r == 1) true else false
    }
  }

  class MatchesTable(tag: Tag) extends Table[MatchDAO](tag, "matches") {

    def id = column[Long]("Matc_ID", O.PrimaryKey, O.AutoInc)
    def isPlaying = column[Boolean]("Matc_IsPlaying")
    def player1Id = column[Long]("Matc_Play1_ID")
    def player2Id = column[Long]("Matc_Play2_ID")
    def ttTableId = column[Option[Long]]("Matc_Tabl_ID")
    def isPlayed = column[Boolean]("Matc_Played")
    def matchTypeId = column[Long]("Matc_MaTy_ID")
    def typeId = column[Long]("Matc_Type_ID")
    def groupId = column[Option[Long]]("Matc_Grou_ID")
    def startTime = column[DateTime]("Matc_StartTime")
    def resultRaw = column[String]("Matc_ResultRaw")
    def result = column[String]("Matc_Result")
    def balls1 = column[Int]("Matc_Balls1")
    def balls2 = column[Int]("Matc_Balls2")
    def sets1 = column[Int]("Matc_Sets1")
    def sets2 = column[Int]("Matc_Sets2")
    def plannedTableId = column[Option[Long]]("Matc_PlannedTable_ID")
    def nr = column[Int]("Matc_Nr")
    def roundNumber = column[Int]("Matc_RoundNumber")

    def * = (id, isPlaying, player1Id, player2Id, ttTableId, isPlayed, matchTypeId, typeId, groupId, startTime, resultRaw, result,
      balls1, balls2, sets1, sets2, nr, plannedTableId, roundNumber) <> (MatchDAO.tupled, MatchDAO.unapply _)
  }

  // Players

  def getPlayerFromPlayerDAO(p: PlayerDAO): Player = {
    val playerMatches = ttMatchSeq.filterNot(_.isPlayed).filter(m => (m.player1Ids ++ m.player2Ids).contains(p.id))
    val club = if(p.clubId.isDefined) getClub(p.clubId.get) else None
    Player(p.id, p.firstName, p.lastName, p.ttr, p.sex, club, playerMatches.isDefinedAt(0), Seq.empty[Long])
  }

  def updatePlayerList: Future[Boolean] = {
    dbConfigProvider.get.db.run(player.result) map { ap =>
      val x = ap map { p => getPlayerFromPlayerDAO(p)}
      ttPlayerSeq = x
      Logger.debug("read Players: " + ttPlayerSeq.size.toString)
      true
    }
  }

  def allPlayer: Seq[Player] = {
    ttPlayerSeq
  }

  def getPlayer(id: Long): Option[Player] = {
    ttPlayerSeq.filter(_.id == id).headOption
  }

  def getPlayerTypes(playerO: Option[Player]): Option[Player] = {
    playerO match {
      case Some(player) => {
        val types = ttMatchSeq.filter(m => (!m.getResult.isDefined && (m.player1Ids.contains(player.id) || m.player2Ids.contains(player.id))))
          .map(_.typeId).distinct
        Some(player.copy(typeIds = types))
      }
      case _ => None
    }

  }

  class ClubTable(tag: Tag) extends Table[Club](tag, "club") {

    def id = column[Long]("Club_ID", O.PrimaryKey, O.AutoInc)
    def name = column[String]("Club_Name")

    def * = (id, name) <> (Club.tupled, Club.unapply _)
  }

  def updateClubList: Future[Boolean] = {
    dbConfigProvider.get.db.run(clubs.result) map {cList =>
      ttClubsSeq = cList
      Logger.debug("read Clubs: " + ttClubsSeq.size.toString)
      true
    }
  }

  def getClub(id: Long): Option[Club] = {
    ttClubsSeq.filter(_.id == id).headOption
  }

  class PlayerTable(tag: Tag) extends Table[PlayerDAO](tag, "player") {
    def id = column[Long]("Play_ID", O.PrimaryKey, O.AutoInc)
    def firstName = column[String]("Play_FirstName")
    def lastName = column[String]("Play_LastName")
    def ttr = column[Option[Int]]("Play_TTR")
    def paid = column[Boolean]("Play_Paid")
    def sex = column[String]("Play_Sex")
    def email = column[Option[String]]("Play_Email")
    def zipCode = column[Option[String]]("Play_PLZ")
    def location = column[Option[String]]("Play_Location")
    def street = column[Option[String]]("Play_Street")
    def phone = column[Option[String]]("Play_TelNr")
    def clubId = column[Option[Long]]("Play_CLub_ID")

    def * = (id, firstName, lastName, ttr, sex, clubId) <> (PlayerDAO.tupled, PlayerDAO.unapply)

    def club = foreignKey("Club_FK", clubId, clubs)(_.id.?)
  }

  class MatchTypeTable(tag: Tag) extends Table[MatchType](tag, "matchtype") {

    def id = column[Long]("MaTy_ID", O.PrimaryKey, O.AutoInc)
    def name = column[String]("MaTy_Name")

    def * = (id, name) <> (MatchType.tupled, MatchType.unapply _)
  }

  def updateMatchTypeList: Future[Boolean] = {
    dbConfigProvider.get.db.run(matchTypes.result) map {mtList =>
      ttMatchTypeSeq = mtList
      Logger.debug("read MatchTypes: " + ttMatchTypeSeq.size.toString)
      true
    }
  }

  def getMatchType(id: Long): Option[MatchType] = {
    ttMatchTypeSeq.filter(_.id == id).headOption
  }

  class TypeTable(tag: Tag) extends Table[Type](tag, "type") {

    def id = column[Long]("Type_ID", O.PrimaryKey, O.AutoInc)
    def name = column[String]("Type_Name")
    def kind = column[Int]("Type_Kind")
    def active = column[Boolean]("Type_Active")

    def * = (id, name, kind, active) <> (Type.tupled, Type.unapply _)
  }

  def updateTypesList: Future[Boolean] = {
    dbConfigProvider.get.db.run(types.result) map {tList =>
      ttTypeSeq = tList
      Logger.debug("read Types: " + ttTypeSeq.size.toString)
      true
    }
  }

  def getType(id: Long): Option[Type] = {
    ttTypeSeq.filter(_.id == id).headOption
  }

  def allTypes: Seq[Type] = {
    ttTypeSeq
  }

  class GroupTable(tag: Tag) extends Table[Group](tag, "groups") {

    def id = column[Long]("Grou_ID", O.PrimaryKey, O.AutoInc)
    def name = column[String]("Grou_Name")

    def * = (id, name) <> (Group.tupled, Group.unapply _)
  }

  def updateGroupsSeq: Future[Boolean] = {
    dbConfigProvider.get.db.run(groups.result) map {gList =>
      ttGroupsSeq = gList
      Logger.debug("read Groups: " + ttGroupsSeq.size.toString)
      true
    }
  }

  def getGroup(id: Option[Long]): Option[Group] = if(id.isDefined) getGroup(id.get) else None

  def getGroup(id: Long): Option[Group] = {
    ttGroupsSeq.filter(_.id == id).headOption
  }

  class DoubleTable(tag: Tag) extends Table[Double](tag, "doubles") {

    def id = column[Long]("Doub_ID", O.PrimaryKey, O.AutoInc)
    def player1Id = column[Long]("Doub_Play1_ID")
    def player2Id = column[Long]("Doub_Play2_ID")
    def kindId = column[Int]("Doub_Kind")

    def * = (id, player1Id, player2Id, kindId) <> (Double.tupled, Double.unapply _)
  }

  def updateDoublesSeq: Future[Boolean] = {
    dbConfigProvider.get.db.run(doubles.result) map {dList =>
      ttDoublesSeq = dList
      Logger.debug("read Doubles: " + ttDoublesSeq.size.toString)
      true
    }
  }

  def getAllDoubles = ttDoublesSeq

  def getDouble(id: Long): Option[Double] = {
    ttDoublesSeq.filter(_.id == id).headOption
  }

//  class MatchListTable(tag: Tag) extends Table[MatchList](tag, "match_list") {
//
//    def id = column[Long]("id", O.PrimaryKey, O.AutoInc)
//    def matchId = column[Long]("match_id")
//    def asGroup = column[Option[Long]]("as_group")
//    def position = column[Int]("position")
//
//    def * = (id.?, matchId, asGroup, position) <> (MatchList.tupled, MatchList.unapply _)
//  }
//
//  def updateMatchListSeq: Future[Boolean] = {
//    dbConfigProvider.get.db.run(matchList.result) map {mlList =>
//      ttMatchListSeq = mlList.sortBy(_.position)
//      Logger.debug("read MatchList: " + ttMatchListSeq.size.toString)
//      true
//    }
//  }

  def getMatchList = ttMatchListSeq.sortBy(_.position)

  def setMatchList(ml: Seq[MatchList]) = {
    ttMatchListSeq = ml
  }

  def delMatchList(uuid: UUID): Boolean = {
    ttMatchListSeq.filter(_.uuid == Some(uuid)).headOption match {
      case Some(mlItem) => {
        Logger.debug("del: " + mlItem.toString)
        ttMatchListSeq = ttMatchListSeq.filterNot(_.uuid == Some(uuid)) map {mlEntry =>
          if (mlEntry.position > mlItem.position) mlEntry.copy(position = mlEntry.position - 1) else mlEntry
        }
        true
      }
      case _ => false
    }
  }

  def delMatchListItem(uuid: UUID, id: Long) = {
    ttMatchListSeq = ttMatchListSeq map { mlItem =>
      if (mlItem.uuid == Some(uuid)) {
        val newMlItem = mlItem.copy(matchId = mlItem.matchId.filterNot(_ == id))
        newMlItem
      }
      else mlItem
    }
    ttMatchListSeq.filter(_.matchId.isEmpty).foreach(ml => delMatchList(ml.uuid.get))
  }

  def delMatchListGroup(ml: Seq[MatchList], uuid: UUID) = {
    ttMatchListSeq = ml
  }

  def isInMatchList(ttMatch: TTMatch): Boolean = {
    ttMatchListSeq.filter(_.matchId.contains(ttMatch.id)).nonEmpty
  }
//  def startMatch(ttMatch: TTMatch) = {
//    ttMatchSeq = ttMatchSeq map {m =>
//      if (m.id == ttMatch.id) m.copy(isPlaying = true)
//      else m
//    }
//  }
}
