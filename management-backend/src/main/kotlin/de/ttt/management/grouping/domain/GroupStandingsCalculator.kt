package de.ttt.management.grouping.domain

/**
 * Pure standings computation for a completed round-robin group.
 *
 * For each player the completed matches are tallied into matches/sets/points won and lost,
 * then the players are ranked by `matchesWon` (desc), `setsDiff` (desc), `pointsWon` (desc).
 * Mirrors the legacy `updatePlayerPerGroup`.
 */
object GroupStandingsCalculator {

    fun compute(players: List<PlayerPerGroup>, matches: List<GroupMatchResult>): List<PlayerPerGroup> {
        val completed = matches.filter { it.isPlayed }

        val scored = players.map { player ->
            var matchesWon = 0
            var matchesLost = 0
            var setsWon = 0
            var setsLost = 0
            var pointsWon = 0
            var pointsLost = 0

            for (match in completed) {
                when (player.playerId) {
                    match.player1Id -> {
                        pointsWon += match.balls1
                        pointsLost += match.balls2
                        setsWon += match.sets1
                        setsLost += match.sets2
                        if (match.sets1 > match.sets2) matchesWon++ else matchesLost++
                    }
                    match.player2Id -> {
                        pointsWon += match.balls2
                        pointsLost += match.balls1
                        setsWon += match.sets2
                        setsLost += match.sets1
                        if (match.sets2 > match.sets1) matchesWon++ else matchesLost++
                    }
                }
            }

            val playerMatches = matches.filter { player.playerId == it.player1Id || player.playerId == it.player2Id }

            player.copy(
                matchesWon = matchesWon,
                matchesLost = matchesLost,
                setsWon = setsWon,
                setsLost = setsLost,
                pointsWon = pointsWon,
                pointsLost = pointsLost,
                games = "$matchesWon : $matchesLost",
                sets = "$setsWon : $setsLost",
                points = "$pointsWon : $pointsLost",
                setsDiff = setsWon - setsLost,
                checked = playerMatches.isNotEmpty() && playerMatches.all { it.isPlayed }
            )
        }

        return scored
            .sortedWith(
                compareByDescending<PlayerPerGroup> { it.matchesWon }
                    .thenByDescending { it.setsDiff }
                    .thenByDescending { it.pointsWon }
            )
            .mapIndexed { index, player -> player.copy(position = index + 1) }
    }
}
