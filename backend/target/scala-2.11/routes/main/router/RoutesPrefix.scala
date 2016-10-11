
// @GENERATOR:play-routes-compiler
// @SOURCE:/home/jonas/code/TurnierManager/conf/routes
// @DATE:Tue Oct 11 17:09:29 CEST 2016


package router {
  object RoutesPrefix {
    private var _prefix: String = "/"
    def setPrefix(p: String): Unit = {
      _prefix = p
    }
    def prefix: String = _prefix
    val byNamePrefix: Function0[String] = { () => prefix }
  }
}
