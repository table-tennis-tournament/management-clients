package modules

import javax.inject.{Inject, Provider, Singleton}
import org.apache.pekko.actor.ActorSystem
import play.api.Configuration
import play.api.Environment
import play.api.inject.ApplicationLifecycle

import scala.concurrent.Future

@Singleton
class PekkoActorSystemProvider @Inject() (
    environment: Environment,
    configuration: Configuration,
    applicationLifecycle: ApplicationLifecycle
) extends Provider[ActorSystem] {

  private val actorSystem = ActorSystem("application", configuration.underlying)

  applicationLifecycle.addStopHook { () =>
    Future.successful(actorSystem.terminate())
  }

  override def get(): ActorSystem = actorSystem
}
