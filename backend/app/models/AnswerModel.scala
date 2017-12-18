package models

import play.api.libs.json.{Json, Writes}

object AnswerModel{
  implicit val answerWrites = new Writes[Answer] {
    def writes(answer: Answer) = Json.obj(
      "successful" -> answer.successful,
      "message" -> answer.message,
      "data" -> answer.data.getOrElse(None).toString
    )
  }
}
case class Answer(successful: Boolean, message: String, data: Option[Any] = None)

object WSMessageModel{
  implicit val wsMessageWrites = new Writes[WSMessage] {
    def writes(wsMessage: WSMessage) = Json.obj(
      "action" -> wsMessage.action,
      "id" -> wsMessage.changedId
    )
  }
}
case class WSMessage(action: String, changedId: Option[String] = None)

object SettingModel{
  implicit val settingWrites = new Writes[Setting] {
    def writes(setting: Setting) = {

      Json.obj(
        "key" -> setting.key,
        "value" -> (setting.value match {
          case s: String => s
          case b: Boolean => b
          case e => "error"
        })
      )
    }
  }
}
case class Setting(key: String, value: Any)
