package controllers

import dao.Tables
import javax.inject.Inject
import models.Answer
import play.api.libs.json.Json
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}

import scala.concurrent.ExecutionContext

/**
  * Created by jonas on 09.10.16.
  */
class PlayerController @Inject() (implicit ec: ExecutionContext, tables: Tables,val controllerComponents: ControllerComponents) extends BaseController{
  import models.PlayerModel._
  import models.AnswerModel._

  def getAllPlayer: Action[AnyContent] = Action {
    Ok(Json.toJson(tables.allPlayer))
  }

  def getPlayer(id: Long): Action[AnyContent] = Action {
    Ok(Json.toJson(tables.getPlayer(id)))
  }

  def getPlayesByType(typeId: Long): Action[AnyContent] = Action {
    Ok(Json.toJson(tables.getPlayer(typeId)))
  }

  def setPlayerActiveState(id: Long, active: Boolean) = Action {
    Ok(Json.toJson(tables.getPlayer(id)))
  }


  def getAllTypePerPlayer = Action {
    Ok(Json.toJson(tables.allTypePerPlayer))
  }

  def setPayed(id: Long, paid: Boolean) = Action.async{
    tables.setPaid(id, paid) map { result =>
      Ok(Json.toJson(Answer(true, result.toString)))
    }
  }
}
