package controllers

import actors.PrinterActor._
import org.apache.pekko.actor.ActorRef
import org.apache.pekko.pattern.ask
import org.apache.pekko.util.Timeout
import dao.Tables
import javax.inject.{Inject, Named}
import models.{Answer, Setting}
import play.api.libs.json.Json
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}

import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}

class SettingsController @Inject() (implicit ec: ExecutionContext,
                                    tables: Tables, @Named("printer_actor") printerActor: ActorRef,
                                    val controllerComponents: ControllerComponents) extends BaseController{
  implicit val timeout: Timeout = 5.seconds
  import models.AnswerModel._
  import models.SettingModel._

  def allSettings: Action[AnyContent] = Action.async {
    (printerActor ? GetPrinter).mapTo[String] map {printerName =>
      var settingSeq = Seq.empty[Setting]
      settingSeq = settingSeq :+ Setting("printerName", printerName)
      settingSeq = settingSeq :+ Setting("alwaysPrint", tables.printOnStart)
      settingSeq = settingSeq :+ Setting("autoStart", tables.autoStart)
      Ok(Json.toJson(settingSeq))
    }
  }

  def setSettings: Action[AnyContent] = Action.async { request =>
    val jsonO = request.body.asJson
    jsonO match {
      case Some(json) =>
        json.validate[Seq[Setting]].asOpt match {
          case Some(settingSeq) =>
            settingSeq map {
              case Setting("printerName", printer: String) =>
                (printerActor ? SetPrinter(printer)).mapTo[PrinterAnswer] map {
                  case PrinterFound =>

                  case _ => BadRequest(Json.toJson(Answer(successful = false, "Printer not Found")))
                }
              case _ => BadRequest(Json.toJson(Answer(successful = false, "Printer not Found")))
            }
            Future.successful(Ok(Json.toJson(Answer(successful = true, "set settings"))))
          case _ => Future.successful(BadRequest(Json.toJson(Answer(successful = false, "wrong request format"))))
        }
      case _ => Future.successful(BadRequest(Json.toJson(Answer(successful = false, "wrong request format"))))
    }
  }

}
