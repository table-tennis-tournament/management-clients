package de.ttt.management.registration.infrastructure.web.match

import de.ttt.management.registration.domain.match.Match
import de.ttt.management.registration.MatchService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/matches")
@Tag(name = "Match Management", description = "Operations for managing match results and retrieving match information")
class MatchController(private val matchService: MatchService) {

    @GetMapping
    @Operation(summary = "Get all matches", description = "Retrieves a list of all matches in the tournament.")
    fun getAllMatches(): List<Match> = matchService.getAllMatches()

    @GetMapping("/{id}")
    @Operation(summary = "Get match by ID", description = "Retrieves details for a specific match.")
    fun getMatch(
        @Parameter(description = "ID of the match") @PathVariable id: Long
    ): Match? = matchService.getMatch(id)

    @GetMapping("/open")
    @Operation(summary = "Get open matches", description = "Retrieves a list of matches that are currently open/not completed.")
    fun getOpenMatches(): List<Match> = matchService.getOpenMatches()

    @PostMapping("/{id}/result")
    @Operation(summary = "Set match result", description = "Saves the final result and sets for a completed match.")
    fun setResult(
        @Parameter(description = "ID of the match") @PathVariable id: Long,
        @RequestBody resultRequest: ResultRequest
    ): Map<String, Any> {
        val success = matchService.saveResult(
            id,
            resultRequest.resultRaw,
            resultRequest.sets1,
            resultRequest.sets2
        )
        return mapOf("success" to success)
    }
}

data class ResultRequest(
    val resultRaw: String,
    val sets1: Int,
    val sets2: Int
)
