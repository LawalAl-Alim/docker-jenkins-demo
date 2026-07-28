pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                sh 'docker build -t docker-jenkins-demo ./app'
            }
        }
    }
}
