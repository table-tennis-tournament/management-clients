package de.ttt.management.tournament

/**
 * Read model for the runtime auto-start flag, exposed on the module API so the
 * settings module can surface it without depending on the tournament internals.
 */
interface AutoStartState {
    fun isAutoStartActive(): Boolean
}
