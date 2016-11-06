package actors

import akka.actor.Actor
import play.api.Logger

/**
  * Created by jonas on 04.11.16.
  */
class CheckDatabaseActor extends Actor{
  override def receive = {
    case _ => Logger.info("check database...")
  }
}
