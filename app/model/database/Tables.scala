package model.database


class Players(tag: Tag) extends Table[(Int, String, String, Int, Double, String)](tag, "player") {
  def id = column[Int]("Play_ID", O.PrimaryKey) // This is the primary key column
  def firstName = column[String]("Play_FirstName")
  def lastName = column[String]("Play_LastName")
  def paid = column[Int]("Play_Paid")
  def ttr = column[Double]("Play_TTR")
  def sex = column[String]("Play_Sex")
  
  // Every table needs a * projection with the same type as the table's type parameter
  def * = (id, firstName, lastName, paid, ttr, sex)
  def club: ForeignKeyQuery[Club, (Int, String, String, String, String, String)] = 
    foreignKey("Play_Club_ID", clubID, TableQuery[Clubs])(_.id)
}
val players = TableQuery[Players]

class Clubs(tag: Tag) extends Table[(Int, String)](tag, "club"){
  def id = column[Int]("Club_ID", O.PrimaryKey)
  def name = column[String]("Club_Name")

  def * = (id, name)
}

var clubs = TableQuery[Clubs]