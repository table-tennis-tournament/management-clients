package de.ttt.management.outbound.domain

interface LegacyWebSocketSender {
    fun broadcast(message: String)
}
