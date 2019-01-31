pipeline {
    agent {
        label 'sbt'
    }
    stages {
        stage('clean') {
            steps {
                sh "rm -rf *"
            }
        }
        stage('checkout') {
            steps {
                checkout scm
            }
        }
        stage('Build') {
            steps {
                sh "sbt compile"
            }
        }        
    }
}