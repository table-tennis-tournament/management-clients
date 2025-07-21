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
          INSERT INTO type (
            Type_ID, Type_Name, Type_Active, Type_AgeFrom, Type_AgeTo, 
            Type_System, Type_groups, Type_nextmatches, Type_Sex, 
            Type_TTRFrom, Type_TTRTo, Type_Blocked
          ) VALUES 
          (1, 'Herren Einzel', 1, 18, 99, 1, 4, 2, 'M', 0, 3000, 0),
          (2, 'Damen Einzel', 1, 18, 99, 1, 4, 2, 'W', 0, 3000, 0);
        """)
      }

      // When: We make a request to the endpoint
      val response = route(app, FakeRequest(GET, "/api/types/all")).get

      // Then: We should get a successful response with the test data
      status(response) must equalTo(OK)
      contentType(response) must beSome("application/json")
      
      val json = contentAsJson(response)
      (json \ "types").as[JsArray].value.length must equalTo(2)
      
      val types = (json \ "types").as[Seq[JsObject]]
      (types.head \ "name").as[String] must equalTo("Herren Einzel")
      (types(1) \ "name").as[String] must equalTo("Damen Einzel")
      
      // Verify additional fields
      (types.head \ "active").as[Boolean] must beTrue
      (types.head \ "ageFrom").as[Int] must equalTo(18)
      (types.head \ "ageTo").as[Int] must equalTo(99)
      (types.head \ "sex").as[String] must equalTo("M")

      // Cleanup
      Evolutions.cleanupEvolutions(database)
      app.stop()
    }
  }
} 