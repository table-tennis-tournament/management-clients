package de.ttt.management.outbound.domain

/**
 * The functional areas on which update events are published. A client subscribes
 * only to the topics its views render (see ADR 0003).
 */
enum class Topic(val destination: String) {
    MATCHES("/topic/matches"),
    TABLES("/topic/tables"),
    QUEUE("/topic/queue"),
    PLAYERS("/topic/players"),
    SETTINGS("/topic/settings")
}
