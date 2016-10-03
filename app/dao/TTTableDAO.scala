package dao

import javax.inject.Inject

import models.TTTable
import play.api.Logger
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import slick.driver.JdbcProfile

import scala.concurrent.Future

/**
  * Created by jonas on 29.09.16.
  */

class TTTableDAO @Inject()(protected val dbConfigProvider: DatabaseConfigProvider) extends HasDatabaseConfigProvider[JdbcProfile] {
  import driver.api._

  private val ttTables = TableQuery[TTTablesTable]

  def all(): Future[Seq[TTTable]] = {
    Logger.info("all()")
    dbConfigProvider.get.db.run(ttTables.result)
  }

  private class TTTablesTable(tag: Tag) extends Table[TTTable](tag, "tables") {

    def id = column[Long]("Tabl_ID", O.PrimaryKey, O.AutoInc)
    def name = column[String]("Tabl_Name")
    def left = column[Long]("Tabl_Left")
    def top = column[Long]("Tabl_Top")
    def matchId = column[Option[Long]]("Tabl_Matc_ID")
    def tourId = column[Long]("Tabl_Tour_ID")
    def group = column[Option[Long]]("Tabl_Group")

    def * = (id, name, left, top, matchId, tourId, group) <> (TTTable.tupled, TTTable.unapply _)
  }
}
