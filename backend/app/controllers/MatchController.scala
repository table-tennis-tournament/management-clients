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

  implicit val playerDAOWrites = new Writes[PlayerDAO] {
    def writes(player: PlayerDAO) = Json.obj(
      "id" -> player.id,
      "firstName" -> player.firstName,
      "lastName" -> player.lastName,
      "ttr" -> player.ttr,
      "sex" -> player.sex
      //"club" -> player.club
    )
  }

  implicit val ttTableWrites = new Writes[TTTable] {
    def writes(ttTable: TTTable) = Json.obj(
      "id" -> ttTable.id,
      "number" -> ttTable.tableNumber,
      "isLocked" -> ttTable.isLocked
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
      "isPlayed" -> ttMatch.isPlayed,
      //"allowedTableGroups" -> ttMatch.allowedTableGroups,
      "result" -> ttMatch.getResult
      //"colorId" -> ttMatch.colorId
    )
  }

  case class AllMatchInfo(
    ttMatch: TTMatch,
    player1: Seq[Player],
    player2: Seq[Player],
    table: Option[TTTable],
    matchType: MatchType,
    ttType: Type,
    group: Option[Group]
  )

  implicit val allMatchInfoWrites = new Writes[AllMatchInfo] {
    def writes(allMatchInfo: AllMatchInfo) = Json.obj(
      "match" -> allMatchInfo.ttMatch,
      "team1" -> allMatchInfo.player1,
      "team2" -> allMatchInfo.player2,
      "table" -> allMatchInfo.table,
      "matchType" -> allMatchInfo.matchType,
      "type" -> allMatchInfo.ttType,
      "group" -> allMatchInfo.group
    )
  }

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


  implicit val playerIdFilterWrites = Json.writes[PlayerIdFilter]
  implicit val playerIdFilterReads = Json.reads[PlayerIdFilter]
  implicit val typeIdFilterWrites = Json.writes[TypeIdFilter]
  implicit val typeIdFilterReads = Json.reads[TypeIdFilter]
  implicit val matchFilterWrites = new Writes[MatchFilter] {
    override def writes(x: MatchFilter) = {
      val y = x match {
        case p: PlayerIdFilter => Json.toJson(p)
        case t: TypeIdFilter => Json.toJson(t)
      }
      y
    }
  }
  implicit val matchFilterTypeWrites = Json.writes[MatchFilterType]
  implicit val matchFilterTypeReads = new Reads[MatchFilterType] {
    override def reads(json: JsValue): JsResult[MatchFilterType] = {
      val filterType = (json \ "filterType").as[String]
      filterType match {
        case "PlayerIdFilter" => JsSuccess(MatchFilterType(filterType, (json \ "filter").as[PlayerIdFilter]))
        case "TypeIdFilter" => JsSuccess(MatchFilterType(filterType, (json \ "filter").as[TypeIdFilter]))
        case _ => {
          Logger.info("error parsing JSON: " + filterType)
          JsError()
        }
      }
    }
  }


  def getFilteredMatchList = Action.async { request =>
    tables.allMatches() map { matches =>
      val filters = Seq.empty[MatchFilterType] :+
        MatchFilterType("PlayerIdFilter", PlayerIdFilter(Seq(100L, 99L))) :+
        MatchFilterType("TypeIdFilter", TypeIdFilter(Seq(25L)))
      val filterTypeList = Json.toJson(filters).as[Seq[MatchFilterType]]
      val filterList = filterTypeList map {ft => ft.filter}
      val fMatches = filterList map {f =>
        f.filterMatches(matches)
      }
      Logger.info("fMatches: " + fMatches.toString)
      val res = fMatches.foldLeft(matches)((a, b) => a.intersect(b))
      Ok(res.toString)
    }
  }
}