package de.ttt.management.tournament.domain

/**
 * The call progression of a match that has been assigned to a table.
 *
 * [None]       the match is at a table but its players have not been announced.
 * [FirstCall]  the first announcement has been made.
 * [SecondCall] the second announcement has been made.
 * [ThirdCall]  the third announcement has been made.
 */
enum class CallState(val code: Int) {
    None(0),
    FirstCall(1),
    SecondCall(2),
    ThirdCall(3);

    companion object {
        fun fromCode(code: Int?): CallState = entries.firstOrNull { it.code == code } ?: None
    }
}
