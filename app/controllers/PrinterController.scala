package controllers

import actors.PrinterActor.{GetPrinter, Print, PrinterFound, SetPrinter}
import akka.actor.{ActorRef, ActorSystem}
import javax.inject._
import javax.swing.JEditorPane

import actors.PrinterActor
import play.api.Logger
import play.api.libs.json._
import play.api.mvc._
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import akka.pattern.ask
import akka.util.Timeout
import models.Answer

import scala.concurrent.duration._
import scala.concurrent.{Await, Future}
import scala.util.{Failure, Success, Try}
import scala.concurrent.duration._

class PrinterController @Inject() (@Named("printer_actor") printerActor: ActorRef) extends Controller{
  implicit val timeout: Timeout = 5.seconds
  import models.AnswerModel._

  def print(id: Long) = Action {
    printerActor ! Print(id.toString)
    Ok(Json.toJson(Answer(true, "printing")))
  }

  def allPrinter = Action.async {
    (printerActor ? GetPrinter).mapTo[Seq[String]].map(msg => Ok(Json.toJson(msg)))
  }

  def setPrinter(name: String) = Action.async {
    (printerActor ? SetPrinter(name)).mapTo[PrinterActor.Answer].map { res =>
      res match {
        case PrinterFound => Ok(Json.toJson(Answer(true, "Printer found")))
        case _ => BadRequest(Json.toJson(Answer(false, "Printer not found")))
      }
    }
  }

}