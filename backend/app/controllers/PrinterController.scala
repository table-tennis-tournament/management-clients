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
import dao.Tables
import models.Answer

import scala.concurrent.duration._
import scala.concurrent.{Await, Future}
import scala.util.{Failure, Success, Try}
import scala.concurrent.duration._

class PrinterController @Inject() (@Named("printer_actor") printerActor: ActorRef, tables: Tables) extends Controller{
  implicit val timeout: Timeout = 5.seconds
  import models.AnswerModel._

  def print(id: Long) = Action {
    tables.getMatch(id) match {
      case Some(ttMatch) => tables.getAllMatchInfo(ttMatch) match {
        case Some(allMatchInfo) =>
          printerActor ! Print(allMatchInfo)
          Ok(Json.toJson(Answer(true, "printing")))
        case _ => BadRequest(Json.toJson(Answer(false, "AllMatchInfo not found")))
      }
      case _ => BadRequest(Json.toJson(Answer(false, "Match not found")))
    }
  }

  def allPrinter = Action.async {
    (printerActor ? GetPrinter).mapTo[Seq[String]].map(msg => Ok(Json.toJson(msg)))
  }

  def setPrinter(name: String) = Action.async {
    (printerActor ? SetPrinter(name)).mapTo[PrinterActor.PrinterAnswer].map { res =>
      res match {
        case PrinterFound => Ok(Json.toJson(Answer(true, "Printer found")))
        case _ => BadRequest(Json.toJson(Answer(false, "Printer not found")))
      }
    }
  }

}