package models

import play.api.Logger

/**
  * Created by jonas on 29.12.16.
  */
trait MatchFilter {
  def filterMatches(matches: Seq[TTMatch]): Seq[TTMatch]
}

case class MatchFilterType(filterType: String, filter: MatchFilter)

case class PlayerIdFilter(playerIds: Seq[Long]) extends MatchFilter {
  override def filterMatches(matches: Seq[TTMatch]): Seq[TTMatch] = {
    val x = playerIds map {id =>
      matches.filter(_.id == id)
    }
    Logger.info("x: " + x.toString())
    val res = x.foldLeft(Seq.empty[TTMatch])((a, b) => a.union(b))
    Logger.info("filter player id: " + res.toString + " matches: " + matches.toString())
    res
  }
}

case class TypeIdFilter(typeIds: Seq[Long]) extends MatchFilter {
  override def filterMatches(matches: Seq[TTMatch]): Seq[TTMatch] = {
    val x = typeIds map {id =>
      matches.filter(_.typeId == id)
    }
    val res = x.foldLeft(Seq.empty[TTMatch])((a, b) => a.union(b))
    Logger.info("filter type id: " + res.toString + " matches: " + matches.toString())
    res
  }
}