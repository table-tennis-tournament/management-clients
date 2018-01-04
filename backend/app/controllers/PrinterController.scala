package controllers

import actors.PrinterActor.{GetPrinterList, Print, PrinterFound, SetPrinter}
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
import it.innove.play.pdf.PdfGenerator
import models.{AllMatchInfo, Answer, TTMatch}

import scala.concurrent.duration._
import scala.concurrent.{Await, Future}
import scala.util.{Failure, Success, Try}
import scala.concurrent.duration._

class PrinterController @Inject() (pdfGenerator: PdfGenerator, @Named("printer_actor") printerActor: ActorRef, @Named("publisher_actor") pubActor: ActorRef, tables: Tables) extends Controller{
  implicit val timeout: Timeout = 5.seconds
  import models.AnswerModel._

  def print(id: Long) = Action {
    Logger.debug("print")
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

  def printAll = Action { request =>
    Logger.debug("print all")
    val req = request.body.asJson
    req match {
      case Some(r) => {
        r.asOpt[Seq[Long]] match {
          case Some(ids) => {
            ids map { id =>
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
            Ok(Json.toJson(Answer(true, "successful")))
          }
          case _ => BadRequest(Json.toJson(Answer(false, "wrong request format")))
        }
      }
      case _ => BadRequest(Json.toJson(Answer(false, "wrong request format")))
    }
  }

  def printPDF(id: Long) = Action {
    tables.getMatch(id) match {
      case Some(ttMatch: TTMatch) =>
        tables.getAllMatchInfo(ttMatch) match {
          case Some(allMatchInfo: AllMatchInfo) =>
            Ok(pdfGenerator.toBytes(views.html.schiri(allMatchInfo), "http://localhost:9000/")).as("application/pdf")
          case _ => BadRequest(Json.toJson(Answer(false, "allMatchInfo not found")))
        }
      case _ => BadRequest(Json.toJson(Answer(false, "ttMatch not found")))
    }
  }

  def allPrinter = Action.async {
    (printerActor ? GetPrinterList).mapTo[Seq[String]].map(msg => Ok(Json.toJson(msg)))
  }

  def setPrinter(name: String) = Action.async {
    (printerActor ? SetPrinter(name)).mapTo[PrinterActor.PrinterAnswer].map { res =>
      res match {
        case PrinterFound => Ok(Json.toJson(Answer(true, "Printer found")))
        case _ => BadRequest(Json.toJson(Answer(false, "Printer not found")))
      }
    }
  }

  def setPrintOnStart(printOnStart: Boolean) = Action {
    tables.printOnStart = printOnStart
    Ok(Json.toJson(Answer(true, "set printOnStart = " + printOnStart)))
  }

}