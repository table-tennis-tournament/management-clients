package dao

import java.util.UUID
import actors.PrinterActor.Print
import akka.actor.ActorRef

import javax.inject.{Inject, Named}
import models._
import org.joda.time.DateTime
import org.slf4j.LoggerFactory
import play.api.Logger
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import slick.jdbc.JdbcProfile
import slick.sql.SqlProfile.ColumnOption.SqlType
import websocket.WebSocketActor.{UpdateMatchList, UpdateMatches, UpdateTable}

import scala.concurrent.{ExecutionContext, Future}
import scala.language.postfixOps

/**
  * Created by jonas on 29.09.16.
  */
class Tables @Inject()(protected val dbConfigProvider: DatabaseConfigProvider,
                       @Named("printer_actor") printerActor: ActorRef,
                       @Named("publisher_actor") pub: ActorRef)(implicit ec: ExecutionContext) extends HasDatabaseConfigProvider[JdbcProfile] {


  import profile.api._
  import models.MatchState._

  object PortableJodaSupport extends com.github.tototoshi.slick.GenericJodaSupport(dbConfigProvider.get.profile)

  import PortableJodaSupport._

  var printOnStart: Boolean = true
  var autoStart: Boolean = false

  // Tables
  private val ttTables = TableQuery[TTTablesTable]
  private val matches = TableQuery[MatchesTable]
  private val player = TableQuery[PlayerTable]
  private val matchTypes = TableQuery[MatchTypeTable]
  private val types = TableQuery[TypeTable]
  private val groups = TableQuery[GroupTable]
  private val clubs = TableQuery[ClubTable]
  private val doubles = TableQuery[DoubleTable]
  private val playerPerGroup = TableQuery[PlayerPerGroupTable]
  private val typePerPlayer = TableQuery[TypePerPlayerTable]
  private val matchTable = TableQuery[TTMatchTable]

  var ttTablesSeq = Seq.empty[TTTable]
  var ttMatchSeq = Seq.empty[TTMatch]
  var ttPlayerSeq = Seq.empty[Player]
  var ttClubsSeq = Seq.empty[Club]
  var ttMatchTypeSeq = Seq.empty[MatchType]
  var ttTypeSeq = Seq.empty[Type]
  var ttGroupsSeq = Seq.empty[Group]
  var ttDoublesSeq = Seq.empty[Double]
  var ttMatchListSeq = Seq.empty[MatchList]
  var ttMatchTableSeq = Seq.empty[MatchTable]
  var ttTypePerPlayer = Seq.empty[TypePerPlayer]

  val log = LoggerFactory.getLogger("tableLoger")

  class ContainsAnyOf[T](seq: Seq[T]) {
    def containsAnyOf(xs: Seq[T]): Boolean = seq.exists(xs.contains(_))
  }

  implicit def seqToContainsAnyOf[T](seq: Seq[T]): ContainsAnyOf[T] = new ContainsAnyOf(seq)

  def getAllMatchInfo(ttMatch: TTMatch): Option[AllMatchInfo] = {
    val p1 = getPlayersForMatch(ttMatch.player1Ids)
    val p2 = getPlayersForMatch(ttMatch.player2Ids)
    val mt = getMatchType(ttMatch.matchTypeId)
    val ty = getType(ttMatch.typeId)
    val g = getGroup(ttMatch.groupId)
    val pl = isPlayable(ttMatch)
    val state = ttMatch.state
    val tn = getTTTableIdFromMatchId(ttMatch.id)
    if (mt.isDefined && ty.isDefined)
      Some(AllMatchInfo(ttMatch, p1, p2, mt.get, ty.get, g, pl, state, tn))
    else {
      log.error("None: " + mt + ty)
      None
    }
  }

  def getTableManagerMatchInfo(ttMatch: TTMatch): Option[TableManagerMatch] = {
    val p1 = getTableManagerPlayers(ttMatch.player1Ids)
    val p2 = getTableManagerPlayers(ttMatch.player2Ids)
    val mt = getMatchType(ttMatch.matchTypeId)
    val ty = getType(ttMatch.typeId)
    val state = ttMatch.state
    if (mt.isDefined && ty.isDefined)
    Some(TableManagerMatch(ttMatch.id, getTableManagerResult(ttMatch), p1, p2, mt.get.name, ty.get.name, state))
    else {
      log.error("None: " + mt + ty)
      None
    }
  }

  def getPlayersForMatch(playerIds : Seq[Long]): Seq[Player] = {
    playerIds.map(id => getPlayerTypes(getPlayer(id))).filter(_.isDefined).map(_.get)
  }

  def getTableManagerPlayers(playerIds : Seq[Long]): Seq[TableManagerPlayer] = {
    getPlayersForMatch(playerIds).map(pl => TableManagerPlayer(pl.id, pl.firstName, pl.lastName, pl.club.get.clubName, 1))
  }

  def getTableManagerResult(ttMatch: TTMatch): TableManagerResult = {
    val result = ttMatch.getResult
    if(result.isEmpty) {
      return TableManagerResult(Seq.empty[TableManagerGame], 0, 0)
    }
    val games = result.get.map(result => TableManagerGame(result.head, result.tail.head))
    val sets = getSetsFromResult(result.get)
    TableManagerResult(games, sets.head, sets(1))
  }

  def allTableInfo: Seq[TableInfo] = allTTTables().map(t => getAllTableInfo(t)).sortBy(_.tableNumber)

  def getAllTableInfo(ttTable: TTTable): TableInfo = {
    TableInfo(
      ttTable.id,
      ttTable.tableNumber,
      ttTable.isLocked,
      ttTable.matchId.map(id => getAllMatchInfo(getMatch(id).get).get)
    )
  }

 def getTableManagerTableInfo(ttTable: TTTable, managerId: Long): TableManagerTableInfo = {
    TableManagerTableInfo(
      ttTable.id,
      ttTable.tableNumber,
      managerId,
      ttTable.matchId.map(id => getTableManagerMatchInfo(getMatch(id).get).get).sortBy(_.id)
    )
  }

  def updateTTTables(): Future[Boolean] = {
    val ttTableF = dbConfigProvider.get.db.run(ttTables.filterNot(_.name === 0).sortBy(_.name.asc).result)
    ttTableF map { ttTables =>
      ttTablesSeq = ttTables map { newTable =>
        ttTablesSeq.find(tab => tab.id == newTable.id) match {
          case Some(oldTable) => oldTable.copy(tableNumber = newTable.tableNumber,
            matchId = ttMatchTableSeq.filter(_.tableId == newTable.id).map(_.matchId))
          case None => toTTTable(newTable)
        }
      }
      log.debug("read Tables: " + ttTablesSeq.size.toString)
      true
    }
  }

  def toTTTable(ttTableDAO: TTTableDAO) = TTTable(
    ttTableDAO.id, ttTableDAO.tableNumber, ttTableDAO.isLocked,
    ttMatchTableSeq.filter(_.tableId == ttTableDAO.id).map(_.matchId)
  )

  def allTTTables(): Seq[TTTable] = {
    ttTablesSeq
  }

  def getFreeTables(): Seq[TTTable] = {
    ttTablesSeq.filter(t => t.matchId.isEmpty && !t.isLocked.getOrElse(false))
  }

  def getFreeTable(tableIds: Seq[Long]): Option[TTTable] = {
    val freeTables = getFreeTables
    if (tableIds.isEmpty) {
      freeTables.headOption
    } else freeTables.find(t => tableIds.contains(t.id))
  }

  def getTTTable(id: Option[Long]): Option[TTTable] = {
    if (id.isDefined) getTTTable(id.get) else None
  }

  def getTTTableFromName(name: Int): Option[TTTable] = ttTablesSeq.find(_.tableNumber == name)

  def getTTTable(id: Long): Option[TTTable] = ttTablesSeq.find(_.id == id)

  def startMatchOnTTTable(matchId: Long, tableId: Long): Unit = {
    val tableInfo = getTableInfoForMatchAndTable(matchId, tableId)
    updateMatchState(Started,  List(matchId))
    sendMatchAndTableMessage(matchId, tableInfo)
  }

  def removeMatchFromOtherTables(matchId: Long, tableId: Long) = {
    val result = ttTablesSeq.filter(t => t.id != tableId && t.matchId.contains(matchId)).map(t => removeMatchFromTable(matchId, t.id))
    Future.sequence(result).map(_.sum)
  }

  def removeMatchFromTable(matchId: Long, tableId: Long) = {
    ttTablesSeq = ttTablesSeq map { t =>
      if(t.id == tableId && isMatchOnSecondTable(matchId, tableId)) t.copy(matchId = t.matchId.filter(_ != matchId))
      else t
    }
    ttMatchTableSeq = ttMatchTableSeq.filterNot(mt => mt.tableId == tableId && mt.matchId == matchId)
    deleteMatchTable(matchId, tableId)
  }

  def isMatchOnSecondTable(matchId: Long, tableId: Long) = {
    val res = ttMatchTableSeq.filter(mt => mt.matchId == matchId && mt.tableId != tableId).nonEmpty
    log.info("onSecondTable: " + res.toString)
    res
  }

  def setMatchStateToOnTable(matchId: Long): Unit = {
    val tableInfo = getTableInfoForMatch(matchId)
    updateMatchState(OnTable, List(matchId))
    sendMatchAndTableMessage(matchId, tableInfo)
  }

  def updateCallStateForMatch(matchId: Long): Unit = {
    val tableInfo = getTableInfoForMatch(matchId).flatMap(info => info.ttMatch).filter(_.ttMatch.id == matchId).head
    if(tableInfo.state == OnTable) {
      updateMatchState(SecondCall, matchId)
    } else if(tableInfo.state == SecondCall) {
      updateMatchState(ThirdCall, List(matchId))
    }
  }

  def updateStateForMatchesAndRemoveFromTable(matchIds: Seq[Long], newState: MatchState): Unit = {
    removeMatchesFromTable(matchIds)
    updateMatchState(newState, matchIds)
  }

  private def removeMatchesFromTable(matchIds: Seq[Long]): Unit = {
    ttTablesSeq = ttTablesSeq map { t =>
      t.copy(matchId = t.matchId.filterNot(matchIds contains))
    }
    deleteMatchTableForMatches(matchIds)
  }

  private def sendMatchAndTableMessage(matchId: Long, tableInfo: Seq[TableInfo]): Unit = {
    pub ! UpdateMatches(getAllMatchInfoForRelatedPlayers(List(matchId)))
    pub ! UpdateTable(allTableInfo.filter(ti => tableInfo.map(_.id).contains(ti.id)))
  }

  def getAllMatchInfoForRelatedPlayers(matchIds: Seq[Long]): Seq[AllMatchInfo] = {
    val relatedPlayerIds = allMatchesInfo
      .filter(currentMatch => matchIds.contains(currentMatch.ttMatch.id))
      .map(m => m.player1 ++ m.player2)
      .reduce((p1, p2) => p1 ++ p2)
      .map(_.id)
      .distinct
    allMatchesInfo.filter(m => relatedPlayerIds.exists(id => (m.player1 ++ m.player2).map(_.id).contains(id)))
  }

  def getTableInfoForMatch(matchId: Long): Seq[TableInfo] = {
    allTableInfo.filter(_.ttMatch.map(_.ttMatch.id).contains(matchId))
  }

  def getTableInfoForMatchAndTable(matchId: Long, tableId: Long): Seq[TableInfo] = {
    allTableInfo.filter(_.id == tableId).filter(_.ttMatch.map(_.ttMatch.id).contains(matchId))
  }

  def getTableInfoIdsForMatches(matchIds: Seq[Long]):Seq[Long]= {
    allTableInfo.filter(_.ttMatch.map(_.ttMatch.id).containsAnyOf(matchIds)).map(_.id)
  }

  def getTableInfosForIds(tableIds: Seq[Long]): Seq[TableInfo] = {
    allTableInfo.filter(table => tableIds.contains(table.id))
  }

  def lockTTTable(nr: Long): Unit = {
    ttTablesSeq = ttTablesSeq map { t =>
      if (t.tableNumber == nr) t.copy(isLocked = Some(true))
      else t
    }
    pub ! UpdateTable(allTableInfo.filter(_.tableNumber == nr))
  }

  def unlockTTTable(nr: Long): Unit = {
    ttTablesSeq = ttTablesSeq map { t =>
      if (t.tableNumber == nr) t.copy(isLocked = Some(false))
      else t
    }
    pub ! UpdateTable(allTableInfo.filter(_.tableNumber == nr))
  }

  def getTTTableIdFromMatchId(matchId: Long): Seq[Int] = {
    ttTablesSeq.filter(_.matchId.contains(matchId)).map(_.tableNumber).sortBy(a => a)
  }

  def getTTTableFromMatchId(matchId: Long): Seq[TTTable] = {
    ttTablesSeq.filter(_.matchId.contains(matchId))
  }

  def getCallableMatches: Map[Long, Seq[(MatchTable, TTMatch)]] = {
    getMatchTableByState(Callable)
  }

  def getSecondCallMatches: Map[Long, Seq[(MatchTable, TTMatch)]] = {
    getMatchTableByState(SecondCall)
  }

  def getThirdCallMatches: Map[Long, Seq[(MatchTable, TTMatch)]] = {
    getMatchTableByState(ThirdCall)
  }

  private def getMatchTableByState(matchState: MatchState): Map[Long, Seq[(MatchTable, TTMatch)]] = {
    ttMatchTableSeq.flatMap(mt => ttMatchSeq.find(_.id == mt.matchId)
      .map(m => (mt, m)))
      .filter(_._2.state == matchState)
      .groupBy(_._1.tableId)
  }


  // Matches

  def isPossibleMatch(ml: MatchList): Boolean = {
    ml.matchId.forall(id => isPlayable(getMatch(id).get))
  }

  def filterFirst(ls: List[MatchList]): List[MatchList] = {
    def loop(set: Set[Long], ls: List[MatchList]): List[MatchList] = ls match {
      case hd :: tail if containsPlayer(set, hd) => loop(set, tail)
      case hd :: tail => hd :: loop(set ++ getPlayerIds(hd), tail)
      case Nil => Nil
    }

    def getPlayerIds(ml: MatchList) = ml.matchId.map(id => getMatch(id).get).flatMap(m => m.player1Ids ++ m.player2Ids)

    def containsPlayer(set: Set[Long], ml: MatchList) = {
      set.intersect(getPlayerIds(ml).toSet).nonEmpty
    }

    loop(Set(), ls)
  }



  def startNextMatch = if(autoStart) {
    val tl = getFreeTables().sortBy(_.tableNumber)
    val tl2 = tl.filter(_.tableNumber % 2 == 1) ++ tl.filter(_.tableNumber % 2 == 0)
    tl2 map { table =>
      log.debug("start next Match")
      val ml = filterFirst(getMatchList.toList)
      val inverseFilteredML = ml.filterNot(mlItem => isPossibleMatch(mlItem))
      val filteredML = ml.filter { mlItem =>
        val m1PlayerIds = mlItem.matchId.flatMap(id => getMatch(id).get.player1Ids ++ getMatch(id).get.player2Ids).distinct
        isPossibleMatch(mlItem) &&
        inverseFilteredML.forall{ml =>
          val m2PlayerIds = ml.matchId.flatMap(id => getMatch(id).get.player1Ids ++ getMatch(id).get.player2Ids).distinct
          ml.position > mlItem.position || m2PlayerIds.forall(id => !m1PlayerIds.contains(id))
        }
      }
      filteredML.sortBy(_.position).headOption match {
        case Some(ml) =>
          val matchIds = ml.matchId
          val tableId = table.id
          val matches = allMatches()
          val m = matchIds.map(id => matches.filter(_.id == id).head)
          val matchReady = m.forall(m => if (m.state == Open || m.state == InWaitingList) {
            (m.player1Ids ++ m.player2Ids).forall { p =>
              val ml = matches.filter { ma =>
                isBlocking(ma.state)  && (ma.player1Ids.contains(p) || ma.player2Ids.contains(p))
              }
              ml.isEmpty // p is not playing
            }
          } else {
            false
          })
          val res = if (matchReady) {
            val result = matchIds map { matchId =>
              val ml = getMatchList
              ml.find(_.matchId.contains(matchId)) match {
                case Some(mlItem) =>
                  delMatchListItem(mlItem.uuid.get, matchId)
                  startMatch(matchId, table.id, true)
                case _ =>
                  startMatch(matchId, table.id, true)
              }
            }
            pub ! UpdateTable(allTableInfo.filter(_.id == table.id))
            pub ! UpdateMatches(allMatchesInfo.filter(x => matchIds.contains(x.ttMatch.id)))
            pub ! UpdateMatchList(getAllMatchList)
            result.forall(x => x)
          } else {
            log.error("Match not ready")
            false
          }
        case _ =>
      }
    }
  }

  def updateMatches(): Future[Boolean] = {
    dbConfigProvider.get.db.run(matches.result) map { res =>
      val x = res map { r =>
        toMatch(r)
      }
      ttMatchSeq = x
      log.debug("read Matches: " + ttMatchSeq.size.toString)
      true
    }
  }

  def loadNewMatches(): Future[Boolean] = {
    updateDoublesSeq flatMap { x =>
      dbConfigProvider.get.db.run(matches.result) map { res =>
        val x = res map { r =>
          toMatch(r)
        }
        val matchSeqIds = ttMatchSeq.map(_.id)
        val newMatches = x.filter(m => !matchSeqIds.contains(m.id))
        ttMatchSeq = ttMatchSeq ++ newMatches
        log.info("add Matches " + newMatches.size.toString)
        true
      }
    }
  }

  def allMatches(): Seq[TTMatch] = {
    ttMatchSeq
  }

  def allMatchesInfo: Seq[AllMatchInfo] = allMatches().map(m => getAllMatchInfo(m).get).sortBy(_.ttMatch.id)

  def getMatchesOnTable(id: Long): Seq[TTMatch] = {
    ttMatchSeq.filter( m => ttTablesSeq.filter(_.id == id).head.matchId.contains(m.id))
  }

  def isPlayable(ttMatch: TTMatch): Boolean = {
    val ids = ttMatch.player1Ids ++ ttMatch.player2Ids
    val noOpenMatchesForPlayers = !ttMatchSeq.exists(m =>
      (m.player1Ids.containsAnyOf(ids) || m.player2Ids.containsAnyOf(ids))
        && isBlocking(m.state))
    noOpenMatchesForPlayers && ttMatch.team2Id != 0 && ttMatch.team1Id != 0
  }

  def toMatch(m: MatchDAO): TTMatch = {
    val isOnTable = ttMatchTableSeq.exists(_.matchId == m.id)
    if (m.team1Id < 100000 && m.team2Id < 100000) {
      TTMatch(m.id, m.team1Id, m.team2Id, Seq(m.team1Id), Seq(m.team2Id), m.matchTypeId,
        m.typeId, m.groupId, m.startTime, m.resultRaw, m.result, m.balls1, m.balls2, m.sets1, m.sets2, m.nr, m.plannedTableId, 1,
        if(m.matchTypeId == 9) Some(m.roundNumber) else None, if(m.isPlayed) Completed else if(isOnTable) OnTable else Open)
    } else {
      val d1 = getDouble(m.team1Id - 100000)
      val d2 = getDouble(m.team2Id - 100000)
      TTMatch(m.id, m.team1Id, m.team2Id, if (d1.isDefined) Seq(d1.get.player1Id, d1.get.player2Id) else Seq.empty,
        if (d2.isDefined) Seq(d2.get.player1Id, d2.get.player2Id) else Seq.empty, m.matchTypeId,
        m.typeId, m.groupId, m.startTime, m.resultRaw, m.result, m.balls1, m.balls2, m.sets1, m.sets2, m.nr, m.plannedTableId,
        2, if(m.matchTypeId == 9) Some(m.roundNumber) else None, if(m.isPlayed) Completed else if(isOnTable) OnTable else Open)
    }
  }

  def toMatchDAO(m: TTMatch): MatchDAO = {
    if(m.player1Ids.length < 2)
      MatchDAO(m.id, isPlaying(m.state), m.player1Ids.headOption.getOrElse(0), m.player2Ids.headOption.getOrElse(0), None, isCompleted(m), m.matchTypeId,
        m.typeId, m.groupId, m.startTime, m.resultRaw, m.result, m.balls1, m.balls2, m.sets1, m.sets2, m.nr, m.plannedTableId,
        m.roundNumber.getOrElse(0), Some(m.getWinnerIds.headOption.getOrElse(0)))
    else {
      MatchDAO(m.id, isPlaying(m.state), m.team1Id, m.team2Id, None, isCompleted(m), m.matchTypeId,
        m.typeId, m.groupId, m.startTime, m.resultRaw, m.result, m.balls1, m.balls2, m.sets1, m.sets2, m.nr, m.plannedTableId,
        m.roundNumber.getOrElse(0), getWinnerIdForDouble(m))
    }
  }

  private def getWinnerIdForDouble(m: TTMatch) = {
    val team1Ids = getPlayerIdsOrEmptyList(m.team1Id)
    val team2Ids = getPlayerIdsOrEmptyList(m.team2Id)
    Some(
      if (team1Ids.contains(m.getWinnerIds.headOption.getOrElse(0))) m.team1Id
      else if (team2Ids.contains(m.getWinnerIds.headOption.getOrElse(0))) m.team2Id
      else 0)
  }

  private def getPlayerIdsOrEmptyList(teamId: Long): Seq[Long] = {
    val secondTeam = getDouble(teamId - 100000)
    if(secondTeam.isEmpty) {
      log.info("Empty team for teamId: "+ teamId)
      return Seq.empty;
    }
    Seq(secondTeam.get.player1Id, secondTeam.get.player2Id)
  }

  private def isCompleted(m: TTMatch) = {
    m.state == Completed
  }

  private def isPlaying(matchState: MatchState) = {
    List(Callable, OnTable, Started).contains(matchState)
  }

  def startMatch(matchId: Long, tableId: Long, print: Boolean = true): Boolean= {
    log.debug("start match")
    updateMatchState(Callable, List(matchId))
    val currentTime = new DateTime()
    ttMatchSeq = ttMatchSeq map { m =>
      if (m.id == matchId) m.copy(state = Callable, startTime = currentTime)
      else m
    }
    ttTablesSeq = ttTablesSeq map { t =>
      if (t.id == tableId) t.copy(matchId = t.matchId :+ matchId)
      else t
    }
    saveMatchTable(MatchTable(UUID.randomUUID(), matchId, tableId, new DateTime()))
    if(printOnStart && print) printerActor ! Print(getAllMatchInfo(getMatch(matchId).get).get)
    true
  }

  def deleteMatch(matchId: Long): Unit = ttMatchSeq = ttMatchSeq.filter(_.id != matchId)

  def deleteType(typeId: Long): Unit = ttMatchSeq = ttMatchSeq.filter(_.typeId != typeId )

  def startGroup(matchIds: Seq[Long], tableId: Long): Unit = {
    matchIds foreach { mId =>
      startMatch(mId, tableId)
    }
  }

  def getMatch(id: Long): Option[TTMatch] = ttMatchSeq.find(_.id == id)

  def getMatchesInGroup(id: Long): Seq[TTMatch] = {
    ttMatchSeq.filter(_.groupId.getOrElse(0) == id)
  }

  def updateMatchState(matchState: MatchState, matchIds: Seq[Long]): Unit = {
    ttMatchSeq = ttMatchSeq.map {m =>
      if(matchIds.contains(m.id)) m.copy(state = matchState)
      else m
    }
  }

  def updateMatchState(matchState: MatchState, matchId: Long): Unit = {
    updateMatchState(matchState, List(matchId))
  }

  def setStartTime(matchId: Long, startTime: DateTime): Unit = {
    ttMatchSeq = ttMatchSeq.map {m =>
      if(m.id == matchId) m.copy(startTime = startTime)
      else m
    }
  }

  def isPossibleMatch(id: Long): Boolean = {
    val matchO = ttMatchSeq.find(_.id == id)
    matchO match {
      case Some(m) =>
        val playerIds = ttMatchSeq.filter(m => m.state == Open || m.state == InWaitingList).flatMap(m => m.player1Ids ++ m.player2Ids)
        playerIds.containsAnyOf(m.player1Ids ++ m.player2Ids) && m.player1Ids.nonEmpty && m.player2Ids.nonEmpty
      case _ => false
    }
  }

  def updateResult(id: Long, result: Seq[Seq[Int]]) = {
    setResultAndCompletedStateOnMatch(id, result, setCompleted = false)
    pub ! UpdateMatches(allMatchesInfo.filter(_.ttMatch.id == id))
  }

  def setResult(matchId: Long, result: Seq[Seq[Int]]): Future[Boolean] = {
    setResultAndCompletedStateOnMatch(matchId, result, setCompleted = true)
    removeMatchesFromTable(List(matchId))
    updateMatchAndWriteKOMatchOrUpdateGroup(matchId)
  }

  private def updateMatchAndWriteKOMatchOrUpdateGroup(matchId: Long): Future[Boolean] = {
    ttMatchSeq.find(_.id == matchId) match {
      case Some(ttMatch) => writeMatch(ttMatch) flatMap { b =>
        if (b // write successful
          && ttMatch.groupId.getOrElse(0) == 999 // KO match
          && (2 to 8).contains(ttMatch.matchTypeId) // not the final match
        ) {
          writeNextKoMatch(ttMatch)
        } else {
          if (isGroupCompleted(ttMatch.groupId.get)) updatePlayerPerGroup(ttMatch.groupId.get)
          Future.successful(b)
        }
      }
      case _ => Future.successful(false)
    }
  }

  def setResultAndCompletedStateOnMatch(matchId: Long, result: Seq[Seq[Int]], setCompleted:Boolean) = {
    val x = result map (r => r.mkString("="))
    val balls = result.foldRight(Seq(0,0)){(x,y) => Seq(x.head+y.head, x(1)+y(1))}
    val sets = getSetsFromResult(result)
    ttMatchSeq = ttMatchSeq map { m =>
      if (m.id == matchId) {
        m.copy(
          resultRaw = x.mkString(","),
          result = sets.head + " : " + sets(1),
          balls1 = balls.head,
          balls2 = balls(1),
          sets1 = sets.head,
          sets2 = sets(1),
          state = if(setCompleted)Completed else m.state
        )
      } else m
    }
  }

  private def getSetsFromResult(result: Seq[Seq[Int]]) = {
    result.foldLeft(Seq(0, 0)) { (x, y) => if (y.head > y(1)) Seq(x.head + 1, x(1)) else Seq(x.head, x(1) + 1) }
  }

  def writeNextKoMatch(ttMatch: TTMatch): Future[Boolean] = {
    val nr = ttMatch.nr
    val newNr =  ((nr/1000)-1)*1000+((nr%1000)+1)/2
    val uMatch = ttMatchSeq.filter(m => m.nr == newNr && m.typeId == ttMatch.typeId).head
    val winnerIds = ttMatch.getWinnerIds
    val singleWinnerId = getTeamOrSingleWinner(winnerIds, ttMatch)
    log.error("current winner id: "+singleWinnerId)
    val newMatch = if(nr%1000%2 == 1) {
      uMatch.copy(player1Ids = winnerIds, team1Id = singleWinnerId)
    } else {
      uMatch.copy(player2Ids = winnerIds, team2Id = singleWinnerId)
    }
    ttMatchSeq = ttMatchSeq map { m =>
      if (m.id == newMatch.id){
        newMatch
      }
      else m
    }
    pub ! UpdateMatches(allMatchesInfo.filter(_.ttMatch.id == newMatch.id))
    writeMatch(newMatch) map {res =>
      res
    }
  }

  def getTeamOrSingleWinner(winnerIds: Seq[Long], ttMatch: TTMatch):Long = {
    if(winnerIds.isEmpty) {
      log.error("Winner ids are empty for matchid: "+ ttMatch.id)
      return 0;
    }
    if(winnerIds.size == 1) {
      return winnerIds.head
    }
    if(winnerIds.contains(getDouble(ttMatch.team1Id - 100000).get.player1Id)) {
        ttMatch.team1Id
    }
    else ttMatch.team2Id
  }

  def writeMatch(ttMatch: TTMatch): Future[Boolean] = {
    dbConfigProvider.get.db.run(matches.insertOrUpdate(toMatchDAO(ttMatch))) map {r =>
      if(r == 1) true else false
    }
  }

  // Players

  def getPlayerFromPlayerDAO(p: PlayerDAO): Player = {
    val playerMatches = ttMatchSeq.filterNot(m =>  m.state == Completed || m.state == Finished).filter(m => (m.player1Ids ++ m.player2Ids).contains(p.id))
    val club = if(p.clubId.isDefined) getClub(p.clubId.get) else None
    Player(p.id, p.firstName, p.lastName, p.ttr, p.sex, club, playerMatches.isDefinedAt(0), Seq.empty[Long])
  }

  def updatePlayerList: Future[Boolean] = {
    dbConfigProvider.get.db.run(player.result) map { ap =>
      val x = ap map { p => getPlayerFromPlayerDAO(p)}
      ttPlayerSeq = x
      log.info("read Players: " + ttPlayerSeq.size.toString)
      true
    }
  }

  def allPlayer: Seq[Player] = {
    ttPlayerSeq
  }

  def getPlayer(id: Long): Option[Player] = ttPlayerSeq.find(_.id == id)

  def getPlayerTypes(playerO: Option[Player]): Option[Player] = {
    playerO match {
      case Some(player) =>
        val types = ttMatchSeq.filter(m => (m.getResult.isEmpty && (m.player1Ids.contains(player.id) || m.player2Ids.contains(player.id))))
          .map(_.typeId).distinct
        Some(player.copy(typeIds = types))
      case _ => None
    }

  }

  def updateClubList: Future[Boolean] = {
    dbConfigProvider.get.db.run(clubs.result) map {cList =>
      ttClubsSeq = cList
      log.debug("read Clubs: " + ttClubsSeq.size.toString)
      true
    }
  }

  def getClub(id: Long): Option[Club] = ttClubsSeq.find(_.id == id)


  def updateMatchTypeList: Future[Boolean] = {
    dbConfigProvider.get.db.run(matchTypes.result) map {mtList =>
      ttMatchTypeSeq = mtList
      log.debug("read MatchTypes: " + ttMatchTypeSeq.size.toString)
      true
    }
  }

  def getMatchType(id: Long): Option[MatchType] = ttMatchTypeSeq.find(_.id == id)



  def updateTypesList: Future[Boolean] = {
    dbConfigProvider.get.db.run(types.result) map {tList =>
      ttTypeSeq = tList
      log.debug("read Types: " + ttTypeSeq.size.toString)
      true
    }
  }

  def getType(id: Long): Option[Type] = ttTypeSeq.find(_.id == id)

  def allTypes: Seq[Type] = {
    ttTypeSeq
  }



  def updateGroupsSeq: Future[Boolean] = {
    dbConfigProvider.get.db.run(groups.result) map {gList =>
      ttGroupsSeq = gList
      log.debug("read Groups: " + ttGroupsSeq.size.toString)
      true
    }
  }

  def getGroup(id: Option[Long]): Option[Group] = if(id.isDefined) getGroup(id.get) else None

  def getGroup(id: Long): Option[Group] = ttGroupsSeq.find(_.id == id)



  def updateDoublesSeq: Future[Boolean] = {
    dbConfigProvider.get.db.run(doubles.result) map {dList =>
      ttDoublesSeq = dList
      log.debug("read Doubles: " + ttDoublesSeq.size.toString)
      true
    }
  }

  def getAllDoubles: Seq[Double] = ttDoublesSeq

  def getDouble(id: Long): Option[Double] = ttDoublesSeq.find(_.id == id)

  // matchlist

  def getMatchList: Seq[MatchList] = {
    ttMatchListSeq.sortBy(_.position)
  }

  def getAllMatchList: Seq[MatchListInfo] = {
    val ml = ttMatchListSeq.sortBy(_.position)
    ml map {mlEntry =>
      val m = mlEntry.matchId.map(id => getMatch(id)).filter(_.isDefined).map(_.get)
      val mi = m.map(m => getAllMatchInfo(m)).filter(_.isDefined).map(_.get)
      MatchListInfo(mlEntry, mi)
    }
  }

  def setMatchList(ml: Seq[MatchList]): Unit = {
    ttMatchListSeq = ml
  }

  def delMatchList(uuid: UUID): Boolean = {
    val result = findMatchListById(uuid) match {
      case Some(mlItem) =>
        mlItem.matchId.foreach(id => updateMatchState(Open, List(id)))
        ttMatchListSeq = ttMatchListSeq.filterNot(_.uuid.contains(uuid)) map { mlEntry =>
          if (mlEntry.position > mlItem.position) mlEntry.copy(position = mlEntry.position - 1) else mlEntry
        }
        true
      case _ => false
    }
    result
  }

  def findMatchListById(uuid: UUID) = {
    ttMatchListSeq.find(_.uuid.contains(uuid))
  }

  def delMatchListItem(uuid: UUID, id: Long): Unit = {
    ttMatchListSeq = ttMatchListSeq map { mlItem =>
      if (mlItem.uuid.contains(uuid)) {
        val newMlItem = mlItem.copy(matchId = mlItem.matchId.filterNot(_ == id))
        newMlItem
      }
      else mlItem
    }
    ttMatchListSeq.filter(_.matchId.isEmpty).foreach(ml => delMatchList(ml.uuid.get))
  }

  def delMatchListGroup(ml: Seq[MatchList], uuid: UUID): Unit = {
    ttMatchListSeq = ml
  }

  def isInMatchList(ttMatch: TTMatch): Boolean = ttMatchListSeq.exists(_.matchId.contains(ttMatch.id))


  //database table defintions

  class MatchesTable(tag: Tag) extends Table[MatchDAO](tag, "matches") {

    def id = column[Long]("Matc_ID", O.PrimaryKey, O.AutoInc)
    def isPlaying = column[Boolean]("Matc_IsPlaying")
    def player1Id = column[Long]("Matc_Play1_ID")
    def player2Id = column[Long]("Matc_Play2_ID")
    def ttTableId = column[Option[Long]]("Matc_Tabl_ID")
    def isPlayed = column[Boolean]("Matc_Played")
    def matchTypeId = column[Long]("Matc_MaTy_ID")
    def typeId = column[Long]("Matc_Type_ID")
    def groupId = column[Option[Long]]("Matc_Grou_ID")
    def startTime = column[DateTime]("Matc_StartTime")
    def resultRaw = column[String]("Matc_ResultRaw")
    def result = column[String]("Matc_Result")
    def balls1 = column[Int]("Matc_Balls1")
    def balls2 = column[Int]("Matc_Balls2")
    def sets1 = column[Int]("Matc_Sets1")
    def sets2 = column[Int]("Matc_Sets2")
    def plannedTableId = column[Option[Long]]("Matc_PlannedTable_ID")
    def nr = column[Int]("Matc_Nr")
    def roundNumber = column[Int]("Matc_RoundNumber")
    def winnerId = column[Option[Long]]("Matc_Winner_ID")

    def * = (id, isPlaying, player1Id, player2Id, ttTableId, isPlayed, matchTypeId, typeId, groupId, startTime, resultRaw, result,
      balls1, balls2, sets1, sets2, nr, plannedTableId, roundNumber, winnerId) <> (MatchDAO.tupled, MatchDAO.unapply)
  }

  class MatchTypeTable(tag: Tag) extends Table[MatchType](tag, "matchtype") {

    def id = column[Long]("MaTy_ID", O.PrimaryKey, O.AutoInc)
    def name = column[String]("MaTy_Name")

    def * = (id, name) <> (MatchType.tupled, MatchType.unapply)
  }

  class GroupTable(tag: Tag) extends Table[Group](tag, "playgroups") {

    def id = column[Long]("Grou_ID", O.PrimaryKey, O.AutoInc)
    def name = column[String]("Grou_Name")

    def * = (id, name) <> (Group.tupled, Group.unapply)
  }

  class TypeTable(tag: Tag) extends Table[Type](tag, "type") {

    def id = column[Long]("Type_ID", O.PrimaryKey, O.AutoInc)
    def name = column[String]("Type_Name")
    def kind = column[Int]("Type_Kind")
    def active = column[Boolean]("Type_Active")

    def * = (id, name, kind, active) <> (Type.tupled, Type.unapply)
  }

  class DoubleTable(tag: Tag) extends Table[Double](tag, "doubles") {

    def id = column[Long]("Doub_ID", O.PrimaryKey, O.AutoInc)
    def player1Id = column[Long]("Doub_Play1_ID")
    def player2Id = column[Long]("Doub_Play2_ID")
    def kindId = column[Int]("Doub_Kind")

    def * = (id, player1Id, player2Id, kindId) <> (Double.tupled, Double.unapply)
  }

  class PlayerTable(tag: Tag) extends Table[PlayerDAO](tag, "player") {
    def id = column[Long]("Play_ID", O.PrimaryKey, O.AutoInc)
    def firstName = column[String]("Play_FirstName")
    def lastName = column[String]("Play_LastName")
    def ttr = column[Option[Int]]("Play_TTR")
    def paid = column[Boolean]("Play_Paid")
    def sex = column[String]("Play_Sex")
    def email = column[Option[String]]("Play_Email")
    def zipCode = column[Option[String]]("Play_PLZ")
    def location = column[Option[String]]("Play_Location")
    def street = column[Option[String]]("Play_Street")
    def phone = column[Option[String]]("Play_TelNr")
    def clubId = column[Option[Long]]("Play_Club_ID")

    def * = (id, firstName, lastName, ttr, sex, clubId) <> (PlayerDAO.tupled, PlayerDAO.unapply)

    def club = foreignKey("Club_FK", clubId, clubs)(_.id.?)
  }

  class ClubTable(tag: Tag) extends Table[Club](tag, "club") {

    def id = column[Long]("Club_ID", O.PrimaryKey, O.AutoInc)
    def name = column[String]("Club_Name")

    def * = (id, name) <> (Club.tupled, Club.unapply)
  }

  class PlayerPerGroupTable(tag: Tag) extends Table[PlayerPerGroup](tag, "playerpergroup") {
    def id = column[Long]("PPGr_ID", O.PrimaryKey, O.AutoInc)
    def playerId = column[Long]("PPGr_Play_ID")
    def groupId = column[Long]("PPGr_Grou_ID")
    def groupPos = column[Long]("PPGr_Position")
    def matchesWon = column[Long]("PPGr_GamesW")
    def matchesLost = column[Long]("PPGr_GamesL")
    def setsWon = column[Long]("PPGr_SetW")
    def setsLost = column[Long]("PPGr_SetL")
    def pointsWon = column[Long]("PPGr_PointsW")
    def pointsLost = column[Long]("PPGr_PointsL")
    def games = column[String]("PPGr_Games")
    def sets = column[String]("PPGr_Sets")
    def points = column[String]("PPGr_Points")
    def checked = column[Boolean]("PPGR_Checked")    // all matches played
    def setsDiff = column[Long]("PPGr_SetDiff")

    def * = (id, playerId, groupId, groupPos, matchesWon, matchesLost, setsWon, setsLost, pointsWon, pointsLost, games, sets, points, checked, setsDiff) <> (PlayerPerGroup.tupled, PlayerPerGroup.unapply)
  }

  class TTTablesTable(tag: Tag) extends Table[TTTableDAO](tag, "tables") {

    def id = column[Long]("Tabl_ID", O.PrimaryKey, O.AutoInc)
    def name = column[Int]("Tabl_Name")
    def left = column[Long]("Tabl_Left")
    def top = column[Long]("Tabl_Top")
    // def matchId = column[Long]("Tabl_Matc_ID")
    def tourId = column[Long]("Tabl_Tour_ID")
    def groupId = column[Option[Long]]("Tabl_Group")
    def isLocked = Option(false)

    def * = (id, name, isLocked) <> (TTTableDAO.tupled, TTTableDAO.unapply)
  }

  def allPlayerPerGroup: Future[Seq[PlayerPerGroup]] = db.run(playerPerGroup.result)

  def isGroupCompleted(groupID: Long): Boolean = !ttMatchSeq.exists(m => m.state != Completed && m.groupId.get == groupID)

  def updatePlayerPerGroup(groupId: Long): Future[Future[Int]] = {
    allPlayerPerGroup map { ppg =>
      val filteredPlayerPerGroup = ppg.filter(_.groupId == groupId)
      val ppgRes = filteredPlayerPerGroup map {ppg =>
        val p = ttPlayerSeq.filter(_.id == ppg.playerId).head
        val m1 = ttMatchSeq.filter(m => m.player1Ids.contains(p.id) && m.groupId.contains(groupId) && isCompleted(m))
        val m2 = ttMatchSeq.filter(m => m.player2Ids.contains(p.id) && m.groupId.contains(groupId) && isCompleted(m))
        var ballsWon = 0
        var ballsLost = 0
        var setsWon = 0
        var setsLost = 0
        var matchesWon = 0
        var matchesLost = 0
        m1.foreach { m =>
          ballsWon += m.balls1
          ballsLost += m.balls2
          setsWon += m.sets1
          setsLost += m.sets2
          if(m.sets1 > m.sets2) matchesWon += 1 else matchesLost += 1
        }
        m2.foreach { m =>
          ballsWon += m.balls2
          ballsLost += m.balls1
          setsWon += m.sets2
          setsLost += m.sets1
          if(m.sets2 > m.sets1) matchesWon += 1 else matchesLost += 1
        }
        ppg.copy(
          matchesWon = matchesWon,
          matchesLost = matchesLost,
          setsWon = setsWon,
          setsLost = setsLost,
          sets = setsWon + " : " + setsLost,
          games = matchesWon + " : " + matchesLost,
          points = ballsWon + " : " + ballsLost,
          pointsWon = ballsWon,
          pointsLost = ballsLost,
          setsDiff = setsWon - setsLost,
          checked = ttMatchSeq.filter(m => (m.player1Ids ++ m.player2Ids).contains(p.id) && m.groupId.contains(groupId)).forall(isCompleted(_))
        )
      }
      val res = ppgRes.sortBy(ppg => (-ppg.matchesWon, -ppg.setsDiff, -ppg.pointsWon)).zipWithIndex.map(p => p._1.copy(groupPos = p._2 + 1))
      Future.sequence(res.map(p => db.run(playerPerGroup.insertOrUpdate(p)))).map(_.sum)
    }
  }

  implicit val uuidToString = MappedColumnType.base[UUID, String](_.toString, UUID.fromString)

  class TTMatchTable(tag: Tag) extends Table[MatchTable](tag, "matchtable") {
    def uuid = column[UUID]("id", O.PrimaryKey, SqlType("CHAR"))(uuidToString)
    def tableId = column[Long]("tableId")
    def matchId = column[Long]("matchId")
    def timestamp = column[DateTime]("timestamp")

    def * = (uuid, matchId, tableId, timestamp) <> (MatchTable.tupled, MatchTable.unapply)
  }

  def allMatchTable = {
    dbConfigProvider.get.db.run(matchTable.result)
  }

  def getMatchTable(uuid: UUID) = dbConfigProvider.get.db.run(matchTable.filter(_.uuid === uuid).result.headOption)

  def getMatchTableForTable(tableId: Long) = dbConfigProvider.get.db.run(matchTable.filter(_.tableId === tableId).result)

  def getMatchTableForMatch(matchId: Long) = dbConfigProvider.get.db.run(matchTable.filter(_.matchId === matchId).result)

  def deleteMatchTableForMatch(matchId: Long) = {
    deleteMatchTableForMatches(List(matchId))
  }

  def deleteMatchTableForMatches(matchIds: Seq[Long]) = {
    matchIds foreach {
      matchId => dbConfigProvider.get.db.run(matchTable.filter(_.matchId === matchId).delete)
    }
    ttMatchTableSeq = ttMatchTableSeq.filter(m => !matchIds.contains(m.matchId))
  }

  def deleteMatchTableForTable(tableId: Long) = dbConfigProvider.get.db.run(matchTable.filter(_.tableId === tableId).delete)

  def deleteMatchTable(matchId: Long, tableId: Long) = dbConfigProvider.get.db.run(matchTable.filter(mt => mt.tableId === tableId && mt.matchId === matchId).delete)

  def saveMatchTable(newMatchTable: MatchTable) = {
    dbConfigProvider.get.db.run(matchTable.insertOrUpdate(newMatchTable))
    ttMatchTableSeq.find(_.uuid == newMatchTable.uuid) match {
      case Some(mt) => ttMatchTableSeq = ttMatchTableSeq.map(x => if(x.uuid == mt.uuid) newMatchTable else x)
      case None => ttMatchTableSeq :+= newMatchTable
    }
  }

  def updateMatchTableSeq = {
    dbConfigProvider.get.db.run(matchTable.result) map {gList =>
      ttMatchTableSeq = gList
      log.info("read MatchTable: " + ttMatchTableSeq.size.toString)
      true
    }
  }


  class TypePerPlayerTable(tag: Tag) extends Table[TypePerPlayer](tag, "typeperplayer") {
    def id = column[Long]("typl_id", O.PrimaryKey, O.AutoInc)
    def playerId = column[Long]("typl_play_id")
    def typeId = column[Long]("typl_type_id")
    def seed = column[Long]("typl_seed")
    def paid = column[Boolean]("typl_paid")
    def timestamp = column[String]("typl_timestamp")
    def cashId = column[Long]("typl_Cash_ID")
    def externalId = column[Option[String]]("Typl_ExternalID")

    def * = (id, playerId, typeId, seed, paid, timestamp, cashId, externalId) <> (TypePerPlayer.tupled, TypePerPlayer.unapply)
  }

  def loadTypePerPlayer = {
    log.info("loadTypePerPlayer")
    dbConfigProvider.get.db.run(typePerPlayer.result) map {tpp =>
      log.info("tpp")
      log.info("tpp" + tpp.size.toString())
      ttTypePerPlayer = tpp
      true
    }
  }

  def setPaid(typePerPlayerId: Long, value: Boolean) = {
    ttTypePerPlayer = ttTypePerPlayer.map {m =>
      if(m.id == typePerPlayerId) m.copy(paid = value)
      else m
    }
    val q = for { c <- typePerPlayer if c.id === typePerPlayerId } yield c.paid
    dbConfigProvider.get.db.run(q.update(value))
  }

  def allTypePerPlayer = {
    val activeTypes = allMatchesInfo.map(_.ttType.id).distinct
    val tppOut = ttTypePerPlayer map { tpp =>
      TypePerPlayerOut(tpp.id, ttPlayerSeq.find(_.id == tpp.playerId), ttTypeSeq.find(_.id == tpp.typeId), tpp.paid)
    }
    tppOut
      .filter(_.ttType match {case Some(t) => t.kind != 2 && !activeTypes.contains(t.id); case None => false})
      .sortBy(_.player match {case Some(p) => p.lastName; case None => ""})
  }

  def loadAllFromDB: Future[Boolean] = {
    log.info("loadAllFromDB")
    loadTypePerPlayer.map(x =>log.info("tpp: " + x.toString))
    updateMatchTableSeq flatMap { mt =>
      updateTTTables flatMap { t =>
        loadNewMatches() flatMap { n =>
          updateDoublesSeq flatMap { b =>
            updateClubList flatMap { d =>
              updateMatchTypeList flatMap { e =>
                updateTypesList flatMap { f =>
                  updateGroupsSeq flatMap { g =>
                    updatePlayerList flatMap { i =>
                      loadTypePerPlayer map { tpp =>
                        mt && t && n && b && d && e && f && g && i && tpp
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

}
