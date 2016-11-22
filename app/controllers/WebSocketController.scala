package controllers

import javax.inject.Inject

import akka.actor.ActorSystem
import akka.stream.Materializer
import play.api.Logger
import play.api.libs.streams.ActorFlow
import play.api.libs.ws.WSClient
import play.api.mvc.WebSocket
import websocket.WebSocketActor

/**
  * Created by jonas on 20.11.16.
  */
class WebSocketController @Inject() (implicit system: ActorSystem, materializer: Materializer) {
  Logger.info("Websocket!!!")

  def socket = WebSocket.accept[String, String] { request =>
    Logger.info("websocket request")
    ActorFlow.actorRef(out => WebSocketActor.props(out))
  }
}
