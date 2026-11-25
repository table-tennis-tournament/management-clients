package de.ttt.management.registration

/**
 * Published when the payment state of a player registration changes.
 */
data class PlayerPaid(
    val registrationId: Long,
    val paid: Boolean
)
