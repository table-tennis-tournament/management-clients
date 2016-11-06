package controllers

import javax.inject.Inject

import actors.CheckDatabaseActor
import akka.actor.{ActorRef, ActorSystem}
import dao.Tables
import play.api._
import play.api.mvc._
import play.api.libs.concurrent.Execution.Implicits._

import scala.concurrent.duration._


class Application @Inject()(system: ActorSystem, checkDatabaseActor: ActorRef, table: Tables) extends Controller {

  def index = Action {
    val cancellable = system.scheduler.schedule(
      1.seconds, 1.seconds, checkDatabaseActor, "tick")
    val result = table.allTTTables()
    result.map {
      ttTables => {
        Logger.info(ttTables.toString())
      }
    }
    result.onFailure{
      case f => Logger.error(f.toString)
    }
    Ok(views.html.index("TurnierManager"))
  }

}
