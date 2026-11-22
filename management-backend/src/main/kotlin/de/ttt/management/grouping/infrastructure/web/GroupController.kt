package de.ttt.management.grouping.infrastructure.web

import de.ttt.management.grouping.application.GroupStandings
import de.ttt.management.grouping.application.GroupingService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/groups")
@Tag(name = "Groups", description = "The groups of a discipline and their standings")
class GroupController(private val groupingService: GroupingService) {

    @GetMapping("/standings/{typeId}")
    @Operation(
        summary = "Group standings of a discipline",
        description = "The standings of every group of the discipline, each group ordered by place. They are " +
            "updated after every result change; a side not ranked yet has place 0 and comes last."
    )
    fun getStandings(@Parameter(description = "ID of the discipline") @PathVariable typeId: Long): List<GroupStandings> =
        groupingService.getStandings(typeId)
}
