package de.ttt.management

import com.tngtech.archunit.base.DescribedPredicate
import com.tngtech.archunit.core.domain.JavaClass
import com.tngtech.archunit.core.importer.ImportOption
import com.tngtech.archunit.junit.AnalyzeClasses
import com.tngtech.archunit.junit.ArchTest
import com.tngtech.archunit.lang.ArchRule
import com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes
import com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses

/**
 * Enforces the onion architecture within every Spring Modulith module:
 *
 *   infrastructure  ->  application  ->  domain
 *
 * - the domain layer must not depend on application or infrastructure (and stays framework-free)
 * - the application layer must not depend on infrastructure
 * - repository ports (interfaces) live in the domain layer
 * - repository adapters (Jdbc* implementations) live in infrastructure.database
 */
@AnalyzeClasses(
    packages = ["de.ttt.management"],
    importOptions = [
        ImportOption.DoNotIncludeTests::class,
        ImportOption.DoNotIncludeJars::class
    ]
)
class OnionArchitectureTests {

    @ArchTest
    val domainMustNotDependOnApplicationOrInfrastructure: ArchRule =
        noClasses().that().resideInAPackage("..domain..")
            .should().dependOnClassesThat().resideInAnyPackage("..application..", "..infrastructure..")

    @ArchTest
    val domainMustBeFrameworkFree: ArchRule =
        noClasses().that().resideInAPackage("..domain..")
            .should().dependOnClassesThat().resideInAPackage("org.springframework..")

    @ArchTest
    val applicationMustNotDependOnInfrastructure: ArchRule =
        noClasses().that().resideInAPackage("..application..")
            .should().dependOnClassesThat().resideInAPackage("..infrastructure..")

    @ArchTest
    val repositoryPortsLiveInDomain: ArchRule =
        classes().that(repositoryInterfaces())
            .should().resideInAPackage("..domain..")

    @ArchTest
    val repositoryAdaptersLiveInInfrastructureDatabase: ArchRule =
        classes().that(jdbcAdapters())
            .should().resideInAPackage("..infrastructure.database..")

    private fun repositoryInterfaces(): DescribedPredicate<JavaClass> =
        DescribedPredicate.describe("interface whose simple name ends with 'Repository'") {
            it.isInterface && it.simpleName.endsWith("Repository")
        }

    private fun jdbcAdapters(): DescribedPredicate<JavaClass> =
        DescribedPredicate.describe("class whose simple name starts with 'Jdbc'") {
            !it.isInterface && it.simpleName.startsWith("Jdbc")
        }
}
