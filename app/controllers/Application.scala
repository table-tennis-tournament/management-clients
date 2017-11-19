package controllers

import javax.inject.Inject

import dao.Tables
import play.api._
import play.api.mvc._
import play.api.libs.concurrent.Execution.Implicits._

import scala.concurrent.duration._


class Application @Inject()(table: Tables) extends Controller {

  def index = Action {
    Ok(views.html.index())
  }

}
