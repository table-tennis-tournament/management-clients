package controllers

import java.util.UUID

import javax.inject.{Inject, Named}
import akka.actor.ActorRef
import dao.Tables
import models._
import play.api.Logger
import play.api.libs.json.{Json, Writes}
import play.api.mvc.{AbstractController, Action, BaseController, Controller}
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import websocket.WebSocketActor.{UpdateMatchList, UpdateMatches, UpdateTable}

import scala.None
import scala.concurrent.Future

/**
  * Created by jonas on 24.11.16.
  */
class MatchListController @Inject() (tables: Tables, @Named("publisher_actor") pub: ActorRef) extends Controller{

  import models.MatchModel._
  import models.AnswerModel._

  var isActiv = false

  def autoStart = Action {
    tables.startNextMatch
    Ok(Json.toJson(Answer(true, "started matches")))
  }

  def addMatch = Action{ request =>
    val jsonO = request.body.asJson
    jsonO match {
      case Some(json) => {
        json.validate[MatchList].asOpt match {
          case Some(matchList) => {
            val filteredMatchList = matchList.copy(matchId = matchList.matchId.filter(id => tables.getMatch(id).get.state == Open))
            Logger.info("addMatch")
            val newMLEntry = filteredMatchList.copy(uuid = Some(filteredMatchList.uuid.getOrElse(UUID.randomUUID())), matchId = filteredMatchList.matchId.filter(id => !tables.isInMatchList(tables.getMatch(id).get)))
            val ml = tables.getMatchList
            if (ml.filter(_.matchId == filteredMatchList.matchId).isEmpty) {
              val newML = ml map { mlEntry =>
                if (mlEntry.position >= filteredMatchList.position) mlEntry.copy(position = mlEntry.position + 1) else mlEntry
              }
              val newMLAdded = newML ++ Seq(newMLEntry)
              newMLEntry.matchId.map(id => tables.updateMatchState(OnTable, id))
              matchList.matchId.foreach(m => tables.updateMatchState(InWaitingList, m))
              tables.setMatchList(newMLAdded)
              tables.startNextMatch
              pub ! UpdateMatches(tables.allMatchesInfo)
              pub ! UpdateTable(tables.allTableInfo)
              pub ! UpdateMatchList(tables.getAllMatchList)
              Ok(Json.toJson(Answer(true, "match added", newMLEntry.uuid)))
            } else {
              BadRequest(Json.toJson(Answer(false, "match is already in match list", newMLEntry.uuid)))
            }
          }
          case _ => BadRequest(Json.toJson(Answer(false, "wrong request format")))
        }
      }
      case _ => BadRequest(Json.toJson(Answer(false, "wrong request format")))
    }
  }

  def deleteMatch(uuid: String) = Action{
    Logger.info(tables.getMatchList.toString())
    Logger.info(uuid)
    if(tables.delMatchList(UUID.fromString(uuid))){
      pub ! UpdateMatches(tables.allMatchesInfo)
      pub ! UpdateTable(tables.allTableInfo)
      pub ! UpdateMatchList(tables.getAllMatchList)
      Ok(Json.toJson(Answer(true, "match deleted")))
    } else {
      BadRequest(Json.toJson(Answer(false, "UUID not found")))
    }

  }

  def getNext = Action {
    Ok("not implemented")
  }

  def setActive(isActive: Boolean) = Action {
    tables.autoStart = isActive
    Ok(Json.toJson(Answer(true,"set to " + isActive.toString)))
  }

  def isActive = Action {
    Ok(tables.autoStart.toString)
  }

  def move(uuid: String, pos: Int) = Action {
    val ml = tables.getMatchList
    ml.find(_.uuid == Some(UUID.fromString(uuid))) match {
      case Some(mlItem) => {
        val mlDel = ml.filter(_.position != mlItem.position) map { m =>
          if(m.position < mlItem.position) m
          else m.copy(position = m.position - 1)
        }
        val mlNew = mlDel map { m =>
          if(m.position < pos) m
          else m.copy(position = m.position + 1)
        }
        tables.setMatchList((mlNew :+ mlItem.copy(position = pos)).sortBy(_.position))
        pub ! UpdateMatches(tables.allMatchesInfo)
        pub ! UpdateTable(tables.allTableInfo)
        pub ! UpdateMatchList(tables.getAllMatchList)
        Ok(Json.toJson(Answer(true, "changed match list")))
      }
      case _ => BadRequest(Json.toJson(Answer(false, "UUID not found")))
    }
  }

  def getAllMatchList = Action {
     Ok(Json.toJson(tables.getAllMatchList))
  }
}
