package scheduler

import javax.inject.{Inject, Singleton}

import akka.actor.Actor

import scala.concurrent.ExecutionContext

/**
  * Created by jonas on 04.11.16.
  */
@Singleton
class CheckDatabaseActor @Inject()()(implicit ec: ExecutionContext) extends Actor {
  override def receive: Receive = {
    case _ =>
    // your job here
  }
}
