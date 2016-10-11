
// @GENERATOR:play-routes-compiler
// @SOURCE:/home/jonas/code/TurnierManager/conf/routes
// @DATE:Tue Oct 11 17:09:29 CEST 2016

package router

import play.core.routing._
import play.core.routing.HandlerInvokerFactory._
import play.core.j._

import play.api.mvc._

import _root_.controllers.Assets.Asset

class Routes(
  override val errorHandler: play.api.http.HttpErrorHandler, 
  // @LINE:6
  Application_4: controllers.Application,
  // @LINE:8
  TableController_1: controllers.TableController,
  // @LINE:10
  PlayerController_0: controllers.PlayerController,
  // @LINE:13
  MatchController_2: controllers.MatchController,
  // @LINE:17
  Assets_3: controllers.Assets,
  val prefix: String
) extends GeneratedRouter {

   @javax.inject.Inject()
   def this(errorHandler: play.api.http.HttpErrorHandler,
    // @LINE:6
    Application_4: controllers.Application,
    // @LINE:8
    TableController_1: controllers.TableController,
    // @LINE:10
    PlayerController_0: controllers.PlayerController,
    // @LINE:13
    MatchController_2: controllers.MatchController,
    // @LINE:17
    Assets_3: controllers.Assets
  ) = this(errorHandler, Application_4, TableController_1, PlayerController_0, MatchController_2, Assets_3, "/")

  import ReverseRouteContext.empty

  def withPrefix(prefix: String): Routes = {
    router.RoutesPrefix.setPrefix(prefix)
    new Routes(errorHandler, Application_4, TableController_1, PlayerController_0, MatchController_2, Assets_3, prefix)
  }

  private[this] val defaultPrefix: String = {
    if (this.prefix.endsWith("/")) "" else "/"
  }

  def documentation = List(
    ("""GET""", this.prefix, """controllers.Application.index"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """getAllTables""", """controllers.TableController.getAllTables"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """getAllPlayer""", """controllers.PlayerController.getAllPlayer"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """getPaidPlayer""", """controllers.PlayerController.getPaidPlayer"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """getAllMatches""", """controllers.MatchController.getAllMatches"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """match/""" + "$" + """id<[^/]+>/setWaitingPosition""", """controllers.MatchController.setWaitingPos(id:Long, pos:Int)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """assets/""" + "$" + """file<.+>""", """controllers.Assets.versioned(path:String = "/public", file:Asset)"""),
    Nil
  ).foldLeft(List.empty[(String,String,String)]) { (s,e) => e.asInstanceOf[Any] match {
    case r @ (_,_,_) => s :+ r.asInstanceOf[(String,String,String)]
    case l => s ++ l.asInstanceOf[List[(String,String,String)]]
  }}


  // @LINE:6
  private[this] lazy val controllers_Application_index0_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix)))
  )
  private[this] lazy val controllers_Application_index0_invoker = createInvoker(
    Application_4.index,
    HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Application",
      "index",
      Nil,
      "GET",
      """ Home page""",
      this.prefix + """"""
    )
  )

  // @LINE:8
  private[this] lazy val controllers_TableController_getAllTables1_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("getAllTables")))
  )
  private[this] lazy val controllers_TableController_getAllTables1_invoker = createInvoker(
    TableController_1.getAllTables,
    HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.TableController",
      "getAllTables",
      Nil,
      "GET",
      """""",
      this.prefix + """getAllTables"""
    )
  )

  // @LINE:10
  private[this] lazy val controllers_PlayerController_getAllPlayer2_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("getAllPlayer")))
  )
  private[this] lazy val controllers_PlayerController_getAllPlayer2_invoker = createInvoker(
    PlayerController_0.getAllPlayer,
    HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.PlayerController",
      "getAllPlayer",
      Nil,
      "GET",
      """""",
      this.prefix + """getAllPlayer"""
    )
  )

  // @LINE:11
  private[this] lazy val controllers_PlayerController_getPaidPlayer3_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("getPaidPlayer")))
  )
  private[this] lazy val controllers_PlayerController_getPaidPlayer3_invoker = createInvoker(
    PlayerController_0.getPaidPlayer,
    HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.PlayerController",
      "getPaidPlayer",
      Nil,
      "GET",
      """""",
      this.prefix + """getPaidPlayer"""
    )
  )

  // @LINE:13
  private[this] lazy val controllers_MatchController_getAllMatches4_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("getAllMatches")))
  )
  private[this] lazy val controllers_MatchController_getAllMatches4_invoker = createInvoker(
    MatchController_2.getAllMatches,
    HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.MatchController",
      "getAllMatches",
      Nil,
      "GET",
      """""",
      this.prefix + """getAllMatches"""
    )
  )

  // @LINE:14
  private[this] lazy val controllers_MatchController_setWaitingPos5_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("match/"), DynamicPart("id", """[^/]+""",true), StaticPart("/setWaitingPosition")))
  )
  private[this] lazy val controllers_MatchController_setWaitingPos5_invoker = createInvoker(
    MatchController_2.setWaitingPos(fakeValue[Long], fakeValue[Int]),
    HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.MatchController",
      "setWaitingPos",
      Seq(classOf[Long], classOf[Int]),
      "GET",
      """""",
      this.prefix + """match/""" + "$" + """id<[^/]+>/setWaitingPosition"""
    )
  )

  // @LINE:17
  private[this] lazy val controllers_Assets_versioned6_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("assets/"), DynamicPart("file", """.+""",false)))
  )
  private[this] lazy val controllers_Assets_versioned6_invoker = createInvoker(
    Assets_3.versioned(fakeValue[String], fakeValue[Asset]),
    HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Assets",
      "versioned",
      Seq(classOf[String], classOf[Asset]),
      "GET",
      """ Map static resources from the /public folder to the /assets URL path""",
      this.prefix + """assets/""" + "$" + """file<.+>"""
    )
  )


  def routes: PartialFunction[RequestHeader, Handler] = {
  
    // @LINE:6
    case controllers_Application_index0_route(params) =>
      call { 
        controllers_Application_index0_invoker.call(Application_4.index)
      }
  
    // @LINE:8
    case controllers_TableController_getAllTables1_route(params) =>
      call { 
        controllers_TableController_getAllTables1_invoker.call(TableController_1.getAllTables)
      }
  
    // @LINE:10
    case controllers_PlayerController_getAllPlayer2_route(params) =>
      call { 
        controllers_PlayerController_getAllPlayer2_invoker.call(PlayerController_0.getAllPlayer)
      }
  
    // @LINE:11
    case controllers_PlayerController_getPaidPlayer3_route(params) =>
      call { 
        controllers_PlayerController_getPaidPlayer3_invoker.call(PlayerController_0.getPaidPlayer)
      }
  
    // @LINE:13
    case controllers_MatchController_getAllMatches4_route(params) =>
      call { 
        controllers_MatchController_getAllMatches4_invoker.call(MatchController_2.getAllMatches)
      }
  
    // @LINE:14
    case controllers_MatchController_setWaitingPos5_route(params) =>
      call(params.fromPath[Long]("id", None), params.fromQuery[Int]("pos", None)) { (id, pos) =>
        controllers_MatchController_setWaitingPos5_invoker.call(MatchController_2.setWaitingPos(id, pos))
      }
  
    // @LINE:17
    case controllers_Assets_versioned6_route(params) =>
      call(Param[String]("path", Right("/public")), params.fromPath[Asset]("file", None)) { (path, file) =>
        controllers_Assets_versioned6_invoker.call(Assets_3.versioned(path, file))
      }
  }
}
