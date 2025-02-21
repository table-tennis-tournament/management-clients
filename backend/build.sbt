name := """TurnierManager"""

version := "5.4"

lazy val root = (project in file(".")).enablePlugins(PlayScala, PlayPekkoHttpServer)

scalaVersion := "2.13.14"

libraryDependencies ++= Seq(
  "org.playframework" %% "play-slick" % "6.1.1",
  "org.playframework" %% "play-slick-evolutions" % "6.1.1",
  "mysql" % "mysql-connector-java" % "8.0.33",
  cacheApi,
  ws,
  specs2 % Test,
  guice,
  "org.scala-sbt" % "librarymanagement_2.10" % "0.1.0-M11",
  "com.github.tototoshi" %% "slick-joda-mapper" % "2.9.1",
  "joda-time" % "joda-time"    % "2.13.1",
  "org.joda"  % "joda-convert" % "2.2.4",
  "org.scalatestplus.play" %% "scalatestplus-play" % "5.1.0" % "test",
  "it.innove" % "play2-pdf" % "1.11.0",
  "org.apache.pdfbox" % "pdfbox" % "2.0.27",
  "com.typesafe.play" %% "play-json-joda" % "2.9.3",
  "net.glxn" % "qrgen" % "1.4",
  "com.github.fdimuccio" %% "play2-sockjs" % "0.8.2",
  "org.apache.pekko" %% "pekko-cluster" % "1.1.3",
  "org.apache.pekko" %% "pekko-cluster-tools" % "1.1.3",
  "org.apache.pekko" %% "pekko-serialization-jackson" % "1.1.3",
  "org.apache.pekko" %% "pekko-cluster-typed" % "1.1.3"
)

libraryDependencySchemes += "org.scala-lang.modules" %% "scala-xml" % "always"

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
