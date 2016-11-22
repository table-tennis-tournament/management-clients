package scheduler

import javax.inject.{Inject, Singleton}

import akka.actor.Actor
import akka.contrib.pattern.DistributedPubSubMediator.Publish
import akka.contrib.pattern.{DistributedPubSubExtension, DistributedPubSubMediator}
import dao.Tables
import play.api.Logger
import websocket.WebSocketActor.{MatchesUpdated, PlayerUpdated, TablesUpdated}

import scala.concurrent.ExecutionContext

/**
  * Created by jonas on 04.11.16.
  */
@Singleton
class CheckDatabaseActor @Inject()(tables: Tables)(implicit ec: ExecutionContext) extends Actor {
  val mediator = DistributedPubSubExtension.get(context.system).mediator
  val topic = "Triggers"

  override def receive: Receive = {
    case _ =>
      tables.triggerTable map { result =>
        if(result != 0) {
          Logger.info("tables updated")
          mediator ! Publish(topic, TablesUpdated)
          tables.resetTriggerTable
        }
      }
      tables.triggerMatches map { result =>
        if(result != 0) {
          Logger.info("matches updated")
          mediator ! Publish(topic, MatchesUpdated)
          tables.resetTriggerMatches
        }
      }
      tables.triggerPlayer map { result =>
        if(result != 0) {
          Logger.info("player updated")
          mediator ! Publish(topic, PlayerUpdated)
          tables.resetTriggerPlayer
        }
      }
    // your job here
  }
}
