name := """TurnierManager"""

version := "5.0"

lazy val root = (project in file(".")).enablePlugins(PlayScala, PlayAkkaHttpServer)

scalaVersion := "2.13.10"

libraryDependencies ++= Seq(
  "com.typesafe.play" %% "play-slick" % "5.1.0",
  "com.typesafe.play" %% "play-slick-evolutions" % "5.1.0",
  "mysql" % "mysql-connector-java" % "8.0.30",
  //jdbc,
  cacheApi,
  ws,
  specs2 % Test,
  guice,
  //evolutions,
  "org.scala-sbt" % "librarymanagement_2.10" % "0.1.0-M11",
  //"com.typesafe.akka" %% "akka-cluster" % "2.6.20",
  "com.typesafe.akka" %% "akka-cluster-tools" % "2.6.20",
  "com.typesafe.akka" %% "akka-cluster-typed" %"2.6.20",
  "com.github.tototoshi" %% "slick-joda-mapper" % "2.6.0",
  "joda-time" % "joda-time"    % "2.12.2",
  "org.joda"  % "joda-convert" % "2.2.2",
  "org.scalatestplus.play" %% "scalatestplus-play" % "5.1.0" % "test",
  "it.innove" % "play2-pdf" % "1.11.0",
  "org.apache.pdfbox" % "pdfbox" % "2.0.27",
  "com.typesafe.play" %% "play-json-joda" % "2.9.3",
  "net.glxn" % "qrgen" % "1.4",
  "com.github.fdimuccio" %% "play2-sockjs" % "0.8.2"
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
