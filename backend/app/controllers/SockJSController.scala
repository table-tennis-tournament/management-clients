package controllers

import org.apache.pekko.actor.ActorSystem
import org.apache.pekko.stream.Materializer
import org.apache.pekko.stream.scaladsl._
import com.google.inject.Inject
import org.slf4j.LoggerFactory
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

  val log = LoggerFactory.getLogger("sockJSControllerLogger")

  // to handle a SockJS request override sockjs method
  def sockjs = SockJS.accept[String, String] { request =>

    log.info("websocket request tables")
    ActorFlow.actorRef(out => WebSocketActor.props(out, "UpdateTable"))
  }


}
