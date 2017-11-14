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
