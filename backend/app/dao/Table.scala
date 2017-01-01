package dao

import javax.inject.Inject

import com.github.tototoshi.slick.MySQLJodaSupport
import models._
import org.joda.time.DateTime
import play.api.Logger
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import slick.driver.JdbcProfile
import com.github.tototoshi.slick.MySQLJodaSupport._
import slick.ast.Union

import scala.concurrent.Future
import scala.concurrent.duration._

/**
  * Created by jonas on 29.09.16.
  */

class Tables @Inject()(protected val dbConfigProvider: DatabaseConfigProvider) extends HasDatabaseConfigProvider[JdbcProfile] {
  import driver.api._

  object PortableJodaSupport extends com.github.tototoshi.slick.GenericJodaSupport(dbConfigProvider.get.driver)

  import PortableJodaSupport._

  // Tables
  private val ttTables = TableQuery[TTTablesTable]
  private val matches = TableQuery[MatchesTable]
  private val player = TableQuery[PlayerTable]
  private val matchTypes = TableQuery[MatchTypeTable]
  private val types = TableQuery[TypeTable]
  private val groups = TableQuery[GroupTable]
  private val clubs = TableQuery[ClubTable]
  private val doubles = TableQuery[DoubleTable]
  private val matchList = TableQuery[MatchListTable]

  def resetTriggerTable = {
    dbConfigProvider.get.db.run(sqlu"""UPDATE triggers SET trigger_val = 0 where id = 0;""") map { result =>

    }
  }

  def triggerTable(): Future[Int] = {
    dbConfigProvider.get.db.run(sql"""SELECT trigger_val FROM triggers where id = 0;""".as[Int]) map { result =>
      result.head
    }
  }

  def resetTriggerMatches = {
    dbConfigProvider.get.db.run(sqlu"""UPDATE triggers SET trigger_val = 0 where id = 1;""") map { result =>

    }
  }

  def triggerMatches(): Future[Int] = {
    dbConfigProvider.get.db.run(sql"""SELECT trigger_val FROM triggers where id = 1;""".as[Int]) map { result =>
      result.head
    }
  }

  def resetTriggerPlayer = {
    dbConfigProvider.get.db.run(sqlu"""UPDATE triggers SET trigger_val = 0 where id = 2;""") map { result =>

    }
  }

  def triggerPlayer(): Future[Int] = {
    dbConfigProvider.get.db.run(sql"""SELECT trigger_val FROM triggers where id = 2;""".as[Int]) map { result =>
      result.head
    }
  }

  def allTTTables(): Future[Seq[TTTable]] = {
    Logger.info("all()")
    dbConfigProvider.get.db.run(ttTables.filter(_.name > 0).sortBy(_.name.asc).result)
  }

  def getFreeTables(): Future[Seq[TTTable]] = {
    allTTTables() flatMap {ttTables =>
      val x = ttTables map {t =>
        getMatchOnTable(t.id) map { m =>
          if(m.isDefined) Some(t) else None
        }
      }
      Future.sequence(x) map { ttTables =>
        ttTables.filter(_.isDefined) map (_.get)
      }
    }
  }

  def getFreeTable(): Future[Option[TTTable]] = getFreeTable(Seq.empty[Long])

  def getFreeTable(tableIds: Seq[Long]): Future[Option[TTTable]] = {
    getFreeTables() map {freeTables =>
      if(tableIds.isEmpty) {
        freeTables.headOption
      } else {
        freeTables.filter(t => tableIds.contains(t.id)).headOption
      }
    }
  }

  def getTTTable(id: Option[Long]): Future[Option[TTTable]] = if(id.isDefined) getTTTable(id.get) else Future.successful(None)

  def getTTTable(id: Long): Future[Option[TTTable]] = {
    val tableF = dbConfigProvider.get.db.run(ttTables.filter(_.id === id).result)
    tableF map { t =>
      t.headOption
    }
  }

  def freeTTTable(id: Long): Future[Boolean] = {
    getTTTable(id) flatMap {t =>
      Logger.debug("Table: " + t.toString)
      getMatchOnTable(id) flatMap { m =>
        val mNew = m.get.copy(ttTableId = None, isPlayed = true, isPlaying = false)
        dbConfigProvider.get.db.run(matches.insertOrUpdate(toMatchDAO(mNew))) flatMap {r =>
          val tNew = t.get.copy(matchId = None)
          dbConfigProvider.get.db.run(ttTables.insertOrUpdate(tNew)) map { r =>
            true
          }
        }
      }
    }
  }

