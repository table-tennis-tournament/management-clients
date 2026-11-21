package de.ttt.management

import org.skyscreamer.jsonassert.JSONAssert
import org.skyscreamer.jsonassert.JSONCompareMode
import org.skyscreamer.jsonassert.Customization
import org.skyscreamer.jsonassert.comparator.CustomComparator
import org.springframework.test.web.servlet.client.RestTestClient
import tools.jackson.databind.json.JsonMapper
import java.nio.file.Files
import java.nio.file.Path
import kotlin.test.fail

/**
 * Compares JSON documents completely: every field, every array element in order, no extra
 * fields (JSONAssert's STRICT mode).
 *
 * Expected documents live in `src/test/resources/expected/<name>.json`. Run the tests with
 * `-DupdateExpected=true` to (re)write the files from the actual output, then review the diff
 * before committing: a recorded file is only correct once a human has checked it.
 */
object ExpectedJson {

    private val update = System.getProperty("updateExpected").toBoolean()
    private val directory = Path.of("src/test/resources/expected")
    private val mapper = JsonMapper.builder().build()

    /** Asserts that [actual] equals the expected file [name] (without `.json`). */
    fun assertMatches(name: String, actual: String) {
        val file = directory.resolve("$name.json")
        if (update) {
            Files.createDirectories(file.parent)
            Files.writeString(file, mapper.writerWithDefaultPrettyPrinter().writeValueAsString(mapper.readTree(actual)) + "\n")
            return
        }
        if (!Files.exists(file)) {
            fail("Missing expected file $file. Record it with -DupdateExpected=true and review it. Actual:\n$actual")
        }
        JSONAssert.assertEquals("$name.json", Files.readString(file), actual, JSONCompareMode.STRICT)
    }

    /** Asserts that [actual] equals the inline JSON [expected]. */
    fun assertEquals(expected: String, actual: String) {
        JSONAssert.assertEquals(expected, actual, JSONCompareMode.STRICT)
    }

    /**
     * Like [assertEquals], but the values at the paths [ignored] (e.g. `timestamp`) may differ.
     * The fields must still be present.
     */
    fun assertEqualsIgnoring(expected: String, actual: String, vararg ignored: String) {
        val comparator = CustomComparator(
            JSONCompareMode.STRICT,
            *ignored.map { Customization(it) { _, _ -> true } }.toTypedArray()
        )
        JSONAssert.assertEquals(expected, actual, comparator)
    }
}

/** Asserts that the response body equals the expected file [name], see [ExpectedJson]. */
fun RestTestClient.ResponseSpec.expectJson(name: String) =
    ExpectedJson.assertMatches(name, body())

/** Asserts that the response body equals [json] exactly, e.g. `{"success": true}`. */
fun RestTestClient.ResponseSpec.expectExactJson(json: String) =
    ExpectedJson.assertEquals(json, body())

/**
 * Asserts that the response body equals [json] exactly, except for the values at [ignored], e.g. the
 * `timestamp` of Spring's default error body.
 */
fun RestTestClient.ResponseSpec.expectExactJsonIgnoring(json: String, vararg ignored: String) =
    ExpectedJson.assertEqualsIgnoring(json, body(), *ignored)

private fun RestTestClient.ResponseSpec.body(): String =
    String(expectBody().returnResult().responseBody ?: ByteArray(0), Charsets.UTF_8)
