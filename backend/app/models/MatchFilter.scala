package models

import play.api.Logger
import play.api.libs.json._

/**
  * Created by jonas on 29.12.16.
  */

object MatchFilter {
  implicit val playerIdFilterWrites = Json.writes[PlayerIdFilter]
  implicit val playerIdFilterReads = Json.reads[PlayerIdFilter]
  implicit val typeIdFilterWrites = Json.writes[TypeIdFilter]
  implicit val typeIdFilterReads = Json.reads[TypeIdFilter]
  implicit val matchTypeIdFilterWrites = Json.writes[MatchTypeIdFilter]
  implicit val matchTypeIdFilterReads = Json.reads[MatchTypeIdFilter]
  implicit val groupIdFilterWrites = Json.writes[GroupIdFilter]
  implicit val groupIdFilterReads = Json.reads[GroupIdFilter]
  implicit val kindIdFilterWrites = Json.writes[KindIdFilter]
  implicit val kindIdFilterReads = Json.reads[KindIdFilter]

  implicit val matchFilterWrites = new Writes[MatchFilter] {
    override def writes(x: MatchFilter) = {
      val y = x match {
        case p: PlayerIdFilter => Json.toJson(p)
        case t: TypeIdFilter => Json.toJson(t)
        case mt: MatchTypeIdFilter => Json.toJson(mt)
        case g: GroupIdFilter => Json.toJson(g)
        case k: KindIdFilter => Json.toJson(k)
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
        case "MatchTypeIdFilter" => JsSuccess(MatchFilterType(filterType, (json \ "filter").as[MatchTypeIdFilter]))
        case "GroupIdFilter" => JsSuccess(MatchFilterType(filterType, (json \ "filter").as[GroupIdFilter]))
        case "KindIdFilter" => JsSuccess(MatchFilterType(filterType, (json \ "filter").as[KindIdFilter]))
        case _ => {
          Logger.info("error parsing JSON: " + filterType)
          JsError()
        }
      }
    }
  }
}

trait MatchFilter {
  def filterMatches(matches: Seq[TTMatch]): Seq[TTMatch]
}

case class MatchFilterType(filterType: String, filter: MatchFilter)

case class PlayerIdFilter(playerIds: Seq[Long]) extends MatchFilter {
  override def filterMatches(matches: Seq[TTMatch]): Seq[TTMatch] = {
    val x = playerIds map {id =>
      matches.filter(m => m.player1Ids.contains(id) || m.player2Ids.contains(id))
    }
    Logger.info("x: " + x.toString())
    x.foldLeft(Seq.empty[TTMatch])((a, b) => a.union(b))
  }
}

case class TypeIdFilter(typeIds: Seq[Long]) extends MatchFilter {
  override def filterMatches(matches: Seq[TTMatch]): Seq[TTMatch] = {
    val x = typeIds map {id =>
      matches.filter(_.typeId == id)
    }
    x.foldLeft(Seq.empty[TTMatch])((a, b) => a.union(b))
  }
}

case class MatchTypeIdFilter(matchTypeIds: Seq[Long]) extends MatchFilter {
  override def filterMatches(matches: Seq[TTMatch]): Seq[TTMatch] = {
    val x = matchTypeIds map {id =>
      matches.filter(_.matchTypeId == id)
    }
    x.foldLeft(Seq.empty[TTMatch])((a, b) => a.union(b))
  }
}

case class GroupIdFilter(groupIds: Seq[Long]) extends MatchFilter {
  override def filterMatches(matches: Seq[TTMatch]): Seq[TTMatch] = {
    val x = groupIds map {id =>
      matches.filter(_.groupId == id)
    }
    x.foldLeft(Seq.empty[TTMatch])((a, b) => a.union(b))
  }
}

case class KindIdFilter(kindIds: Seq[Long]) extends MatchFilter {
  override def filterMatches(matches: Seq[TTMatch]): Seq[TTMatch] = {
    val x = kindIds map {id =>
      matches.filter(_.kindId == id)
    }
    x.foldLeft(Seq.empty[TTMatch])((a, b) => a.union(b))
  }
}