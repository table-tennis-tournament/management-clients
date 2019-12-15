package controllers

import dao.Tables
import javax.inject.Inject
import play.api.libs.json.Json
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}

/**
  * Created by jonas on 09.10.16.
  */
class PlayerController @Inject() (tables: Tables,val controllerComponents: ControllerComponents) extends BaseController{
  import models.PlayerModel._

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

}
