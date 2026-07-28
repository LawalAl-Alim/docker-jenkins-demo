pipeline {
    agent any

    environment {
        IMAGE_NAME = "alalimlawal/docker-jenkins-demo"
    }

    stages {

        stage('Build') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:latest ./app"
            }
        }

        stage('Push') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    docker push ${IMAGE_NAME}:latest
                    docker logout
                    '''
                }
            }
        }
    }
}
