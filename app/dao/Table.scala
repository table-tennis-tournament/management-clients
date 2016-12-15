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

  // on Server start
  configDatabase

  def configDatabase {
    Logger.info("config database")
    //  dbConfigProvider.get.db.run(sqlu"""DROP TRIGGER tables_trigger;""") map {
    //    result => Logger.info("result: " + result.toString)
    //  } recover {
    //    case e => Logger.info("tables_trigger not created, maybe it alread exists")
    //  }
    dbConfigProvider.get.db.run(sqlu"""CREATE TABLE triggers (id INT(6) PRIMARY KEY, trigger_name VARCHAR(30) , trigger_val INTEGER);""") map {
      result => Logger.info("result: " + result.toString)
    } recover {
      case e => Logger.info(e.toString)
    }
    dbConfigProvider.get.db.run(sqlu"""INSERT INTO triggers (id, trigger_name, trigger_val) VALUES (0, 'tables', 0)""") map {
      result => Logger.info("result: " + result.toString)
    } recover {
      case e => Logger.info("tables_trigger not created, maybe it alread exists")
    }
    dbConfigProvider.get.db.run(sqlu"""INSERT INTO triggers (id, trigger_name, trigger_val) VALUES (1, 'matches', 0)""") map {
      result => Logger.info("result: " + result.toString)
    } recover {
      case e => Logger.info("tables_trigger not created, maybe it alread exists")
    }
    dbConfigProvider.get.db.run(sqlu"""INSERT INTO triggers (id, trigger_name, trigger_val) VALUES (2, 'player', 0)""") map {
      result => Logger.info("result: " + result.toString)
    } recover {
      case e => Logger.info("tables_trigger not created, maybe it alread exists")
    }
    dbConfigProvider.get.db.run(sqlu"""CREATE TRIGGER tables_trigger BEFORE UPDATE ON tables FOR EACH ROW UPDATE triggers SET trigger_val = 1 where id = 0;""") map {
      result => Logger.info("result: " + result.toString)
    } recover {
      case e => Logger.info("tables_trigger not created, maybe it alread exists" + e.toString)
    }
    dbConfigProvider.get.db.run(sqlu"""CREATE TRIGGER matches_update_trigger AFTER UPDATE ON matches FOR EACH ROW UPDATE triggers SET trigger_val = 1 where id = 1;""") map {
      result => Logger.info("result: " + result.toString)
    } recover {
      case e => Logger.info("matches_trigger not created, maybe it alread exists")
    }
    dbConfigProvider.get.db.run(sqlu"""CREATE TRIGGER matches_insert_trigger AFTER INSERT ON matches FOR EACH ROW UPDATE triggers SET trigger_val = 1 where id = 1;""") map {
      result => Logger.info("result: " + result.toString)
    } recover {
      case e => Logger.info("matches_trigger not created, maybe it alread exists")
    }
    dbConfigProvider.get.db.run(sqlu"""CREATE TRIGGER matches_insert_trigger AFTER DELETE ON matches FOR EACH ROW UPDATE triggers SET trigger_val = 1 where id = 1;""") map {
      result => Logger.info("result: " + result.toString)
    } recover {
      case e => Logger.info("matches_trigger not created, maybe it alread exists")
    }
    dbConfigProvider.get.db.run(sqlu"""CREATE TRIGGER player_update_trigger AFTER UPDATE ON player FOR EACH ROW UPDATE triggers SET trigger_val = 1 where id = 2;""") map {
      result => Logger.info("result: " + result.toString)
    } recover {
      case e => Logger.info("player_trigger not created, maybe it alread exists")
    }
    dbConfigProvider.get.db.run(sqlu"""CREATE TRIGGER player_update_trigger AFTER INSERT ON player FOR EACH ROW UPDATE triggers SET trigger_val = 1 where id = 2;""") map {
      result => Logger.info("result: " + result.toString)
    } recover {
      case e => Logger.info("player_trigger not created, maybe it alread exists")
    }
    dbConfigProvider.get.db.run(sqlu"""CREATE TRIGGER player_update_trigger AFTER DELETE ON player FOR EACH ROW UPDATE triggers SET trigger_val = 1 where id = 2;""") map {
      result => Logger.info("result: " + result.toString)
    } recover {
      case e => Logger.info("player_trigger not created, maybe it alread exists")
    }
  }



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
    dbConfigProvider.get.db.run(ttTables.result)
  }

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

    def * = (id, name, false) <> (TTTable.tupled, TTTable.unapply _)
  }

  val allMatchInformation = for {
    m <- matches
    p1 <- player if m.player1Id === p1.id
    p2 <- player if m.player2Id === p1.id
    mt <- matchTypes if m.matchTypeId === mt.id
    ty <- types if m.typeId === ty.id
    g <- groups if m.groupeId === g.id
    ta <- ttTables if m.ttTableId === ta.id
  } yield (m.id, p1, p2, mt.name, ty.name, g.name, m.startTime, ta)

  // Matches
  def allMatches(): Future[Seq[Match]] = {
    dbConfigProvider.get.db.run(allMatchInformation.result) map {m =>
      m map (m => (Match.apply _).tupled(m))
    }
  }

  def getMatch(id: Long): Future[Option[Match]] = {
    val matchF = dbConfigProvider.get.db.run(allMatchInformation.filter(_._1 === id).result)
    matchF map {matches =>
      val mList = matches map (m => (Match.apply _).tupled(m))
      mList.headOption
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
    def groupeId = column[Option[Long]]("Matc_Grou_ID")
    def startTime = column[DateTime]("Matc_StartTime")

    def * = (id, isPlaying, player1Id, player2Id, ttTableId, isPlayed, matchTypeId, typeId, groupeId, startTime) <> (MatchDAO.tupled, MatchDAO.unapply _)

    def player1 = foreignKey("Play1_FK", player1Id, player)(_.id)
    def player2 = foreignKey("Play2_FK", player2Id, player)(_.id)
    def ttTable = foreignKey("Table_FK", ttTableId, ttTables)(_.id.?)
    def matchType = foreignKey("MatchType_FK", matchTypeId, matchTypes)(_.id)
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

  class TypeTable(tag: Tag) extends Table[Type](tag, "type") {

    def id = column[Long]("Type_ID", O.PrimaryKey, O.AutoInc)
    def name = column[String]("Type_Name")

    def * = (id, name) <> (Type.tupled, Type.unapply _)
  }

  class GroupTable(tag: Tag) extends Table[Group](tag, "groups") {

    def id = column[Long]("Grou_ID", O.PrimaryKey, O.AutoInc)
    def name = column[String]("Grou_Name")

    def * = (id, name) <> (Group.tupled, Group.unapply _)
  }


}
