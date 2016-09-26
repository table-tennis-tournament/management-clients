
// @GENERATOR:play-routes-compiler
// @SOURCE:C:/Develop/Source/angular2/conf/routes
// @DATE:Mon Sep 26 11:25:51 CEST 2016


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
