package scheduler

import akka.actor.ActorSystem
import javax.inject.Inject
import play.api.Configuration

import scala.concurrent.ExecutionContext

/**
  * Created by jonas on 06.11.16.
  */
class Scheduler @Inject() (val system: ActorSystem, configuration: Configuration)(implicit ec: ExecutionContext) {
  //val frequency = configuration.getInt("frequency").get
//  var actor = system.scheduler.schedule(
//    1 seconds, 1 seconds, checkDatabaseActor, "update")
}
