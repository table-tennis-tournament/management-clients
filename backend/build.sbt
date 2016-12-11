name := """TurnierManager"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.11.7"
val ngVersion = "2.0.2"

libraryDependencies ++= Seq(
  "com.typesafe.play" %% "play-slick" % "2.0.0",
  "mysql" % "mysql-connector-java" % "5.1.12",
  jdbc,
  cache,
  ws,
  specs2 % Test,
  "org.scala-sbt" % "librarymanagement_2.10" % "0.1.0-M11",
  "com.typesafe.akka" %% "akka-cluster" % "2.3.7",
  "com.typesafe.akka" %% "akka-contrib" % "2.3.7",
  "com.github.tototoshi" %% "slick-joda-mapper" % "2.2.0",
  "joda-time" % "joda-time"    % "2.9.2",
  "org.joda"  % "joda-convert" % "1.6",


//angular2 dependencies
  "org.webjars.npm" % "angular__common" % ngVersion,
  "org.webjars.npm" % "angular__compiler" % ngVersion,
  "org.webjars.npm" % "angular__core" % ngVersion,
  "org.webjars.npm" % "angular__forms" % ngVersion,
  "org.webjars.npm" % "angular__platform-browser-dynamic" % ngVersion,
  "org.webjars.npm" % "angular__platform-browser" % ngVersion,
  "org.webjars.npm" % "systemjs" % "0.19.39",
  "org.webjars.npm" % "todomvc-common" % "1.0.2",
  "org.webjars.npm" % "rxjs" % "5.0.0-beta.12",
  "org.webjars.npm" % "es6-promise" % "3.1.2",
  "org.webjars.npm" % "es6-shim" % "0.35.1",
  "org.webjars.npm" % "reflect-metadata" % "0.1.8",
  "org.webjars.npm" % "zone.js" % "0.6.25",
  "org.webjars.npm" % "core-js" % "2.4.1",
  "org.webjars.npm" % "symbol-observable" % "1.0.4",
  "org.webjars.npm" % "typescript" % "2.0.6",

//tslint dependency
  "org.webjars.npm" % "tslint-eslint-rules" % "2.1.0",
  "org.webjars.npm" % "codelyzer" % "0.0.28"
)

dependencyOverrides += "org.webjars.npm" % "minimatch" % "3.0.0"

resolvers += "scalaz-bintray" at "http://dl.bintray.com/scalaz/releases"

// the typescript typing information is by convention in the typings directory
// It provides ES6 implementations. This is required when compiling to ES5.
typingsFile := Some(baseDirectory.value / "typings" / "index.d.ts")

// use the webjars npm directory (target/web/node_modules ) for resolution of module imports of angular2/core etc
resolveFromWebjarsNodeModulesDir := true

// use the combined tslint and eslint rules plus ng2 lint rules
(rulesDirectories in tslint) := Some(List(
  tslintEslintRulesDir.value,
  ng2LintRulesDir.value
))


dependencyOverrides += "org.webjars.npm" % "minimatch" % "3.0.0"
resolvers += "scalaz-bintray" at "http://dl.bintray.com/scalaz/releases"

// the typescript typing information is by convention in the typings directory
// It provides ES6 implementations. This is required when compiling to ES5.
typingsFile := Some(baseDirectory.value / "typings" / "index.d.ts")

// use the webjars npm directory (target/web/node_modules ) for resolution of module imports of angular2/core etc
resolveFromWebjarsNodeModulesDir := true

// use the combined tslint and eslint rules plus ng2 lint rules
(rulesDirectories in tslint) := Some(List(
  tslintEslintRulesDir.value,
  ng2LintRulesDir.value
))

// Play provides two styles of routers, one expects its actions to be injected, the
// other, legacy style, accesses its actions statically.
routesGenerator := InjectedRoutesGenerator

// fork in run := true

