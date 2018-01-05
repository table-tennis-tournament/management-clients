package controllers

import javax.inject.Named

import actors.PrinterActor._
import akka.actor.ActorRef
import akka.pattern.ask
import akka.util.Timeout
import com.google.inject.Inject
import dao.Tables
import models.{Answer, Setting}
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}

import scala.concurrent.duration._
import play.api.libs.concurrent.Execution.Implicits.defaultContext

import scala.concurrent.Future

class SettingsController @Inject() (tables: Tables, @Named("printer_actor") printerActor: ActorRef) extends Controller{
  implicit val timeout: Timeout = 5.seconds
  import models.SettingModel._
  import models.AnswerModel._

  def allSettings = Action.async {
    (printerActor ? GetPrinter).mapTo[String] map {printerName =>
      var settingSeq = Seq.empty[Setting]
      settingSeq = settingSeq :+ Setting("printerName", printerName)
      settingSeq = settingSeq :+ Setting("alwaysPrint", tables.printOnStart)
      settingSeq = settingSeq :+ Setting("autoStart", tables.autoStart)
      Ok(Json.toJson(settingSeq))
    }
  }

  def setSettings = Action.async { request =>
    val jsonO = request.body.asJson
    jsonO match {
      case Some(json) => {
        json.validate[Seq[Setting]].asOpt match {
          case Some(settingSeq) => {
            settingSeq map {setting =>
              setting match {
                case Setting("printerName", printer: String) =>
                  (printerActor ? SetPrinter(printer)).mapTo[PrinterAnswer] map {
                    case PrinterFound =>

                    case _ => BadRequest(Json.toJson(Answer(false, "Printer not Found")))
                  }
              }
            }
            Future.successful(Ok(Json.toJson(Answer(true, "set settings"))))
          }
          case _ => Future.successful(BadRequest(Json.toJson(Answer(false, "wrong request format"))))
        }
      }
      case _ => Future.successful(BadRequest(Json.toJson(Answer(false, "wrong request format"))))
    }
  }

}
