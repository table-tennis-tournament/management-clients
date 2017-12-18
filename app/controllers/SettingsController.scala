package controllers

import javax.inject.Named

import actors.PrinterActor.{GetPrinter, GetPrinterList}
import akka.actor.ActorRef
import akka.pattern.ask
import akka.util.Timeout
import com.google.inject.Inject
import dao.Tables
import models.Setting
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}
import scala.concurrent.duration._
import play.api.libs.concurrent.Execution.Implicits.defaultContext

class SettingsController @Inject() (tables: Tables, @Named("printer_actor") printerActor: ActorRef) extends Controller{
  implicit val timeout: Timeout = 5.seconds
  import models.SettingModel._

  def allSettings = Action.async {
    (printerActor ? GetPrinter).mapTo[String] map {printerName =>
      var settingSeq = Seq.empty[Setting]
      settingSeq = settingSeq :+ Setting("printerName", printerName)
      settingSeq = settingSeq :+ Setting("alwaysPrint", tables.printOnStart)
      Ok(Json.toJson(settingSeq))
    }
  }

}
