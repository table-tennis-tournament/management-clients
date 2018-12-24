##Environment Set Up

###Prerequisite
1. Install SBT (https://www.scala-sbt.org/)

2. Install MySQL-DB

3. Use Sample Data from {gitRoot}/test/sample_data.sql

4. Fit your connection settings in {gitRoot}/conf/application.conf

5. Start sbt run in {gitRoot}

## Dockerhub
There is also a docker image available. To start the docker file you can use the following command (use your mysql credentials):

`docker run --rm -e MYSQL_SERVER=localhost -e MYSQL_DB=? -e MYSQL_USER=? -e MYSQL_PW=? turniermanager:1.0 -p 9000:9000`

available docker-images: [Dockerhub](https://hub.docker.com/r/holzleube/turniermanager) 
