package controllers

import com.google.inject.Inject
import dao.Tables
import models._
import play.api.Logger
import play.api.libs.json.{Json, Writes}
import play.api.mvc.{Action, Controller}
import play.api.libs.concurrent.Execution.Implicits.defaultContext

import scala.None
import scala.concurrent.Future

/**
  * Created by jonas on 24.11.16.
  */
class MatchListController @Inject() (tables: Tables) extends Controller{

  import models.MatchModel._

  var isActiv = false

  def getAllMatchInfo(ttMatch: TTMatch): Future[Option[AllMatchInfo]] = {
    val p1F = Future.sequence(ttMatch.player1Ids map {id => tables.getPlayer(id)})
    val p2F = Future.sequence(ttMatch.player2Ids map {id => tables.getPlayer(id)})
    val tF = tables.getTTTable(ttMatch.ttTableId)
    val mtF = tables.getMatchType(ttMatch.matchTypeId)
    val tyF = tables.getType(ttMatch.typeId)
    val gF = tables.getGroup(ttMatch.groupId)
    val pF = for {
      p1 <- p1F
      p2 <- p2F
      t <- tF
      mt <- mtF
      ty <- tyF
      g <- gF
    } yield(p1, p2, t, mt.get, ty.get, g)
    pF map {p =>
      Some(AllMatchInfo(
        ttMatch,
        p._1.flatten,
        p._2.flatten,
        p._3,
        p._4,
        p._5,
        p._6
      ))
    }
  }

  def getAllMatchList = Action.async{
    val amiSeqF = tables.getMatchList flatMap { ml =>
      val x = ml map {mlEntry =>
        tables.getMatch(mlEntry.matchId) flatMap { m =>
          getAllMatchInfo(m.get) map {mi => MatchListInfo(mlEntry, mi.get)}
        }
      }
      Future.sequence(x)
    }
    amiSeqF map {amiSeq =>
      Ok(Json.toJson(amiSeq))
    }
  }

  def addMatch(id: Long, position: Int) = Action.async{
    Logger.info("addMatch")
    val newMLEntry = MatchList(None, id, None, position)
    tables.getMatchList flatMap {ml =>
      val newML = ml map {mlEntry =>
        if (mlEntry.position >= position) mlEntry.copy(position = mlEntry.position + 1) else mlEntry
      }
      val newMLAdded = newML ++ Seq(newMLEntry)
      tables.setMatchList(newMLAdded) flatMap {result =>
        tables.getMatchList map { ml =>
          Ok(Json.toJson(ml.filter(_.matchId == id).headOption))
        }
      }
    }
  }

  def addGroup(id: Long, position: Int) = Action.async{
    Logger.info("addGroup")
    tables.getMatchesInGroup(id) flatMap { ml =>
      val addML = ml map { m =>
        MatchList(None, m.id, Some(id), position)
      }
      tables.getMatchList flatMap { oldML =>
        val ml = oldML map { mlEntry =>
          if (mlEntry.position >= position) mlEntry.copy(position = mlEntry.position + 1) else mlEntry
        }
        tables.setMatchList(ml ++ addML) flatMap { res =>
          tables.getMatchList map { ml =>
            Ok(Json.toJson(ml.filter(_.asGroup == Some(id))))
          }
        }
      }

    }
  }

  def deleteMatch(id: Long) = Action.async{
    tables.getMatchList flatMap {ml =>
      val position = ml.filter(_.matchId == id).head.position
      val newML = ml map {mlEntry =>
        if (mlEntry.position > position) mlEntry.copy(position = mlEntry.position - 1) else mlEntry
      }
      tables.delMatchList(newML, ml.filter(_.matchId == id).head.id.get) map {result =>
        Ok("deleted match")
      }
    }
  }

  def deleteGroup(id: Long) = Action.async{
    tables.getMatchList flatMap {ml =>
      val position = ml.filter(_.asGroup.getOrElse(0) == id).head.position
      val newML = ml map {mlEntry =>
        if (mlEntry.position > position) mlEntry.copy(position = mlEntry.position - 1) else mlEntry
      }
      tables.delMatchListGroup(newML, id) map {result =>
        Ok("deleted group")
      }
    }
  }

  def getNext = Action.async {

    Future.successful(Ok("not implemented"))
  }

  def setActive(isActive: Boolean) = Action.async {
    this.isActiv = isActive
    Future.successful(Ok("set to " + isActive.toString))
  }

  def isActive = Action.async {
    Future.successful(Ok(isActiv.toString))
  }
}
