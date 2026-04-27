package de.ttt.management.infrastructure.openapi

import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.info.Contact
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class OpenApiConfig {

    @Bean
    fun customOpenAPI(): OpenAPI {
        return OpenAPI()
            .info(
                Info()
                    .title("Management Backend API")
                    .version("0.0.1")
                    .description("Comprehensive documentation for the Management Backend Spring Boot project.")
                    .contact(
                        Contact()
                            .name("TTT Team")
                    )
            )
    }
}
