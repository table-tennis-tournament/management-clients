package de.ttt.management

import org.springframework.context.annotation.Configuration
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

/**
 * Prefixes the application's REST controllers with `/api/v2`. Library controllers such as springdoc's
 * (`/v3/api-docs`, used by the Swagger UI at `/api-docs-ui`) keep their own paths.
 */
@Configuration
class ApiVersionConfig : WebMvcConfigurer {

    override fun configurePathMatch(configurer: PathMatchConfigurer) {
        configurer.addPathPrefix("/api/v2") { handlerType ->
            handlerType.isAnnotationPresent(RestController::class.java) &&
                handlerType.packageName.startsWith(ManagementBackendApplication::class.java.packageName)
        }
    }
}
