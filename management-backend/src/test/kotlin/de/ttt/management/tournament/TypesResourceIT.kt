package de.ttt.management.tournament

import de.ttt.management.ResourceIT
import de.ttt.management.expectJson
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

/** `/api/v2/types`: the disciplines as the tournament module sees them. */
class TypesResourceIT : ResourceIT() {

    @BeforeEach
    fun setup() = givenMatchesInEveryState()

    @Test
    fun `all disciplines, doubles named with the -Doppel suffix`() {
        get("/types/all").expectStatus().isOk.expectJson("types/all")
    }

    @Test
    fun `the active disciplines`() {
        get("/types/open/all").expectStatus().isOk.expectJson("types/open-all")
    }
}
