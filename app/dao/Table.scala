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
    dbConfigProvider.get.db.run(ttTables.filter(_.name > 0).sortBy(_.name).result)
  }

  def getTTTable(id: Option[Long]): Future[Option[TTTable]] = if(id.isDefined) getTTTable(id.get) else Future.successful(None)

  def getTTTable(id: Long): Future[Option[TTTable]] = {
    val tableF = dbConfigProvider.get.db.run(ttTables.filter(_.id === id).result)
    tableF map { t =>
      t.headOption
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
    //def isLocked = column[Boolean]("Tabl_isLocked")

    def ttMatch = foreignKey("Matc_FK", matchId, matches)(_.id.?)

    def * = (id, name, false, matchId) <> (TTTable.tupled, TTTable.unapply _)
  }


  // Matches
  def allMatches(): Future[Seq[MatchDAO]] = {
    dbConfigProvider.get.db.run(matches.result)
  }

  def getMatch(id: Long): Future[Option[MatchDAO]] = {
    val matchF = dbConfigProvider.get.db.run(matches.filter(_.id === id).result)
    matchF map { m =>
      m.headOption
    }
  }

  def setResult(id: Long, result: Seq[Seq[Int]]): Future[Int]  = {
    getMatch(id) flatMap  { m =>
      val ttMatch = m.get
      val x = result map (r => r.mkString("="))
      val resultRaw = x.mkString(",")
      val balls = result.foldRight(Seq(0,0)){(x,y) => Seq(x(0)+y(0), x(1)+y(1))}
      val sets = result.foldRight(Seq(0,0)){(x,y) => Seq(x(0) + (if(x(0)>x(1)) 1 else 0), x(0) + (if(x(0)<x(1)) 1 else 0))}
      Logger.info(balls.toString())
      val ttMatchResult = ttMatch.copy(
        resultRaw = resultRaw,
        isPlayed = true,
        result = sets(0) + " : " + sets(1),
        balls1 = balls(0),
        balls2 = balls(1),
        sets1 = sets(0),
        sets2 = sets(1),
        playedTableId = ttMatch.ttTableId
      )
      dbConfigProvider.get.db.run(matches.insertOrUpdate(ttMatchResult)) map {r =>
        Logger.info("res: " + r.toString)
        r
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
    def playedTableId = column[Option[Long]]("Matc_PlayedTable_ID")

    def * = (id, isPlaying, player1Id, player2Id, ttTableId, isPlayed, matchTypeId, typeId, groupId, startTime, resultRaw, result,
      balls1, balls2, sets1, sets2, playedTableId) <> (MatchDAO.tupled, MatchDAO.unapply _)

    def player1 = foreignKey("Play1_FK", player1Id, player)(_.id)
    def player2 = foreignKey("Play2_FK", player2Id, player)(_.id)
    def ttTable = foreignKey("Table_FK", ttTableId, ttTables)(_.id.?)
    def matchType = foreignKey("MatchType_FK", matchTypeId, matchTypes)(_.id)
    def group = foreignKey("Group_FK", groupId, groups)(_.id.?)
    def ttType = foreignKey("Type_FK", typeId, types)(_.id)
  }

  // Players

  val allPlayerInformation = for {
    (p, c) <- player join clubs on(_.clubId === _.id)
  } yield (p.id, p.firstName, p.lastName, p.ttr, p.sex, c.name)

  def allPlayer: Future[Seq[Player]] = {
    dbConfigProvider.get.db.run(allPlayerInformation.result) map {p =>
      p map (p => (Player.apply _).tupled(p))
    }
  }

  def getPlayer(id: Long): Future[Option[Player]] = {
    val playerF = dbConfigProvider.get.db.run(allPlayerInformation.filter(_._1 === id).result)
    playerF map { p =>
      if(p.headOption.isDefined) {
        Some((Player.apply _).tupled(p.head))
      } else {
        None
      }
    }
  }

  class ClubTable(tag: Tag) extends Table[Club](tag, "club") {

    def id = column[Long]("Club_ID", O.PrimaryKey, O.AutoInc)
    def name = column[String]("Club_Name")

    def * = (id, name) <> (Club.tupled, Club.unapply _)
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
}
