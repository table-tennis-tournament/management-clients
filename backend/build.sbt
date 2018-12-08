name := """TurnierManager"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala, PlayAkkaHttpServer)

scalaVersion := "2.12.7"
val ngVersion = "4.4.4"

libraryDependencies ++= Seq(
  "com.typesafe.play" %% "play-slick" % "3.0.0",
  "com.typesafe.play" %% "play-slick-evolutions" % "3.0.0",
  "mysql" % "mysql-connector-java" % "5.1.12",
  //jdbc,
//  cacheApi,
  ws,
  specs2 % Test,
//  guice,
  "org.scala-sbt" % "librarymanagement_2.10" % "0.1.0-M11",
  "com.typesafe.akka" %% "akka-cluster" % "2.5.17",
  "com.typesafe.akka" %% "akka-contrib" % "2.5.17",
  "com.github.tototoshi" %% "slick-joda-mapper" % "2.3.0",
  "joda-time" % "joda-time"    % "2.10.1",
  "org.joda"  % "joda-convert" % "1.8.1",
  "org.scalatestplus.play" %% "scalatestplus-play" % "3.1.2" % "test",
  "it.innove" % "play2-pdf" % "1.8.0",
  "org.apache.pdfbox" % "pdfbox" % "2.0.12",
  "com.typesafe.play" %% "play-json-joda" % "2.6.10"
)


////angular2 dependencies
//  "org.webjars.npm" % "angular__common" % ngVersion,
//  "org.webjars.npm" % "angular__compiler" % ngVersion,
//  "org.webjars.npm" % "angular__core" % ngVersion,
//  "org.webjars.npm" % "angular__forms" % ngVersion,
//  "org.webjars.npm" % "angular__http" % ngVersion,
//  "org.webjars.npm" % "angular__router" % ngVersion,
//  "org.webjars.npm" % "angular__platform-browser-dynamic" % ngVersion,
//  "org.webjars.npm" % "angular__platform-browser" % ngVersion,
//  "org.webjars.npm" % "systemjs" % "0.19.39",
//  "org.webjars.npm" % "todomvc-common" % "1.0.3",
//  "org.webjars.npm" % "rxjs" % "5.4.3",
//  "org.webjars.npm" % "es6-promise" % "4.1.1",
//  "org.webjars.npm" % "es6-shim" % "0.35.3",
//  "org.webjars.npm" % "reflect-metadata" % "0.1.10",
//  "org.webjars.npm" % "zone.js" % "0.8.16",
//  "org.webjars.npm" % "core-js" % "2.5.1",
//  "org.webjars.npm" % "symbol-observable" % "1.0.4",
//  "org.webjars.npm" % "typescript" % "2.5.2",
//
//  "org.webjars.npm" % "ng2-dnd" % "4.2.0",
//
//  "org.webjars.npm" % "materialize-css" % "0.100.2",
//  "org.webjars.npm" % "angular2-materialize" % "15.1.10",
//  "org.webjars" % "jquery" % "3.0.0",
//  "org.webjars.npm" % "jquery" % "3.0.0",
//  "org.webjars.npm" % "traceur" % "0.0.111",
//  //tslint dependencyOverrides
//
//  "org.webjars.npm" % "tslint-eslint-rules" % "3.1.0",
//  "org.webjars.npm" % "codelyzer" % "0.0.28",
//  "net.sf.cssbox" % "cssbox" % "4.4",
//  "it.innove" % "play2-pdf" % "1.6.0",

//)
//
//dependencyOverrides += "org.webjars.npm" % "minimatch" % "3.0.0"
//
//resolvers += "scalaz-bintray" at "http://dl.bintray.com/scalaz/releases"

// the typescript typing information is by convention in the typings directory
//// It provides ES6 implementations. This is required when compiling to ES5.
//typingsFile := Some(baseDirectory.value / "typings" / "index.d.ts")
//
////JsEngineKeys.engineType := JsEngineKeys.EngineType.Node
//
//// use the webjars npm directory (target/web/node_modules ) for resolution of module imports of angular2/core etc
//resolveFromWebjarsNodeModulesDir := true

// use the combined tslint and eslint rules plus ng2 lint rules
//(rulesDirectories in tslint) := Some(List(
//  tslintEslintRulesDir.value,
//  ng2LintRulesDir.value
//))


// Play provides two styles of routers, one expects its actions to be injected, the
// other, legacy style, accesses its actions statically.
routesGenerator := InjectedRoutesGenerator

// fork in run := true

