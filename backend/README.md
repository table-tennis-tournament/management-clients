##Environment Set Up

###Prerequisite
1. Install SBT (https://www.scala-sbt.org/)

2. Run maria db. You can use the following command to start a maria db with docker and sample data: 
`docker run -p 3306:3306 -e MARIADB_ROOT_PASSWORD="ttv01" -t holzleube/mysql-docker-image:6.1`. The docker image contains sample data.

3. Fit your connection settings in {gitRoot}/conf/application.conf

4. Start sbt run in {gitRoot}

## Dockerhub
There is also a docker image available. To start the docker file you can use the following command (use your mysql credentials):

`docker run --rm -p 9000:9000 -e MYSQL_JDBC=jdbc:mysql://localhost:3306/tournamentManager -e MYSQL_USER=? -e MYSQL_PW=? holzleube/turniermanager:6.1`

available docker-images: [Dockerhub](https://hub.docker.com/r/holzleube/turniermanager) 

## publish on docker

Change version in [build.sbt](build.sbt) file. Make sure your local docker server is up and running.
Build the docker image with:
`sbt docker:publishLocal`

This will create a local docker image with name holzleube/turniermanager:${VERSION}.
After this you can push to dockerhub with:
`docker push holzleube/turniermanager:${VERSION}`