  def lockTTTable(id: Long): Future[Boolean] = {
    getTTTable(id) flatMap { t =>
      val tNew = t.get.copy(isLocked = Some(true))
      dbConfigProvider.get.db.run(ttTables.insertOrUpdate(tNew)) map { r =>
        true
      }
    }
  }

  def unlockTTTable(id: Long): Future[Boolean] = {
    getTTTable(id) flatMap { t =>
      val tNew = t.get.copy(isLocked = Some(false))
      dbConfigProvider.get.db.run(ttTables.insertOrUpdate(tNew)) map { r =>
        true
      }
    }
  }

  class TTTablesTable(tag: Tag) extends Table[TTTable](tag, "tables") {

    def id = column[Long]("Tabl_ID", O.PrimaryKey, O.AutoInc)
    def name = column[Int]("Tabl_Name")
    def left = column[Long]("Tabl_Left")
    def top = column[Long]("Tabl_Top")
    def matchId = column[Option[Long]]("Tabl_Matc_ID")
    def tourId = column[Long]("Tabl_Tour_ID")
    def groupId = column[Option[Long]]("Tabl_Group")
    def isLocked = column[Option[Boolean]]("Tabl_isLocked")

    def ttMatch = foreignKey("Matc_FK", matchId, matches)(_.id.?)

    def * = (id, name, isLocked, matchId) <> (TTTable.tupled, TTTable.unapply _)
  }

  // Matches
  def allMatches(): Future[Seq[TTMatch]] = {
    dbConfigProvider.get.db.run(matches.result) flatMap {res =>
      val x = res map { r =>
        toMatch(r)
      }
      Future.sequence(x)
    }
  }

  def toMatch(m: MatchDAO): Future[TTMatch] = {
    if(m.team1Id < 100000)
      Future.successful(TTMatch(m.id, m.isPlaying, m.team1Id, m.team2Id, Seq(m.team1Id), Seq(m.team2Id), m.ttTableId, m.isPlayed, m.matchTypeId,
        m.typeId, m.groupId, m.startTime, m.resultRaw, m.result, m.balls1, m.balls2, m.sets2, m.sets2, m.plannedTableId, 1))
    else
      getDouble(m.team1Id - 100000) flatMap { d1 =>
        getDouble(m.team2Id - 100000) map { d2 =>
          TTMatch(m.id, m.isPlaying, m.team1Id, m.team2Id, if(d1.isDefined && d2.isDefined) Seq(d1.get.player1Id, d1.get.player2Id) else Seq.empty,
            if(d1.isDefined && d2.isDefined) Seq(d2.get.player1Id, d2.get.player2Id) else Seq.empty, m.ttTableId, m.isPlayed, m.matchTypeId,
            m.typeId, m.groupId, m.startTime, m.resultRaw, m.result, m.balls1, m.balls2, m.sets2, m.sets2, m.plannedTableId,
            2)
        }
      }
  }

  def toMatchDAO(m: TTMatch): MatchDAO = {
    MatchDAO(m.id, m.isPlaying, m.team1Id, m.team2Id, m.ttTableId, m.isPlayed, m.matchTypeId,
      m.typeId, m.groupId, m.startTime, m.resultRaw, m.result, m.balls1, m.balls2, m.sets2, m.sets2, m.plannedTableId)
  }

  def getMatch(id: Long): Future[Option[TTMatch]] = {
    val matchF = dbConfigProvider.get.db.run(matches.filter(_.id === id).result)
    matchF flatMap { m =>
      val mH = m.headOption
      if(mH.isDefined) toMatch(mH.get) map {m => Some(m)} else Future.successful(None)
    }
  }

  def getMatchesInGroup(id: Long): Future[Seq[TTMatch]] = {
    allMatches() map { ml =>
      ml.filter(_.groupId.getOrElse(0) == id)
    }
  }

