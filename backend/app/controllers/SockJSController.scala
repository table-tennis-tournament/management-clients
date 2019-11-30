package controllers

import akka.actor.ActorSystem
import akka.stream.Materializer
import akka.stream.scaladsl._
import com.google.inject.Inject
import play.api.mvc.InjectedController
import play.sockjs.api.{InjectedSockJSRouter, SockJS, SockJSSettings}

/**
  * Created by jonas on 20.11.16.
  */
class SockJSController @Inject() (implicit system: ActorSystem, materializer: Materializer) extends InjectedController with InjectedSockJSRouter  {

  override protected def settings = SockJSSettings(websocket = false)

  // to handle a SockJS request override sockjs method
  def sockjs = SockJS.accept[String, String] { request =>

    // Log events to the console
    val in = Sink.foreach[String](println)

    // Send a single 'Hello!' message and close
    val out = Source.single("Hello SockJS!")

    Flow.fromSinkAndSource(in, out)
  }


}
