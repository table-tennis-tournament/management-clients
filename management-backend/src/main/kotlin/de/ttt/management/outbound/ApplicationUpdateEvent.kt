package de.ttt.management.outbound

data class ApplicationUpdateEvent(
    val type: String,
    val payload: Any
)