  def getMatchOnTable(id: Long): Future[Option[TTMatch]] = {
    val matchF = dbConfigProvider.get.db.run(matches.filter(_.ttTableId === id).result)
    matchF flatMap { m =>
      Logger.info("Match on Table: " + m.headOption.toString)
      val mH = m.headOption
      if(mH.isDefined) toMatch(mH.get) map {m => Some(m)} else Future.successful(None)
    }
  }

  def setResult(id: Long, result: Seq[Seq[Int]]): Future[Boolean]  = {
    getMatch(id) flatMap  { m =>
      val ttMatch = m.get
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
      val ttMatchResult = ttMatch.copy(
        resultRaw = resultRaw,
        isPlaying = false,
        isPlayed = true,
        result = sets1 + " : " + sets2,
        balls1 = balls(0),
        balls2 = balls(1),
        sets1 = sets1,
        sets2 = sets2,
        plannedTableId = ttMatch.ttTableId,
        ttTableId = None
      )
      dbConfigProvider.get.db.run(matches.insertOrUpdate(toMatchDAO(ttMatchResult))) flatMap {r =>
        if(m.get.ttTableId.isDefined && m.get.ttTableId.get != 0) {
          Logger.info(m.get.ttTableId.toString)
          getTTTable(m.get.ttTableId.get) flatMap {t =>
            val tNew = t.get.copy(
              matchId = None
            )
            dbConfigProvider.get.db.run(ttTables.insertOrUpdate(tNew)) map {r =>
              true
            }
          }
        } else {
          Future.successful(true)
        }
      }
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

    def * = (id, isPlaying, player1Id, player2Id, ttTableId, isPlayed, matchTypeId, typeId, groupId, startTime, resultRaw, result,
      balls1, balls2, sets1, sets2, plannedTableId) <> (MatchDAO.tupled, MatchDAO.unapply _)

    def player1 = foreignKey("Play1_FK", player1Id, player)(_.id)
    def player2 = foreignKey("Play2_FK", player2Id, player)(_.id)
    def ttTable = foreignKey("Table_FK", ttTableId, ttTables)(_.id.?)
    def matchType = foreignKey("MatchType_FK", matchTypeId, matchTypes)(_.id)
    def group = foreignKey("Group_FK", groupId, groups)(_.id.?)
    def ttType = foreignKey("Type_FK", typeId, types)(_.id)
  }

  // Players

  def getPlayerFromPlayerDAO(p: PlayerDAO): Future[Player]= {
    allMatches() flatMap {matches =>
      val playerMatches = matches.filterNot(_.isPlayed).filterNot(_.isPlaying).filter(m => (m.player1Ids ++ m.player2Ids).contains(p.id))
      val typeIds = (playerMatches map {m => m.typeId}).distinct
      val typesFO = Future.sequence(typeIds map {t => getType(t)})
      val typesF = typesFO map {_ map {_.get}}
      typesF flatMap { t =>
        val clubF = if(p.clubId.isDefined) getClub(p.clubId.get) else Future.successful(None)
        clubF map { club =>
          Player(p.id, p.firstName, p.lastName, p.ttr, p.sex, club, playerMatches.isDefinedAt(0), t)
        }
      }
    }
  }

  def allPlayer: Future[Seq[Player]] = {
    dbConfigProvider.get.db.run(player.result) flatMap { ap =>
      val x = ap map { p => getPlayerFromPlayerDAO(p)}
      Future.sequence(x)
    }
  }

  def getPlayer(id: Long): Future[Option[Player]] = {
    val playerF = dbConfigProvider.get.db.run(player.filter(_.id === id).result)
    playerF flatMap { p =>
      if(p.headOption.isDefined) {
        getPlayerFromPlayerDAO(p.head) map {Some(_)}
      } else {
        Future.successful(None)
      }
    }
  }

  class ClubTable(tag: Tag) extends Table[Club](tag, "club") {

    def id = column[Long]("Club_ID", O.PrimaryKey, O.AutoInc)
    def name = column[String]("Club_Name")

    def * = (id, name) <> (Club.tupled, Club.unapply _)
  }

  def getClub(id: Long): Future[Option[Club]] = {
    dbConfigProvider.get.db.run(clubs.filter(_.id === id).result) map {_.headOption}
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

  def getMatchType(id: Long): Future[Option[MatchType]] = {
    val mtF = dbConfigProvider.get.db.run(matchTypes.filter(_.id === id).result)
    mtF map {mt =>
      mt.headOption
    }
  }

  class TypeTable(tag: Tag) extends Table[Type](tag, "type") {

    def id = column[Long]("Type_ID", O.PrimaryKey, O.AutoInc)
    def name = column[String]("Type_Name")
    def kind = column[Int]("Type_Kind")

    def * = (id, name, kind) <> (Type.tupled, Type.unapply _)
  }

  def getType(id: Long): Future[Option[Type]] = {
    val tF = dbConfigProvider.get.db.run(types.filter(_.id === id).result)
    tF map {t =>
      t.headOption
    }
  }

  class GroupTable(tag: Tag) extends Table[Group](tag, "groups") {

    def id = column[Long]("Grou_ID", O.PrimaryKey, O.AutoInc)
    def name = column[String]("Grou_Name")

    def * = (id, name) <> (Group.tupled, Group.unapply _)
  }

  def getGroup(id: Option[Long]): Future[Option[Group]] = if(id.isDefined) getGroup(id.get) else Future.successful(None)

  def getGroup(id: Long): Future[Option[Group]] = {
    val gF = dbConfigProvider.get.db.run(groups.filter(_.id === id).result)
    gF map {g =>
      g.headOption
    }
  }

  class DoubleTable(tag: Tag) extends Table[Double](tag, "doubles") {

    def id = column[Long]("Doub_ID", O.PrimaryKey, O.AutoInc)
    def player1Id = column[Long]("Doub_Play1_ID")
    def player2Id = column[Long]("Doub_Play2_ID")
    def kindId = column[Int]("Doub_Kind")

    def * = (id, player1Id, player2Id, kindId) <> (Double.tupled, Double.unapply _)
  }

  def getAllDoubles = dbConfigProvider.get.db.run(doubles.result)

  def getDouble(id: Long): Future[Option[Double]] = {
    val dF = dbConfigProvider.get.db.run(doubles.filter(_.id === id).result)
    dF map {d =>
      d.headOption
    }
  }

  class MatchListTable(tag: Tag) extends Table[MatchList](tag, "match_list") {

    def id = column[Long]("id", O.PrimaryKey, O.AutoInc)
    def matchId = column[Long]("match_id")
    def asGroup = column[Option[Long]]("as_group")
    def position = column[Int]("position")

    def * = (id.?, matchId, asGroup, position) <> (MatchList.tupled, MatchList.unapply _)
  }

  def getMatchList = {
    val mlF = dbConfigProvider.get.db.run(matchList.result)
    mlF map {ml =>
      ml.sortBy(_.position)
    }
  }

  def setMatchList(ml: Seq[MatchList]) = {
    val resF = ml map {mlEntry =>
      dbConfigProvider.get.db.run(matchList.insertOrUpdate(mlEntry))
    }
    Future.sequence(resF) map {rList =>
      rList
    }
  }

  def delMatchList(ml: Seq[MatchList], id: Long) = {
    val resF = ml map {mlEntry =>
      dbConfigProvider.get.db.run(matchList.insertOrUpdate(mlEntry))
    }
    Future.sequence(resF) map { r =>
      dbConfigProvider.get.db.run(matchList.filter(_.id === id).delete)
    }
  }

  def delMatchListGroup(ml: Seq[MatchList], id: Long) = {
    val resF = ml map {mlEntry =>
      dbConfigProvider.get.db.run(matchList.insertOrUpdate(mlEntry))
    }
    Future.sequence(resF) map { r =>
      val res = dbConfigProvider.get.db.run(matchList.filter(_.asGroup === Option(id)).delete)
    }
  }

  def startMatch(ttMatch: TTMatch) = {
    dbConfigProvider.get.db.run(matches.filter(_.id === ttMatch.id).result) flatMap { m =>
      val newMatch = toMatchDAO(ttMatch).copy(isPlaying = true, ttTableId = ttMatch.ttTableId)
      dbConfigProvider.get.db.run(matches.insertOrUpdate(newMatch)) map {result =>
        ttMatch.ttTableId
      }
    }
  }
}
