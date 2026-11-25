package de.ttt.management.outbound.domain

interface WebSocketSender {
    fun send(destination: String, payload: Any)
}
