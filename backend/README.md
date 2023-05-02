##Environment Set Up

###Prerequisite
1. Install SBT (https://www.scala-sbt.org/)

2. Install MySQL-DB. You can also use the following command to start a mysql db with docker: 
`docker run -p 3306:3306 -e MYSQL_ROOT_PASSWORD="ttv01" -t holzleube/mysql-docker-image:3.0`. The docker image contains the sample data, you don't need step 3.

3. Use Sample Data from {gitRoot}/test/sample_data.sql

4. Fit your connection settings in {gitRoot}/conf/application.conf

5. Start sbt run in {gitRoot}

## Dockerhub
There is also a docker image available. To start the docker file you can use the following command (use your mysql credentials):

`docker run --rm -p 9000:9000 -e MYSQL_JDBC=jdbc:mysql://localhost:3306/tournamentManager -e MYSQL_USER=? -e MYSQL_PW=? holzleube/turniermanager:3.1`

available docker-images: [Dockerhub](https://hub.docker.com/r/holzleube/turniermanager) 

## publish on docker

Change version in [build.sbt](build.sbt) file. Make sure your local docker server is up and running.
Build the docker image with:
`sbt docker:publishLocal`

This will create a local docker image with name holzleube/turniermanager:${VERSION}.
After this you can push to dockerhub with:
`docker push holzleube/turniermanager:${VERSION}`
