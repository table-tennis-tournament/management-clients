package controllers

import java.util.UUID

import akka.actor.ActorRef
import dao.Tables
import javax.inject.{Inject, Named}
import models._
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc._
import websocket.WebSocketActor.{UpdateMatchList, UpdateMatches}

/**
  * Created by jonas on 24.11.16.
  */
class MatchListController @Inject() (tables: Tables,
                                     @Named("publisher_actor") pub: ActorRef,
                                     val controllerComponents: ControllerComponents) extends BaseController {

  import models.AnswerModel._
  import models.MatchModel._

  var isActiv = false

  def autoStart: Action[AnyContent] = Action {
    tables.startNextMatch
    Ok(Json.toJson(Answer(successful = true, "started matches")))
  }

  def addMatch: Action[AnyContent] = Action{ request =>
    val jsonO = request.body.asJson
    jsonO match {
      case Some(json) =>
        json.validate[MatchList].asOpt match {
          case Some(matchList) =>
            val filteredMatchList = matchList.copy(matchId = matchList.matchId.filter(id => tables.getMatch(id).get.state == Open))
            Logger.info("addMatch")
            val newMLEntry = filteredMatchList.copy(uuid = Some(filteredMatchList.uuid.getOrElse(UUID.randomUUID())),
              matchId = filteredMatchList.matchId.filter(id => !tables.isInMatchList(tables.getMatch(id).get)))
            if(newMLEntry.matchId.isEmpty) {
              BadRequest(Json.toJson(Answer(successful = false, "no valid matchids match list", newMLEntry.uuid)))
            }
            val ml = tables.getMatchList
            if (!ml.exists(_.matchId == filteredMatchList.matchId)) {
              val newML = ml map { mlEntry =>
                if (mlEntry.position >= filteredMatchList.position) mlEntry.copy(position = mlEntry.position + 1) else mlEntry
              }
              val newMLAdded = newML ++ Seq(newMLEntry)
              newMLEntry.matchId.foreach(id => tables.updateMatchState(OnTable, id))
              matchList.matchId.foreach(m => tables.updateMatchState(InWaitingList, m))
              pub ! UpdateMatches(tables.allMatchesInfo.filter(m => newMLEntry.matchId.contains(m.ttMatch.id)))
              tables.setMatchList(newMLAdded)
              tables.startNextMatch
              pub ! UpdateMatchList(tables.getAllMatchList)
              Ok(Json.toJson(Answer(successful = true, "match added", newMLEntry.uuid)))
            } else {
              BadRequest(Json.toJson(Answer(successful = false, "match is already in match list", newMLEntry.uuid)))
            }
          case _ => BadRequest(Json.toJson(Answer(successful = false, "wrong request format")))
        }
      case _ => BadRequest(Json.toJson(Answer(successful = false, "wrong request format")))
    }
  }

  def deleteMatch(uuid: String): Action[AnyContent] = Action{
    Logger.info(tables.getMatchList.toString())
    Logger.info(uuid)
    val matchlistId = UUID.fromString(uuid)
    val currentMatchListItem = tables.findMatchListById(matchlistId)
    if(tables.delMatchList(matchlistId)){
      currentMatchListItem match {
        case Some(matchListItem) => {
          pub ! UpdateMatches(tables.allMatchesInfo.filter(m => matchListItem.matchId.contains(m.ttMatch.id)))
        }
      }

      pub ! UpdateMatchList(tables.getAllMatchList)
      Ok(Json.toJson(Answer(successful = true, "match deleted")))
    } else {
      BadRequest(Json.toJson(Answer(successful = false, "UUID not found")))
    }

  }

  def getNext: Action[AnyContent] = Action {
    Ok("not implemented")
  }

  def setActive(isActive: Boolean): Action[AnyContent] = Action {
    tables.autoStart = isActive
    Ok(Json.toJson(Answer(successful = true,"set to " + isActive.toString)))
  }

  def isActive: Action[AnyContent] = Action {
    Ok(tables.autoStart.toString)
  }

  def move(uuid: String, pos: Int): Action[AnyContent] = Action {
    val ml = tables.getMatchList
    ml.find(_.uuid.contains(UUID.fromString(uuid))) match {
      case Some(mlItem) =>
        val mlDel = ml.filter(_.position != mlItem.position) map { m =>
          if(m.position < mlItem.position) m
          else m.copy(position = m.position - 1)
        }
        val mlNew = mlDel map { m =>
          if(m.position < pos) m
          else m.copy(position = m.position + 1)
        }
        tables.setMatchList((mlNew :+ mlItem.copy(position = pos)).sortBy(_.position))
        pub ! UpdateMatchList(tables.getAllMatchList)
        Ok(Json.toJson(Answer(successful = true, "changed match list")))
      case _ => BadRequest(Json.toJson(Answer(successful = false, "UUID not found")))
    }
  }

  def getAllMatchList: Action[AnyContent] = Action {
     Ok(Json.toJson(tables.getAllMatchList))
  }
}
