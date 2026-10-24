package de.ttt.management.tournament.domain

/**
 * The points scored by each side in a single set. A set is won by the first side
 * to reach eleven points; from 10:10 a lead of two points is required (deuce).
 * An undecided set (0:0, used while a match is being entered) carries no winner.
 */
data class SetResult(
    val pointsPlayer1: Int,
    val pointsPlayer2: Int
) {
    init {
        require(pointsPlayer1 >= 0 && pointsPlayer2 >= 0) { "Points must not be negative" }
        if (pointsPlayer1 != pointsPlayer2) {
            val winner = maxOf(pointsPlayer1, pointsPlayer2)
            val loser = minOf(pointsPlayer1, pointsPlayer2)
            require(winner >= 11) { "A set is won at eleven points" }
            require(winner - loser >= 2) { "A set must be won by a lead of two points" }
        }
    }

    companion object {
        /**
         * Parses the legacy `matc_resultraw` format, e.g. "11=5,11=7,11=3".
         */
        fun fromResultRaw(resultRaw: String?): List<SetResult> {
            if (resultRaw.isNullOrBlank()) return emptyList()
            return resultRaw.split(",")
                .map { it.trim() }
                .filter { it.isNotEmpty() }
                .map { entry ->
                    val parts = entry.split("=")
                    SetResult(parts[0].trim().toInt(), parts[1].trim().toInt())
                }
        }

        /**
         * Serializes sets to the legacy `matc_resultraw` format, e.g. "11=5,11=7,11=3".
         */
        fun toResultRaw(sets: List<SetResult>): String =
            sets.joinToString(",") { "${it.pointsPlayer1}=${it.pointsPlayer2}" }
    }
}
