package controllers

import com.google.inject.Inject
import dao.Tables
import models.Player
import play.api.libs.json.{Json, Writes}
import play.api.mvc.{Action, Controller}

/**
  * Created by jonas on 24.11.16.
  */
class MatchListController @Inject() (tables: Tables) extends Controller{

  def getAllMatchList = Action{Ok("not implemented")}

  def getNext = Action{Ok("not implemented")}

}
