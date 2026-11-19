package de.ttt.management

import de.ttt.management.DatabaseHelper.MatchResult
import de.ttt.management.tournament.application.MatchListService
import de.ttt.management.tournament.application.MatchService

/**
 * The tournament scenarios several REST tests start from (registered by [ResourceTestConfiguration]). Each
 * expects an empty database, see [TestState.reset].
 */
class Scenarios(
    private val db: DatabaseHelper,
    private val matchService: MatchService,
    private val matchListService: MatchListService,
    private val printer: RecordingPrinterGateway
) {

    /**
     * Open matches for commands:
     * singles discipline 1 ("Herren") with group A and the open "Gruppenspiel" matches 1 (players 1 vs 2) and
     * 2 (players 1 vs 3, shares player 1 with match 1); doubles discipline 2 with the open match 3 (double 1 =
     * players 1, 2 vs double 2 = players 3, 4); tables 1 to 3, all free.
     */
    fun givenOpenMatches() {
        db.insertDiscipline(1, "Herren")
        db.insertDiscipline(2, "Herren", kind = 2)
        db.insertMatchType(1, "Gruppenspiel")
        db.insertGroup(1, "A", disciplineId = 1)
        (1L..4L).forEach { db.insertPlayer(it, "First$it", "Last$it") }
        db.insertDouble(1, player1Id = 1, player2Id = 2, disciplineId = 2)
        db.insertDouble(2, player1Id = 3, player2Id = 4, disciplineId = 2)
        db.insertMatch(1, 1, 2, disciplineId = 1, groupId = 1, matchTypeId = 1)
        db.insertMatch(2, 1, 3, disciplineId = 1, groupId = 1, matchTypeId = 1)
        db.insertMatch(3, 100001, 100002, disciplineId = 2, matchTypeId = 1)
        db.insertTables(1L..3L)
    }

    /**
     * One match in every state, assigned and called at the fixed test time:
     *
     * | match | sides                              | discipline       | state                          |
     * |-------|------------------------------------|------------------|--------------------------------|
     * | 1     | players 1 vs 2                     | 1 Herren         | Open                           |
     * | 2     | players 3 vs 4                     | 1 Herren         | OnTable 1, first call          |
     * | 3     | players 5 vs 6                     | 1 Herren         | Completed 3:1                  |
     * | 4     | double 1 (1, 2) vs double 2 (3, 4) | 2 Herren doubles | OnTable 2, second call (3, 4)  |
     * | 5     | players 1 vs 3                     | 1 Herren         | InQueue                        |
     * | 6     | players 5 vs 6                     | 1 Herren         | Started on table 3, third call (6) |
     * | 7     | players 7 vs 8                     | 1 Herren         | Open, the only playable match  |
     *
     * The calls in brackets are the players called again; all others had their first call only, and no call
     * request waits. Matches 1-3 and 5-7 are "Gruppenspiel" of group A, match 4 is a "Finale". Discipline 3 ("Senioren") is
     * inactive and has no matches. Players 1 and 3 play for club 1. Tables 1 to 4 exist; table 4 is free.
     */
    fun givenMatchesInEveryState() {
        db.insertDiscipline(1, "Herren")
        db.insertDiscipline(2, "Herren", kind = 2)
        db.insertDiscipline(3, "Senioren", active = false)
        db.insertMatchType(1, "Gruppenspiel")
        db.insertMatchType(2, "Finale")
        db.insertGroup(1, "A", disciplineId = 1)
        db.insertClub(1, "TTV Musterstadt")
        (1L..8L).forEach {
            db.insertPlayer(it, "First$it", "Last$it", ttr = 1400 + it.toInt() * 10, clubId = 1L.takeIf { _ -> it == 1L || it == 3L })
        }
        db.insertDouble(1, player1Id = 1, player2Id = 2, disciplineId = 2)
        db.insertDouble(2, player1Id = 3, player2Id = 4, disciplineId = 2)
        db.insertTables(1L..4L)

        db.insertMatch(1, 1, 2, disciplineId = 1, groupId = 1, matchTypeId = 1)
        db.insertMatch(2, 3, 4, disciplineId = 1, groupId = 1, matchTypeId = 1)
        db.insertMatch(
            3, 5, 6, disciplineId = 1, groupId = 1, matchTypeId = 1,
            result = MatchResult(sets1 = 3, sets2 = 1, balls1 = 42, balls2 = 32, resultRaw = "11=5,11=7,9=11,11=9")
        )
        db.insertMatch(4, 100001, 100002, disciplineId = 2, matchTypeId = 2, roundNumber = 3)
        db.insertMatch(5, 1, 3, disciplineId = 1, groupId = 1, matchTypeId = 1)
        db.insertMatch(6, 5, 6, disciplineId = 1, groupId = 1, matchTypeId = 1)
        db.insertMatch(7, 7, 8, disciplineId = 1, groupId = 1, matchTypeId = 1)

        matchService.assignMatch(2, 1)
        matchService.callMatches(listOf(2))

        matchService.assignMatch(4, 2)
        matchService.callMatches(listOf(4))
        matchService.requestCall(4, listOf(3, 4))
        matchService.announceRequestedCalls(listOf(4))

        matchService.assignMatch(6, 3)
        matchService.callMatches(listOf(6))
        repeat(2) {
            matchService.requestCall(6, listOf(6))
            matchService.announceRequestedCalls(listOf(6))
        }
        matchService.startMatch(6, 3)

        matchListService.addMatchToList(listOf(5), asGroup = null, position = 0)
        // the scenario's assignments are not what the tests are about
        printer.reset()
    }

    /**
     * A knockout bracket (group 999) as mktt numbers it, `round * 1000 + position`:
     *
     * | match | nr   | match type        | sides                              | discipline         |
     * |-------|------|-------------------|------------------------------------|--------------------|
     * | 11    | 3001 | 3 Viertelfinale   | players 1 vs 2                     | 1 Herren           |
     * | 12    | 3002 | 3 Viertelfinale   | players 3 vs 4                     | 1 Herren           |
     * | 13    | 2001 | 2 Halbfinale      | both empty                         | 1 Herren           |
     * | 14    | 1001 | 1 Finale          | players 5 vs 6                     | 1 Herren           |
     * | 21    | 2002 | 2 Halbfinale      | double 1 (1, 2) vs double 2 (3, 4) | 2 Herren doubles   |
     * | 22    | 1001 | 1 Finale          | double 3 (5, 6) vs empty           | 2 Herren doubles   |
     *
     * The winners of 11 and 12 meet in 13 (Side 1 and Side 2), the winner of 21 is Side 2 of 22. Match 14
     * stands for the final, from which nothing moves on. Tables 1 and 2 exist.
     */
    fun givenKnockoutBracket() {
        db.insertDiscipline(1, "Herren")
        db.insertDiscipline(2, "Herren", kind = 2)
        db.insertMatchType(1, "Finale")
        db.insertMatchType(2, "Halbfinale")
        db.insertMatchType(3, "Viertelfinale")
        (1L..6L).forEach { db.insertPlayer(it, "First$it", "Last$it") }
        db.insertDouble(1, player1Id = 1, player2Id = 2, disciplineId = 2)
        db.insertDouble(2, player1Id = 3, player2Id = 4, disciplineId = 2)
        db.insertDouble(3, player1Id = 5, player2Id = 6, disciplineId = 2)
        db.insertMatch(11, 1, 2, disciplineId = 1, groupId = KO, matchTypeId = 3, nr = 3001)
        db.insertMatch(12, 3, 4, disciplineId = 1, groupId = KO, matchTypeId = 3, nr = 3002)
        db.insertMatch(13, null, null, disciplineId = 1, groupId = KO, matchTypeId = 2, nr = 2001)
        db.insertMatch(14, 5, 6, disciplineId = 1, groupId = KO, matchTypeId = 1, nr = 1001)
        db.insertMatch(21, 100001, 100002, disciplineId = 2, groupId = KO, matchTypeId = 2, nr = 2002)
        db.insertMatch(22, 100003, null, disciplineId = 2, groupId = KO, matchTypeId = 1, nr = 1001)
        db.insertTables(1L..2L)
    }

    /**
     * Tables 1 to 12 (table manager 1 has 1-5, manager 2 has 6, 7, 8, 11, 12); table 2 holds match 1 (players 1
     * vs 2 of discipline 1), so the free tables are 1 and 3 to 12.
     */
    fun givenTwelveTables() {
        db.insertTables(1L..12L)
        db.insertDiscipline(1, "Herren")
        db.insertPlayer(1, "Jane", "Doe")
        db.insertPlayer(2, "John", "Roe")
        db.insertMatch(1, 1, 2, disciplineId = 1, tableId = 2)
    }

    private companion object {
        /** mktt's group id of the knockout stage. */
        const val KO = 999L
    }
}
