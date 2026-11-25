package de.ttt.management.tournament.domain
import java.util.*
interface TournamentMatchRepository {
    fun findAll(): List<TournamentMatch>
    fun findById(id: Long): Optional<TournamentMatch>
    fun findByTypeId(typeId: Long): List<TournamentMatch>
    fun findOpen(): List<TournamentMatch>
    fun findOpenByTypeId(typeId: Long): List<TournamentMatch>
    fun findPlayed(): List<TournamentMatch>
    fun findPlayedByTypeId(typeId: Long): List<TournamentMatch>
    /** The matches at a table, not completed, whose first Call is not announced yet. */
    fun findWaitingForFirstCall(): List<TournamentMatch>

    /** The matches at a table, not completed, with a requested call waiting to be announced. */
    fun findWithRequestedCall(): List<TournamentMatch>
    fun findByTableIds(tableIds: Collection<Long>): List<TournamentMatch>
    fun findTableIdsInUse(): Set<Long>

    /** The match numbered [nr] in discipline [typeId] (the first by id if mktt numbered several alike). */
    fun findByTypeIdAndNr(typeId: Long, nr: Int): TournamentMatch?

    /**
     * The disciplines of the open matches, other than [excludedMatchIds], in which one of [playerIds]
     * plays, alone or in a double.
     */
    fun findOpenTypeIdsOfPlayers(playerIds: Collection<Long>, excludedMatchIds: Collection<Long>): Set<Long>
    /**
     * Persists the lifecycle state the match holds (table, playing/played flags, walkover,
     * queue flag, start time, winner, result and the calls). Returns the number of updated
     * match rows, `0` if the match does not exist.
     */
    fun save(match: TournamentMatch): Int
    /**
     * Writes the two Sides (`matc_play1_id`, `matc_play2_id`) of a knockout match a winner moved on into.
     * Returns the number of updated rows, `0` if the match does not exist.
     */
    fun saveSides(match: TournamentMatch): Int
    fun deleteById(id: Long): Int
    fun deleteByTypeId(typeId: Long): Int
}
