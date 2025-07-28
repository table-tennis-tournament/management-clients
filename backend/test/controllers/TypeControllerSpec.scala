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
import java.time.LocalDateTime
import scala.concurrent.duration._

class TypeControllerSpec extends Specification {
  
  "TypeController" should {
    "return all types" in {
      // Given: A running application with test data
      val app: Application = GuiceApplicationBuilder()
        .in(Mode.Test)
        .configure(Map(
          "config.resource" -> "application.test.conf"
        ))
        .build()

      val database = app.injector.instanceOf[Database]
      
      // Initialize database with test data
      Evolutions.applyEvolutions(database)
      database.withConnection { conn =>
        val statement = conn.createStatement()
        // Insert test data
        statement.execute("""
          INSERT INTO type (Type_Name, Type_Kind, Type_Active) VALUES 
          ('Herren Einzel', 1, 1),
          ('Damen Einzel', 1, 1);
        """)
      }

      // When: We make a request to the endpoint
      val response = route(app, FakeRequest(GET, "/api/types/all")).get

      // Then: We should get a successful response with the test data
      status(response) must equalTo(OK)
      contentType(response) must beSome("application/json")
      
      val json = contentAsJson(response)
      json.as[JsArray].value.length must equalTo(2)
      
      val types = json.as[Seq[JsObject]]
      val typeNames = types.map(t => (t \ "name").as[String])
      typeNames must contain("Herren Einzel")
      typeNames must contain("Damen Einzel")
      
      // Verify additional fields that exist in the Type model
      val herrenEinzel = types.find(t => (t \ "name").as[String] == "Herren Einzel").get
      (herrenEinzel \ "active").as[Boolean] must beTrue
      (herrenEinzel \ "kind").as[Int] must equalTo(1)
      (herrenEinzel \ "id").as[Long] must beGreaterThan(0L)

      // Cleanup
      Evolutions.cleanupEvolutions(database)
      app.stop()
    }
  }
} 