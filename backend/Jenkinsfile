pipeline {
    agent {
        label 'sbt'
    }
    stages {
        stage('checkout') {
            steps {
                checkout scm
            }
        }
        stage('clean') {
            steps {
                sh "rm -rf *"
            }
        }
        stage('Build') {
            steps {
                sh "sbt compile"
            }
        }        
    }
}