package de.ttt.management.managementbackend

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class ManagementBackendApplication

fun main(args: Array<String>) {
    runApplication<ManagementBackendApplication>(*args)
}
