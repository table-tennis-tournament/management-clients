package controllers

import javax.inject.Inject

import dao.TTTableDAO
import play.api._
import play.api.mvc._

import play.api.libs.concurrent.Execution.Implicits._

class Application @Inject()(ttTableDAO: TTTableDAO) extends Controller {

  def index = Action {
    val result = ttTableDAO.all
    result.map {
      ttTables => Logger.info(ttTables.toString())
    }
    result.onFailure{
      case f => Logger.error(f.toString)
    }
    Ok
    Ok(views.html.index("TurnierManager"))
  }

}
