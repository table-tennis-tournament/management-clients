package controllers

import javax.inject.{Inject, Named}
import akka.actor.ActorRef
import dao.Tables
import models._
import play.api.Logger
import play.api.libs.json._
import play.api.mvc._
import play.api.libs.json.JodaWrites
import play.api.libs.json.JodaReads
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import websocket.WebSocketActor.{UpdateMatchList, UpdateMatches, UpdateTable}


/**
  * Created by jonas on 09.10.16.
  */
class TableController @Inject() (tables: Tables, @Named("publisher_actor") pub: ActorRef) extends Controller{

  import models.TableModel._
  import models.AnswerModel._

  def getAllTables = Action {
    val t = tables.allTTTables()
    val x = t.map(ttTable => tables.getAllTableInfo(ttTable))
    val z = x.sortBy(_.tableNumber)
    Logger.info("m: " + z.toString())
    Ok(Json.toJson(z))
  }

  def getFreeTables = Action {
    val t = tables.allTTTables().filter(t => t.matchId.isEmpty && !t.isLocked.getOrElse(false))
    val x = t.map(ttTable => tables.getAllTableInfo(ttTable))
    val z = x.sortBy(_.tableNumber)
    Logger.info("m: " + z.toString())
    Ok(Json.toJson(z))
  }

  def getTable(id: Long) = Action {
    tables.getTTTable(id) match {
      case Some(ttTable) => Ok(Json.toJson(tables.getAllTableInfo(ttTable)))
      case _ => BadRequest(Json.toJson(Answer(false, "table not found")))
    }
  }

  def lockTable(nr: Long) = Action {
    tables.lockTTTable(nr)
    pub ! UpdateTable(tables.allTableInfo)
    Ok(Json.toJson(Answer(true, "table locked")))
  }

  def unlockTable(nr: Long) = Action {
    tables.unlockTTTable(nr)
    pub ! UpdateTable(tables.allTableInfo)
    Ok(Json.toJson(Answer(true, "table unlocked")))
  }
}
