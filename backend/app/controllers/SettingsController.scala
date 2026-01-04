package controllers

import actors.PrinterActor._
import org.apache.pekko.actor.ActorRef
import org.apache.pekko.pattern.ask
import org.apache.pekko.util.Timeout
import dao.Tables
import javax.inject.{Inject, Named}
import models.{Answer, Setting, TypeColorData}
import play.api.libs.json.{JsObject, Json, Writes}
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}

import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}

class SettingsController @Inject() (implicit ec: ExecutionContext,
                                    tables: Tables, @Named("printer_actor") printerActor: ActorRef,
                                    val controllerComponents: ControllerComponents) extends BaseController{
  implicit val timeout: Timeout = 5.seconds
  import models.AnswerModel._
  import models.SettingModel._
  import models.MatchModel.{typeColorDataWrites, typeColorDataReads}
  import play.api.libs.json._

  // Implicit Writes for Map[Long, TypeColorData]
  implicit val typeColorMapWrites: Writes[Map[Long, TypeColorData]] = new Writes[Map[Long, TypeColorData]] {
    def writes(map: Map[Long, TypeColorData]) = {
      JsObject(map.map { case (k, v) => k.toString -> typeColorDataWrites.writes(v) })
    }
  }

  // Implicit Reads for Map[Long, TypeColorData]
  implicit val typeColorMapReads: Reads[Map[Long, TypeColorData]] = new Reads[Map[Long, TypeColorData]] {
    def reads(json: JsValue): JsResult[Map[Long, TypeColorData]] = {
      json.validate[JsObject].map { obj =>
        obj.fields.flatMap { case (key, value) =>
          try {
            val typeId = key.toLong
            value.validate[TypeColorData].asOpt.map(typeId -> _)
          } catch {
            case _: NumberFormatException => None
          }
        }.toMap
      }
    }
  }

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

  def getAllTypeColors: Action[AnyContent] = Action {
    Ok(Json.toJson(tables.getAllTypeColors))
  }

  def saveTypeColor(typeId: Long): Action[AnyContent] = Action.async { request =>
    val jsonO = request.body.asJson
    jsonO match {
      case Some(json) =>
        json.validate[TypeColorData].asOpt match {
          case Some(colorData) =>
            if (!colorData.bgColor.matches("^#[0-9A-Fa-f]{6}$")) {
              Future.successful(BadRequest(Json.toJson(Answer(successful = false, "Invalid hex color format"))))
            } else if (colorData.textColor != "white" && colorData.textColor != "black") {
              Future.successful(BadRequest(Json.toJson(Answer(successful = false, "Text color must be white or black"))))
            } else {
              tables.saveTypeColor(typeId, colorData.bgColor, colorData.textColor).map { _ =>
                Ok(Json.toJson(Answer(successful = true, "Type color saved")))
              }.recover {
                case e: Exception =>
                  BadRequest(Json.toJson(Answer(successful = false, s"Error: ${e.getMessage}")))
              }
            }
          case None =>
            Future.successful(BadRequest(Json.toJson(Answer(successful = false, "Invalid format"))))
        }
      case None =>
        Future.successful(BadRequest(Json.toJson(Answer(successful = false, "No JSON body"))))
    }
  }

  def setBulkTypeColors: Action[AnyContent] = Action.async { request =>
    val jsonO = request.body.asJson
    jsonO match {
      case Some(json) =>
        json.validate[Map[Long, TypeColorData]].asOpt match {
          case Some(typeColorMap) =>
            // Validate all colors
            val invalidColors = typeColorMap.filter { case (_, colorData) =>
              !colorData.bgColor.matches("^#[0-9A-Fa-f]{6}$") ||
              (colorData.textColor != "white" && colorData.textColor != "black")
            }

            if (invalidColors.nonEmpty) {
              Future.successful(BadRequest(Json.toJson(
                Answer(successful = false, s"Invalid color format for type IDs: ${invalidColors.keys.mkString(", ")}")
              )))
            } else {
              tables.bulkSaveTypeColors(typeColorMap).map { _ =>
                Ok(Json.toJson(Answer(successful = true, "Type colors saved successfully")))
              }.recover {
                case e: Exception =>
                  BadRequest(Json.toJson(Answer(successful = false, s"Error: ${e.getMessage}")))
              }
            }
          case None =>
            Future.successful(BadRequest(Json.toJson(Answer(successful = false, "Invalid format"))))
        }
      case None =>
        Future.successful(BadRequest(Json.toJson(Answer(successful = false, "No JSON body"))))
    }
  }

}
