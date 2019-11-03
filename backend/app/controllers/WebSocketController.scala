package controllers

import akka.actor.ActorSystem
import akka.stream.Materializer
import javax.inject.Inject
import play.api.Logger
import play.api.libs.streams.ActorFlow
import play.api.mvc.WebSocket
import websocket.WebSocketActor

/**
  * Created by jonas on 20.11.16.
  */
class WebSocketController @Inject() (implicit system: ActorSystem, materializer: Materializer) {
  Logger.info("Websocket!!!")

  def tablesSocket: WebSocket = WebSocket.accept[String, String] { _ =>
    Logger.info("websocket request tables")
    ActorFlow.actorRef(out => WebSocketActor.props(out, "UpdateTable"))
  }

  def matchesSocket: WebSocket = WebSocket.accept[String, String] { _ =>
    Logger.info("websocket request matches")
    ActorFlow.actorRef(out => WebSocketActor.props(out, "UpdateMatches"))
  }

  def matchListSocket: WebSocket = WebSocket.accept[String, String] { _ =>
    Logger.info("websocket request matches")
    ActorFlow.actorRef(out => WebSocketActor.props(out, "UpdateMatchList"))
  }
}
