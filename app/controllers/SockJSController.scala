package controllers

import akka.actor.ActorSystem
import akka.stream.Materializer
import akka.stream.scaladsl._
import com.google.inject.Inject
import play.api.Logger
import play.api.libs.streams.ActorFlow
import play.api.mvc.InjectedController
import play.sockjs.api.{InjectedSockJSRouter, SockJS, SockJSSettings}
import websocket.WebSocketActor

/**
  * Created by jonas on 20.11.16.
  */
class SockJSController @Inject() (implicit system: ActorSystem, materializer: Materializer) extends InjectedController with InjectedSockJSRouter  {

  override protected def settings = SockJSSettings(websocket = false)

  // to handle a SockJS request override sockjs method
  def sockjs = SockJS.accept[String, String] { request =>

    Logger.info("websocket request tables")
    ActorFlow.actorRef(out => WebSocketActor.props(out, "UpdateTable"))
  }


}
