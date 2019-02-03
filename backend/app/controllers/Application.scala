package controllers

import dao.Tables
import javax.inject.Inject
import play.api.mvc._


class Application @Inject()(table: Tables, val controllerComponents: ControllerComponents) extends BaseController {

  def index: Action[AnyContent] = Action {
    Ok(views.html.index())
  }

}
