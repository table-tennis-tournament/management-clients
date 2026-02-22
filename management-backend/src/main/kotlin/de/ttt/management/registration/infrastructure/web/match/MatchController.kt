package de.ttt.management.registration.infrastructure.web.match

import de.ttt.management.match.Match
import de.ttt.management.match.MatchService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/matches")
class MatchController(private val matchService: MatchService) {

    @GetMapping
    fun getAllMatches(): List<Match> = matchService.getAllMatches()

    @GetMapping("/{id}")
    fun getMatch(@PathVariable id: Long): Match? = matchService.getMatch(id)

    @GetMapping("/open")
    fun getOpenMatches(): List<Match> = matchService.getOpenMatches()

    @PostMapping("/{id}/result")
    fun setResult(
        @PathVariable id: Long,
        @RequestBody resultRequest: ResultRequest
    ): Map<String, Any> {
        val success = matchService.setResult(
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
