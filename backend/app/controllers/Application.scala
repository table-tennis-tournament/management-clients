package controllers

import javax.inject.Inject

import dao.Tables
import play.api._
import play.api.mvc._
import play.api.libs.concurrent.Execution.Implicits._
import scheduler.CheckDatabaseActor

import scala.concurrent.duration._


class Application @Inject()(table: Tables) extends Controller {

  def index = Action.async {

    Logger.debug("update everything")
    table.updateTTTables flatMap { a =>
      table.updateDoublesSeq flatMap { b =>
        table.updateMatches flatMap { c =>
          table.updateClubList flatMap { d =>
            table.updateMatchTypeList flatMap { e =>
              table.updateTypesList flatMap { f =>
                table.updateGroupsSeq flatMap { g =>
                  table.updateMatchListSeq flatMap { h =>
                    table.updatePlayerList map { i =>
                      val x = a && b && c && d && e && f && g && h && i
                      Logger.debug(x.toString)
                      Ok(views.html.index())
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

}
