package controllers

import com.google.inject.Inject
import dao.Tables
import models._
import play.Logger
import play.api.libs.json._
import play.api.mvc._
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.libs.json

import scala.concurrent.duration._
import scala.concurrent.{Await, Future}
import scala.util.{Failure, Success, Try}
/**
  * Created by jonas on 10.10.16.
  */
class MatchController @Inject() (tables: Tables) extends Controller{
  import models.MatchFilter._
  import models.MatchModel._

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

  def getAllMatches = Action.async {
    val matchesF = tables.allMatches()
    val x = matchesF map {matches =>
      matches map(ttMatch => getAllMatchInfo(ttMatch))
    }
    val z = x map {y => Future.sequence(y)}
    val z2 = z.flatMap(z => z)
    z2 map {z =>
      Ok(Json.toJson(z))
    }
  }

  def getMatch(id: Long) = Action.async {
    val matchF = tables.getMatch(id)
    matchF flatMap { ttMatch =>
      val amiF = if(ttMatch.isDefined) getAllMatchInfo(ttMatch.get) else Future(None)
      amiF map { ami =>
        Ok(Json.toJson(ami))
      }
    }
  }

  def setResult(id: Long) = Action.async { request =>
    Logger.info(request.body.asJson.get.toString())
    val res = request.body.asJson
    if(res.isDefined) {
      val resultO = res.get.validate[Seq[Seq[Int]]]
      tables.setResult(id, resultO.get) map { res =>
        Logger.info(res.toString)
        Ok(res.toString)
      }
    } else {
      Future.successful(BadRequest("No JSON found"))
    }
  }

  def getFilteredMatchList = Action.async { request =>
    val filterTypeList = request.body.asJson.get.as[Seq[MatchFilterType]]
    tables.allMatches() map { matches =>
      val filterList = filterTypeList map {ft => ft.filter}
      val fMatches = filterList map {f =>
        f.filterMatches(matches)
      }
      val res = fMatches.foldLeft(matches)((a, b) => a.intersect(b))
      Ok(res.toString)
    }
  }
}