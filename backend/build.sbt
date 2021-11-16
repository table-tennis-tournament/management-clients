name := """TurnierManager"""

version := "4.0"

lazy val root = (project in file(".")).enablePlugins(PlayScala, PlayAkkaHttpServer)

scalaVersion := "2.12.7"

libraryDependencies ++= Seq(
  "com.typesafe.play" %% "play-slick" % "3.0.0",
  "com.typesafe.play" %% "play-slick-evolutions" % "3.0.0",
  "mysql" % "mysql-connector-java" % "5.1.12",
  //jdbc,
  cacheApi,
  ws,
  specs2 % Test,
  guice,
  //evolutions,
  "org.scala-sbt" % "librarymanagement_2.10" % "0.1.0-M11",
  "com.typesafe.akka" %% "akka-cluster" % "2.5.17",
  "com.typesafe.akka" %% "akka-cluster-tools" % "2.5.17",
  "com.typesafe.akka" %% "akka-contrib" % "2.5.17",
  "com.github.tototoshi" %% "slick-joda-mapper" % "2.3.0",
  "joda-time" % "joda-time"    % "2.10.1",
  "org.joda"  % "joda-convert" % "1.8.1",
  "org.scalatestplus.play" %% "scalatestplus-play" % "3.1.2" % "test",
  "it.innove" % "play2-pdf" % "1.8.0",
  "org.apache.pdfbox" % "pdfbox" % "2.0.13",
  "com.typesafe.play" %% "play-json-joda" % "2.6.10",
  "net.glxn" % "qrgen" % "1.4",
  "com.github.fdimuccio" %% "play2-sockjs" % "0.6.0"
)

// Play provides two styles of routers, one expects its actions to be injected, the
// other, legacy style, accesses its actions statically.
routesGenerator := InjectedRoutesGenerator

// fork in run := true

enablePlugins(JavaAppPackaging)
enablePlugins(DockerPlugin)
enablePlugins(AshScriptPlugin)

dockerBaseImage       := "openjdk:jre-alpine"
packageName in Docker := "holzleube/turniermanager"
dockerExposedPorts    := Seq(9000, 9443)

// Docker fix
javaOptions in Universal ++= Seq(
  "-Dpidfile.path=/dev/null"
)
