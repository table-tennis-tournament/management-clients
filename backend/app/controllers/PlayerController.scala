package controllers

import com.google.inject.Inject
import dao.Tables
import models.Player
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.libs.json.{Json, Writes}
import play.api.mvc.{Action, Controller}

/**
  * Created by jonas on 09.10.16.
  */
class PlayerController @Inject() (tables: Tables) extends Controller{
  import models.PlayerModel._

  def getAllPlayer = Action {
    Ok(Json.toJson(tables.allPlayer))
  }

  def getPlayer(id: Long) = Action {
    Ok(Json.toJson(tables.getPlayer(id)))
  }
}
