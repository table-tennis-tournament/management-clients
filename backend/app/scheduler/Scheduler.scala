package scheduler

import javax.inject.{Inject, Named}

import akka.actor.{ActorRef, ActorSystem}
import play.api.Configuration

import scala.concurrent.ExecutionContext
import scala.concurrent.duration._

/**
  * Created by jonas on 06.11.16.
  */
class Scheduler @Inject() (val system: ActorSystem, @Named("scheduler-actor") val checkDatabaseActor: ActorRef, configuration: Configuration)(implicit ec: ExecutionContext) {
  //val frequency = configuration.getInt("frequency").get
  var actor = system.scheduler.schedule(
    0.microseconds, 1.seconds, checkDatabaseActor, "update")
}
