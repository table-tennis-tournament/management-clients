package controllers

import javax.inject.Inject

import dao.Tables
import play.api._
import play.api.mvc._
import play.api.libs.concurrent.Execution.Implicits._
import scheduler.CheckDatabaseActor

import scala.concurrent.duration._


class Application @Inject()(table: Tables) extends Controller {

  def index = Action {
    val result = table.allTTTables()
    result.map {
      ttTables => {
        Logger.info(ttTables.toString())
      }
    }
    result.onFailure{
      case f => Logger.error(f.toString)
    }
    Ok(views.html.index())
  }

}
