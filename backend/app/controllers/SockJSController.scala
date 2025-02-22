package controllers

import org.apache.pekko.actor.ActorSystem
import org.apache.pekko.stream.Materializer
import org.apache.pekko.stream.scaladsl._
import org.apache.pekko.stream.OverflowStrategy
import com.google.inject.Inject
import org.slf4j.LoggerFactory
import play.api.mvc.InjectedController
import play.sockjs.api.{InjectedSockJSRouter, SockJS, SockJSSettings}
import websocket.WebSocketActor

class SockJSController @Inject() (implicit system: ActorSystem, materializer: Materializer) 
    extends InjectedController with InjectedSockJSRouter {

  override protected def settings = SockJSSettings(websocket = false)

  val log = LoggerFactory.getLogger("sockJSControllerLogger")

  // to handle a SockJS request override sockjs method
  def sockjs = SockJS.accept[String, String] { request =>
    log.info("websocket request tables")
    
    val (actorRef, publisher) = Source.actorRef[String](
      completionMatcher = PartialFunction.empty,
      failureMatcher = PartialFunction.empty,
      bufferSize = 16,
      overflowStrategy = OverflowStrategy.fail
    ).preMaterialize()

    system.actorOf(WebSocketActor.props(actorRef, "UpdateTable"))

    Flow.fromSinkAndSource(
      Sink.ignore,
      publisher
    )
  }
}
