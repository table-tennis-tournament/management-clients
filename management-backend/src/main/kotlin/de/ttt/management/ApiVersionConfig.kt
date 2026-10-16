package de.ttt.management

import org.springframework.context.annotation.Configuration
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

/**
 * Prefixes every REST controller with `/api/v2`, keeping the legacy backend (v1, under `/api`)
 * and this backend (v2) runnable in parallel behind a version-switching router.
 */
@Configuration
class ApiVersionConfig : WebMvcConfigurer {

    override fun configurePathMatch(configurer: PathMatchConfigurer) {
        configurer.addPathPrefix("/api/v2") { handlerType ->
            handlerType.isAnnotationPresent(RestController::class.java)
        }
    }
}
