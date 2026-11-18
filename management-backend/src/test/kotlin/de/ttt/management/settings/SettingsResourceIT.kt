package de.ttt.management.settings

import de.ttt.management.ResourceIT
import de.ttt.management.expectExactJson
import org.junit.jupiter.api.Test

/** `/api/v2/settings`: the runtime settings the admin view shows. */
class SettingsResourceIT : ResourceIT() {

    @Test
    fun `the default settings`() {
        get("/settings/all").expectStatus().isOk.expectExactJson(
            """[
                {"key": "printerName", "value": ""},
                {"key": "alwaysPrint", "value": true},
                {"key": "autoStart", "value": false}
            ]"""
        )
    }

    @Test
    fun `the settings after changing all of them`() {
        post("/printer/set/Office").expectStatus().isOk
        post("/printer/setprintonstart/false").expectStatus().isOk
        post("/matchlist/active/true").expectStatus().isOk

        get("/settings/all").expectStatus().isOk.expectExactJson(
            """[
                {"key": "printerName", "value": "Office"},
                {"key": "alwaysPrint", "value": false},
                {"key": "autoStart", "value": true}
            ]"""
        )
    }
}
