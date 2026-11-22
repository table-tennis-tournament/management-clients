package de.ttt.management

import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Import
import org.springframework.jdbc.core.JdbcTemplate

/**
 * Registers [DatabaseHelper] for integration tests, together with the fixed clock and the
 * sequential UUIDs of [DeterministicTestConfiguration]. Import it with
 * `@Import(DatabaseHelperConfiguration::class)` and inject the helper.
 */
@TestConfiguration(proxyBeanMethods = false)
@Import(DeterministicTestConfiguration::class)
class DatabaseHelperConfiguration {

    @Bean
    fun databaseHelper(jdbcTemplate: JdbcTemplate, idGenerator: SequentialIdGenerator) =
        DatabaseHelper(jdbcTemplate, idGenerator)
}

/**
 * Gives every integration test a known database: [clean] empties all tables (and restarts
 * their id sequences), the `insert…` methods add exactly the rows a test needs.
 *
 * All ITs share one in-memory H2 database, so each test calls [clean] in its `@BeforeEach`
 * and must not rely on rows written by another test.
 */
class DatabaseHelper(
    /** For tests that check rows the API does not show. */
    val jdbc: JdbcTemplate,
    private val idGenerator: SequentialIdGenerator
) {

    /**
     * Deletes every row of every table except Flyway's history and restarts the id sequences,
     * including the generated UUIDs.
     */
    fun clean() {
        val tables = jdbc.queryForList(
            """
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = CURRENT_SCHEMA AND table_type = 'BASE TABLE'
              AND LOWER(table_name) <> 'flyway_schema_history'
            """.trimIndent(),
            String::class.java
        )
        tables.forEach { jdbc.execute("TRUNCATE TABLE `$it` RESTART IDENTITY") }
        idGenerator.reset()
    }

    // --- registration ----------------------------------------------------------

    fun insertClub(id: Long, name: String) {
        jdbc.update("INSERT INTO club (club_id, club_name) VALUES (?, ?)", id, name)
    }

    /** A discipline (`type`). [kind] 1 is singles, 2 is doubles. */
    fun insertDiscipline(id: Long, name: String, kind: Int = 1, active: Boolean = true) {
        jdbc.update(
            "INSERT INTO type (type_id, type_name, type_kind, type_active) VALUES (?, ?, ?, ?)",
            id, name, kind, if (active) 1 else 0
        )
    }

    fun insertPlayer(
        id: Long,
        firstName: String,
        lastName: String,
        ttr: Int? = null,
        sex: String? = null,
        clubId: Long? = null,
        paid: Boolean = false
    ) {
        jdbc.update(
            """
            INSERT INTO player (play_id, play_firstname, play_lastname, play_ttr, play_sex, play_club_id, play_paid)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """.trimIndent(),
            id, firstName, lastName, ttr, sex, clubId, if (paid) 1 else 0
        )
    }

    /** Registers [playerId] for [disciplineId] (`typeperplayer`). */
    fun insertRegistration(id: Long, playerId: Long, disciplineId: Long, paid: Boolean = false) {
        jdbc.update(
            "INSERT INTO typeperplayer (typl_id, typl_play_id, typl_type_id, typl_seed, typl_paid) VALUES (?, ?, ?, 0, ?)",
            id, playerId, disciplineId, if (paid) 1 else 0
        )
    }

    /** A doubles team. Matches reference it as side id `100000 + id`. */
    fun insertDouble(id: Long, player1Id: Long, player2Id: Long, disciplineId: Long) {
        jdbc.update(
            """
            INSERT INTO doubles (doub_id, doub_play1_id, doub_play2_id, doub_type_id, doub_kind, doub_paid,
                                 doub_play1_name, doub_play2_name, doub_play1_firstname, doub_play2_firstname)
            VALUES (?, ?, ?, ?, 2, 0, '', '', '', '')
            """.trimIndent(),
            id, player1Id, player2Id, disciplineId
        )
    }

    fun insertDisciplineColor(disciplineId: Long, bgColor: String, textColor: String) {
        jdbc.update(
            "INSERT INTO mgmt_type_display (tydi_type_id, tydi_bg_color, tydi_text_color) VALUES (?, ?, ?)",
            disciplineId, bgColor, textColor
        )
    }

    fun insertDisciplineShortName(disciplineId: Long, shortName: String) {
        // the discipline may have its colors already: they share the row
        if (jdbc.update("UPDATE mgmt_type_display SET tydi_short_name = ? WHERE tydi_type_id = ?", shortName, disciplineId) == 0) {
            jdbc.update("INSERT INTO mgmt_type_display (tydi_type_id, tydi_short_name) VALUES (?, ?)", disciplineId, shortName)
        }
    }

    // --- tournament --------------------------------------------------------------

    /** A table; its [name] is the table number shown to the users. */
    fun insertTable(id: Long, name: String = id.toString()) {
        jdbc.update("INSERT INTO tables (tabl_id, tabl_name) VALUES (?, ?)", id, name)
    }

    /** Tables with ids and numbers [ids]. */
    fun insertTables(ids: LongRange) = ids.forEach { insertTable(it) }

    fun lockTable(tableId: Long) {
        jdbc.update("INSERT INTO mgmt_table_lock (tabl_id, locked) VALUES (?, 1)", tableId)
    }

    /** A match type (stage), e.g. "Gruppenspiel" or "Finale". */
    fun insertMatchType(id: Long, name: String) {
        jdbc.update("INSERT INTO matchtype (maty_id, maty_name) VALUES (?, ?)", id, name)
    }

    /** A group; [qualifyingPlaces] is mktt's `Grou_QualPos`, how many of its places go through. */
    fun insertGroup(id: Long, name: String, disciplineId: Long, qualifyingPlaces: String? = "2") {
        jdbc.update(
            "INSERT INTO playgroups (grou_id, grou_name, grou_type_id, grou_qualpos) VALUES (?, ?, ?, ?)",
            id, name, disciplineId, qualifyingPlaces
        )
    }

    /**
     * A match between side [player1Id] and side [player2Id] (player ids, or `100000 + double id`).
     * By default the match is open: not played, not playing, on no table, not queued.
     */
    fun insertMatch(
        id: Long,
        player1Id: Long?,
        player2Id: Long?,
        disciplineId: Long?,
        groupId: Long? = null,
        matchTypeId: Long? = null,
        nr: Int = id.toInt(),
        roundNumber: Int = 1,
        tableId: Long? = null,
        result: MatchResult? = null
    ) {
        jdbc.update(
            """
            INSERT INTO matches (matc_id, matc_play1_id, matc_play2_id, matc_type_id, matc_grou_id, matc_maty_id,
                                 matc_nr, matc_roundnumber, matc_tabl_id, matc_tabl2_id, matc_isplaying, matc_played,
                                 matc_sets1, matc_sets2, matc_balls1, matc_balls2, matc_result, matc_resultraw, matc_winner_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?, ?, ?, ?, ?, ?)
            """.trimIndent(),
            id, player1Id, player2Id, disciplineId, groupId, matchTypeId, nr, roundNumber, tableId,
            if (result != null) 1 else 0,
            result?.sets1 ?: 0, result?.sets2 ?: 0, result?.balls1 ?: 0, result?.balls2 ?: 0,
            result?.let { "${it.sets1} : ${it.sets2}" }, result?.resultRaw,
            result?.let { if (it.sets1 > it.sets2) player1Id else player2Id }
        )
    }

    /** The final result of a played match, see [insertMatch]. */
    data class MatchResult(val sets1: Int, val sets2: Int, val balls1: Int, val balls2: Int, val resultRaw: String? = null)

    /**
     * The smallest playable tournament: singles discipline 1 ("Herren"), players 1 and 2,
     * the open match 1 (player 1 vs 2) and table 1.
     */
    fun insertSingleOpenMatch() {
        insertDiscipline(1, "Herren")
        insertPlayer(1, "Jane", "Doe")
        insertPlayer(2, "John", "Roe")
        insertMatch(1, 1, 2, disciplineId = 1)
        insertTable(1)
    }

    // --- grouping ----------------------------------------------------------------

    /** A player's standing in a group; [position] 0 is not computed yet. */
    fun insertPlayerPerGroup(id: Long, playerId: Long, groupId: Long, position: Int = 0) {
        jdbc.update(
            """
            INSERT INTO playerpergroup (ppgr_id, ppgr_play_id, ppgr_grou_id, ppgr_position, ppgr_gamesw, ppgr_gamesl,
                                        ppgr_setw, ppgr_setl, ppgr_pointsw, ppgr_pointsl, ppgr_checked, ppgr_setdiff)
            VALUES (?, ?, ?, ?, 0, 0, 0, 0, 0, 0, 0, 0)
            """.trimIndent(),
            id, playerId, groupId, position
        )
    }
}
