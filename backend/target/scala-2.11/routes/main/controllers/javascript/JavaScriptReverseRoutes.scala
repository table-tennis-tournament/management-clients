
// @GENERATOR:play-routes-compiler
// @SOURCE:/home/jonas/code/TurnierManager/conf/routes
// @DATE:Tue Oct 11 17:09:29 CEST 2016

import play.api.routing.JavaScriptReverseRoute
import play.api.mvc.{ QueryStringBindable, PathBindable, Call, JavascriptLiteral }
import play.core.routing.{ HandlerDef, ReverseRouteContext, queryString, dynamicString }


import _root_.controllers.Assets.Asset

// @LINE:6
package controllers.javascript {
  import ReverseRouteContext.empty

  // @LINE:17
  class ReverseAssets(_prefix: => String) {

    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:17
    def versioned: JavaScriptReverseRoute = JavaScriptReverseRoute(
      "controllers.Assets.versioned",
      """
        function(file1) {
          return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "assets/" + (""" + implicitly[PathBindable[Asset]].javascriptUnbind + """)("file", file1)})
        }
      """
    )
  
  }

  // @LINE:13
  class ReverseMatchController(_prefix: => String) {

    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:14
    def setWaitingPos: JavaScriptReverseRoute = JavaScriptReverseRoute(
      "controllers.MatchController.setWaitingPos",
      """
        function(id0,pos1) {
          return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "match/" + (""" + implicitly[PathBindable[Long]].javascriptUnbind + """)("id", id0) + "/setWaitingPosition" + _qS([(""" + implicitly[QueryStringBindable[Int]].javascriptUnbind + """)("pos", pos1)])})
        }
      """
    )
  
    // @LINE:13
    def getAllMatches: JavaScriptReverseRoute = JavaScriptReverseRoute(
      "controllers.MatchController.getAllMatches",
      """
        function() {
          return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "getAllMatches"})
        }
      """
    )
  
  }

  // @LINE:8
  class ReverseTableController(_prefix: => String) {

    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:8
    def getAllTables: JavaScriptReverseRoute = JavaScriptReverseRoute(
      "controllers.TableController.getAllTables",
      """
        function() {
          return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "getAllTables"})
        }
      """
    )
  
  }

  // @LINE:6
  class ReverseApplication(_prefix: => String) {

    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:6
    def index: JavaScriptReverseRoute = JavaScriptReverseRoute(
      "controllers.Application.index",
      """
        function() {
          return _wA({method:"GET", url:"""" + _prefix + """"})
        }
      """
    )
  
  }

  // @LINE:10
  class ReversePlayerController(_prefix: => String) {

    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:11
    def getPaidPlayer: JavaScriptReverseRoute = JavaScriptReverseRoute(
      "controllers.PlayerController.getPaidPlayer",
      """
        function() {
          return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "getPaidPlayer"})
        }
      """
    )
  
    // @LINE:10
    def getAllPlayer: JavaScriptReverseRoute = JavaScriptReverseRoute(
      "controllers.PlayerController.getAllPlayer",
      """
        function() {
          return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "getAllPlayer"})
        }
      """
    )
  
  }


}
