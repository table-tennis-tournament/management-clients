name := """TurnierManager"""

version := "5.4"

lazy val root = (project in file(".")).enablePlugins(PlayScala, PlayPekkoHttpServer)

scalaVersion := "2.13.14"

// Add this line to resolve the scala-xml conflict
libraryDependencySchemes += "org.scala-lang.modules" %% "scala-xml" % VersionScheme.Always

libraryDependencies ++= Seq(
  "org.playframework" %% "play-slick" % "6.1.1",
  "org.playframework" %% "play-slick-evolutions" % "6.1.1",
  "mysql" % "mysql-connector-java" % "8.0.33",
  cacheApi,
  ws,
  specs2 % Test,
  guice,
  "org.scala-sbt" % "librarymanagement_2.10" % "0.1.0-M11",
  "com.typesafe.akka" %% "akka-serialization-jackson" % "2.8.5",
  "com.typesafe.akka" %% "akka-cluster-tools" % "2.8.5",
  "com.typesafe.akka" %% "akka-cluster-typed" %"2.8.5",
  "com.github.tototoshi" %% "slick-joda-mapper" % "2.9.1",
  "joda-time" % "joda-time"    % "2.13.1",
  "org.joda"  % "joda-convert" % "2.2.4",
  "org.scalatestplus.play" %% "scalatestplus-play" % "5.1.0" % "test",
  "it.innove" % "play2-pdf" % "1.11.0",
  "org.apache.pdfbox" % "pdfbox" % "2.0.27",
  "com.typesafe.play" %% "play-json-joda" % "2.9.3",
  "net.glxn" % "qrgen" % "1.4",
  "com.github.fdimuccio" %% "play2-sockjs" % "0.8.2"
)


routesGenerator := InjectedRoutesGenerator

enablePlugins(JavaAppPackaging)
enablePlugins(DockerPlugin)
enablePlugins(AshScriptPlugin)

dockerBaseImage       := "eclipse-temurin:17.0.14_7-jre-ubi9-minimal"
Docker / packageName := "holzleube/turniermanager"
dockerExposedPorts    := Seq(9000, 9443)

Universal / javaOptions ++= Seq(
  "-Dpidfile.path=/dev/null",
  "-Dplay.evolutions.db.default.autoApply=true"
)
