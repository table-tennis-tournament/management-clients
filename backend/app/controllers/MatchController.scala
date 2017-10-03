package controllers

import com.google.inject.Inject
import dao.Tables
import models._
import play.api.Logger
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

  def getMatchesByType(typeId: Long) = Action.async {
    val matchesF = tables.allMatches()
    val x = matchesF map {matches =>
      matches map(ttMatch => getAllMatchInfo(ttMatch))
    }
    val z = x map {y => Future.sequence(y)}
    val z2 = z.flatMap(z => z)
    z2 map {z =>
      val m = z.filter(_.isDefined) map {z1 => z1.get}
      Ok(Json.toJson(m.filter(_.ttMatch.typeId == typeId).sortBy(_.ttMatch.id)))
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
      val m = z.filter(_.isDefined) map {z1 => z1.get}
      Ok(Json.toJson(m.sortBy(_.ttMatch.id)))
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

  def getTypes = Action.async {
    tables.allTypes map {types =>
      Ok(Json.toJson(types))
    }
  }

  def setGroupToTable(groupId: Long, tableName: Int) = Action.async{
    tables.getTTTableFromName(tableName) flatMap {table =>
      tables.allMatches() flatMap {matches =>
        Logger.info("matches: " + matches.toString())
        val matchesInGroup = matches.filter(_.groupId.getOrElse(0) == groupId)
        val groupReady = matchesInGroup forall { m =>
          if (!(m.isPlayed || m.isPlaying)) {
            (m.player1Ids ++ m.player2Ids).forall { p =>
              val ml = matches.filter { ma =>
                ma.isPlaying && (ma.player1Ids.contains(p) || ma.player2Ids.contains(p))
              }
              ml.isEmpty // p is not playing
            }
          } else {
            true
          }
        }
        val res = if (groupReady) {
          Logger.info("Set group to Table")
          val a = tables.getMatchList flatMap {ml =>
            val position = ml.filter(_.asGroup.getOrElse(0) == groupId).head.position
            val newML = ml map {mlEntry =>
              if (mlEntry.position > position) mlEntry.copy(position = mlEntry.position - 1) else mlEntry
            }
            tables.delMatchListGroup(newML, groupId).flatMap(_.flatMap(
              matchesInGroup map { m =>
                tables.startMatch(m.id, table.id)
              }
            ))
          }
          a
        } else {
          Logger.error("Group not ready")
          Future.successful[Boolean](false)
        }
        res map { r =>
          Logger.info("result: " + r.toString() + " " + table.toString + " " + matchesInGroup.toString())
          Ok("{}")
        }
      }
    }
  }

  def setMatchToTable(matchId: Long, tableName: Int) = Action.async{
    tables.getTTTableFromName(tableName) flatMap {table =>
      tables.allMatches() flatMap {matches =>
        Logger.info("matches: " + matches.toString())
        val m = matches.filter(_.id == matchId).head
        val matchReady = if (!(m.isPlayed || m.isPlaying)) {
          (m.player1Ids ++ m.player2Ids).forall { p =>
            val ml = matches.filter { ma =>
              ma.isPlaying && (ma.player1Ids.contains(p) || ma.player2Ids.contains(p))
            }
            ml.isEmpty // p is not playing
          }
        } else {
          false
        }
        val res = if (matchReady) {
          Logger.info("Set match to Table")
          tables.getMatchList flatMap { ml =>
            val position = ml.filter(_.matchId == matchId).headOption.map(_.position)
            if (position.isDefined) {
              val newML = ml map { mlEntry =>
                if (mlEntry.position > position.get) mlEntry.copy(position = mlEntry.position - 1) else mlEntry
              }
              tables.delMatchList(newML, ml.filter(_.matchId == matchId).head.id.get) map { result =>
                tables.startMatch(m.id, table.id)
              }
            } else {
              tables.startMatch(m.id, table.id)
            }
          }
        } else {
          Logger.error("Match not ready")
          Future.successful[Boolean](false)
        }
        res map { r =>
          Logger.info("result: " + r.toString() + " " + table.toString + " " + m.toString())
          Ok("{}")
        }
      }
    }
  }
}