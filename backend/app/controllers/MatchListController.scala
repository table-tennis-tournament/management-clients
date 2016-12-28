package controllers

import com.google.inject.Inject
import dao.Tables
import models._
import play.api.Logger
import play.api.libs.json.{Json, Writes}
import play.api.mvc.{Action, Controller}
import play.api.libs.concurrent.Execution.Implicits.defaultContext

import scala.concurrent.Future

/**
  * Created by jonas on 24.11.16.
  */
class MatchListController @Inject() (tables: Tables) extends Controller{

  implicit val playerWrites = new Writes[Player] {
    def writes(player: Player) = Json.obj(
      "id" -> player.id,
      "firstName" -> player.firstName,
      "lastName" -> player.lastName,
      "ttr" -> player.ttr,
      "sex" -> player.sex,
      "club" -> player.club
    )
  }

  implicit val resultWrites = new Writes[(Int, Int)] {
    def writes(result: (Int, Int)) = Json.obj(
      "player1" -> result._1,
      "player2" -> result._2
    )
  }

  implicit val matchTypeWrites = new Writes[MatchType] {
    def writes(matchType: MatchType) = Json.obj(
      "id" -> matchType.id,
      "name" -> matchType.name
    )
  }

  implicit val typeWrites = new Writes[Type] {
    def writes(ttType: Type) = Json.obj(
      "id" -> ttType.id,
      "name" -> ttType.name,
      "kind" -> ttType.kind
    )
  }

  implicit val groupWrites = new Writes[Group] {
    def writes(group: Group) = Json.obj(
      "id" -> group.id,
      "name" -> group.name
    )
  }

  implicit val ttMatchWrites = new Writes[TTMatch] {
    def writes(ttMatch: TTMatch) = Json.obj(
      "id" -> ttMatch.id,
      "startTime" -> ttMatch.startTime,
      "isPlayed" -> ttMatch.isPlayed
      // "allowedTableGroups" -> ttMatch.allowedTableGroups,
      // "result" -> ttMatch.getResult
      // "colorId" -> ttMatch.colorId
    )
  }

  implicit val matchListWrites = new Writes[MatchList] {
    def writes(matchList: MatchList) = Json.obj(
      "id" -> matchList.id,
      "position" -> matchList.position,
      "group" -> matchList.asGroup
    )
  }

  case class AllMatchInfo(
    ttMatch: TTMatch,
    player1: Seq[Player],
    player2: Seq[Player],
    matchType: MatchType,
    ttType: Type,
    group: Option[Group]
  )

  implicit val allMatchInfoWrites = new Writes[AllMatchInfo] {
    def writes(allMatchInfo: AllMatchInfo) = Json.obj(
      "match" -> allMatchInfo.ttMatch,
      "team1" -> allMatchInfo.player1,
      "team2" -> allMatchInfo.player2,
      "matchType" -> allMatchInfo.matchType,
      "type" -> allMatchInfo.ttType,
      "group" -> allMatchInfo.group
    )
  }

  case class MatchListInfo(
    matchList: MatchList,
    ttMatch: AllMatchInfo
  )

  implicit val matchListInfoWrites = new Writes[MatchListInfo] {
    def writes(matchListInfo: MatchListInfo) = Json.obj(
      "matchListItem" -> matchListInfo.matchList,
      "matchinfo" -> matchListInfo.ttMatch
    )
  }

  def getAllMatchInfo(ttMatch: TTMatch): Future[Option[AllMatchInfo]] = {
    val p1F = Future.sequence(ttMatch.player1Ids map {id => tables.getPlayer(id)})
    val p2F = Future.sequence(ttMatch.player2Ids map {id => tables.getPlayer(id)})
    val mtF = tables.getMatchType(ttMatch.matchTypeId)
    val tyF = tables.getType(ttMatch.typeId)
    val gF = tables.getGroup(ttMatch.groupId)
    val pF = for {
      p1 <- p1F
      p2 <- p2F
      mt <- mtF
      ty <- tyF
      g <- gF
    } yield(p1, p2, mt.get, ty.get, g)
    pF map {p =>
      Some(AllMatchInfo(
        ttMatch,
        p._1.flatten,
        p._2.flatten,
        p._3,
        p._4,
        p._5
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
    val newMLEntry = MatchList(None, id, None, position)
    tables.getMatchList flatMap {ml =>
      val newML = ml map {mlEntry =>
        if (mlEntry.position >= position) mlEntry.copy(position = mlEntry.position + 1) else mlEntry
      }
      val newMLAdded = newML ++ Seq(newMLEntry)
      tables.setMatchList(newMLAdded) map {result =>
        Ok("added match")
      }
    }
  }

  def addGroup(id: Long, position: Int) = Action.async{
    tables.getMatchesInGroup(id) flatMap { ml =>
      val addML = ml map { m =>
        MatchList(None, m.id, Some(id), position)
      }
      tables.getMatchList flatMap { oldML =>
        val ml = oldML map { mlEntry =>
          if (mlEntry.position >= position) mlEntry.copy(position = mlEntry.position + 1) else mlEntry
        }
        tables.setMatchList(ml ++ addML) map { res =>
          Ok("added group")
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
    val amiSeqF = tables.getMatchList flatMap { ml =>
      val x = ml map {mlEntry =>
        tables.getMatch(mlEntry.matchId) flatMap { m =>
          getAllMatchInfo(m.get) map {mi => MatchListInfo(mlEntry, mi.get)}
        }
      }
      Future.sequence(x)
    }
    amiSeqF map {amiSeq =>
      Ok(Json.toJson(amiSeq.headOption))      // TODO: do not read all matches
    }
  }

}
