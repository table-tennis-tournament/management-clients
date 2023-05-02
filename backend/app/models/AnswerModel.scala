package models

import play.api.libs.functional.syntax._
import play.api.libs.json._

object AnswerModel{
  implicit val answerWrites: Writes[Answer] = (answer: Answer) => Json.obj(
    "successful" -> answer.successful,
    "message" -> answer.message,
    "data" -> answer.data.getOrElse(None).toString
  )
}
case class Answer(successful: Boolean, message: String, data: Option[Any] = None)

object WSMessageModel{
  implicit val wsMessageWrites: Writes[WSMessage] = (wsMessage: WSMessage) => Json.obj(
    "action" -> wsMessage.action,
    "id" -> wsMessage.changedId
  )
}
case class WSMessage(action: String, changedId: Option[String] = None)

object SettingModel{
  implicit val settingWrites: Writes[Setting] = (setting: Setting) => {

    Json.obj(
      "key" -> setting.key,
      "value" -> (setting.value match {
        case s: String => s
        case b: Boolean => b
        case e => "error"
      })
    )
  }

  implicit val settingReads: Reads[Setting] = (
    (JsPath \ "key").read[String] and
      (JsPath \ "value").read[String]
    )(Setting.apply _)
}
case class Setting(key: String, value: Any)
