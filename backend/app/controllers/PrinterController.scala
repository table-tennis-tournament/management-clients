package controllers

import actors.PrinterActor
import actors.PrinterActor.{GetPrinterList, Print, PrinterFound, SetPrinter}
import org.apache.pekko.actor.{ActorRef, ActorSystem}
import org.apache.pekko.pattern.ask
import org.apache.pekko.stream.Materializer
import org.apache.pekko.util.Timeout
import dao.Tables

import javax.inject._
import models.{AllMatchInfo, Answer, TTMatch}
import net.glxn.qrgen.QRCode
import org.slf4j.LoggerFactory
import play.api.Logger
import play.api.http.{DefaultFileMimeTypes, DefaultFileMimeTypesProvider, FileMimeTypesConfiguration}
import play.api.libs.json._
import play.api.mvc._

import scala.concurrent.ExecutionContext
import scala.concurrent.duration._

class PrinterController @Inject() (@Named("printer_actor") printerActor: ActorRef,
                                   tables: Tables,
                                   val controllerComponents: ControllerComponents)
                                  (implicit ec: ExecutionContext, system: ActorSystem, materializer: Materializer
                                        ) extends BaseController {
  implicit val timeout: Timeout = 5.seconds
  import models.AnswerModel._

  val log = LoggerFactory.getLogger("printerControllerLogger")

  def print(id: Long): Action[AnyContent] = Action {
    log.debug("print")
    tables.getMatch(id) match {
      case Some(ttMatch) => tables.getAllMatchInfo(ttMatch) match {
        case Some(allMatchInfo) =>
          printerActor ! Print(allMatchInfo)
          Ok(Json.toJson(Answer(successful = true, "printing")))
        case _ => BadRequest(Json.toJson(Answer(successful = false, "AllMatchInfo not found")))
      }
      case _ => BadRequest(Json.toJson(Answer(successful = false, "Match not found")))
    }
  }

  def printAll: Action[AnyContent] = Action { request =>
    log.debug("print all")
    val req = request.body.asJson
    req match {
      case Some(r) =>
        r.asOpt[Seq[Long]] match {
          case Some(ids) =>
            ids map { id =>
              tables.getMatch(id) match {
                case Some(ttMatch) => tables.getAllMatchInfo(ttMatch) match {
                  case Some(allMatchInfo) =>
                    printerActor ! Print(allMatchInfo)
                    Ok(Json.toJson(Answer(successful = true, "printing")))
                  case _ => BadRequest(Json.toJson(Answer(successful = false, "AllMatchInfo not found")))
                }
                case _ => BadRequest(Json.toJson(Answer(successful = false, "Match not found")))
              }
            }
            Ok(Json.toJson(Answer(successful = true, "successful")))
          case _ => BadRequest(Json.toJson(Answer(successful = false, "wrong request format")))
        }
      case _ => BadRequest(Json.toJson(Answer(successful = false, "wrong request format")))
    }
  }

  def printPDF(id: Long): Action[AnyContent] = Action {
    tables.getMatch(id) match {
      case Some(ttMatch: TTMatch) =>
        tables.getAllMatchInfo(ttMatch) match {
          case Some(allMatchInfo: AllMatchInfo) =>
            // Ok(pdfGenerator.toBytes(views.html.schiri(allMatchInfo), "http://localhost:9000/")).as("application/pdf")
            Ok(Json.toJson(Answer(successful = true, "successful")))
          case _ => BadRequest(Json.toJson(Answer(successful = false, "allMatchInfo not found")))
        }
      case _ => BadRequest(Json.toJson(Answer(successful = false, "ttMatch not found")))
    }
  }

  def allPrinter: Action[AnyContent] = Action.async {
    (printerActor ? GetPrinterList).mapTo[Seq[String]].map(msg => Ok(Json.toJson(msg)))
  }

  def setPrinter(name: String): Action[AnyContent] = Action.async {
    (printerActor ? SetPrinter(name)).mapTo[PrinterActor.PrinterAnswer].map {
      case PrinterFound => Ok(Json.toJson(Answer(successful = true, "Printer found")))
      case _ => BadRequest(Json.toJson(Answer(successful = false, "Printer not found")))
    }
  }

  def setPrintOnStart(printOnStart: Boolean): Action[AnyContent] = Action {
    tables.printOnStart = printOnStart
    Ok(Json.toJson(Answer(successful = true, "set printOnStart = " + printOnStart)))
  }

  def getQrCode(content: String): Action[AnyContent] = Action {
    implicit val fileMimeTypes: DefaultFileMimeTypes = new DefaultFileMimeTypesProvider(FileMimeTypesConfiguration(Map("png" -> "image/png"))).get
    val file = QRCode.from(content).file("test.png")
    Ok.sendFile(new java.io.File(file.getPath))
  }
}