package de.ttt.management.tournament.domain

data class TournamentDiscipline(
    var id: Long? = null,
    var name: String? = null,
    var kind: Int = 0,
    var active: Boolean = true
) {
    companion object {
        /** mktt's kind of a doubles discipline. */
        const val DOUBLES = 2

        /**
         * A discipline as mktt stores it. mktt names a singles discipline and its doubles discipline
         * alike ("Herren"), so the doubles one is named "Herren-Doppel" everywhere it is shown.
         */
        fun fromStored(id: Long?, storedName: String?, kind: Int, active: Boolean) = TournamentDiscipline(
            id = id,
            name = if (kind == DOUBLES) storedName?.plus("-Doppel") else storedName,
            kind = kind,
            active = active
        )
    }
}
