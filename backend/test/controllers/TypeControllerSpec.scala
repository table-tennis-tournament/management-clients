package controllers

import org.specs2.mutable.Specification
import play.api.test._
import play.api.test.Helpers._
import play.api.inject.guice.GuiceApplicationBuilder
import play.api.Application
import play.api.db.evolutions.Evolutions
import play.api.db.Database
import play.api.Mode
import play.api.libs.json._
import play.api.Configuration
import com.typesafe.config.ConfigFactory

class TypeControllerSpec extends Specification {

  // Helper to load the specific test configuration file
  def appWithTestConfig: Application = {
    // Build app with test configuration only
    GuiceApplicationBuilder()
      .in(Mode.Test)
      .loadConfig(env => {
        // Load only the test configuration, not the main application.conf
        val testConfig = ConfigFactory.parseResources("application.test.conf")
        Configuration(testConfig.resolve())
      })
      .build()
  }

  "TypeController" should {
    "return all types" in new WithApplication(appWithTestConfig) {

      val database = app.injector.instanceOf[Database]

      // Initialize database with test data
      Evolutions.applyEvolutions(database)

      try {
        database.withConnection { conn =>
          val statement = conn.createStatement()
          statement.execute("""
            INSERT INTO type (Type_Name, Type_Kind, Type_Active) VALUES
            ('Herren Einzel', 1, 1),
            ('Damen Einzel', 1, 1);
          """)
        }

        // When
        val response = route(app, FakeRequest(GET, "/api/types/all")).get

        // Then
        status(response) must equalTo(OK)
        contentType(response) must beSome("application/json")

        val json = contentAsJson(response)
        json.as[JsArray].value.length must equalTo(2)

        val types = json.as[Seq[JsObject]]
        val typeNames = types.map(t => (t \ "name").as[String])
        typeNames must contain("Herren Einzel")
        typeNames must contain("Damen Einzel")

        val herrenEinzel = types.find(t => (t \ "name").as[String] == "Herren Einzel").get
        (herrenEinzel \ "active").as[Boolean] must beTrue
        (herrenEinzel \ "kind").as[Int] must equalTo(1)
        (herrenEinzel \ "id").as[Long] must beGreaterThan(0L)

      } finally {
        Evolutions.cleanupEvolutions(database)
      }
    }
  }
}