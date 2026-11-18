package de.ttt.management.tournament

import de.ttt.management.ResourceIT
import de.ttt.management.expectExactJson
import org.junit.jupiter.api.Test

/** `/api/v2/testsocket`: kept for the legacy clients. */
class TestSocketResourceIT : ResourceIT() {

    @Test
    fun `answers success and sends nothing`() {
        get("/testsocket").expectStatus().isOk.expectExactJson("""{"success": true}""")
    }
}
