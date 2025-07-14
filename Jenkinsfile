pipeline {
  agent any

  stages {
    stage('Clean Workspace') {
      steps {
        deleteDir()
      }
    }

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Copy env file') {
      steps {
        withCredentials([
          file(credentialsId: 'blog-app-client-dev-env', variable: 'CLIENT_DEV_ENV'),
          file(credentialsId: 'blog-app-client-env', variable: 'CLIENT_ENV'),
          file(credentialsId: 'blog-app-server-dev-env', variable: 'SERVER_DEV_ENV'),
        ]) {
          sh """
            cp "$CLIENT_DEV_ENV" client/.env.development
            cp "$CLIENT_ENV" client/.env.production
            cp "$SERVER_DEV_ENV" server/.env.development
          """
        }
      }
    }

    stage('Build & Up Dev Containers') {
      steps {
        sh 'docker compose -f docker-compose.dev.yml up -d --build'
      }
    }

    stage('Run Server Tests') {
      steps {
        sh 'docker compose -f docker-compose.dev.yml exec server npm run test'
      }
    }

    stage('Build Production Docker Images') {
      steps {
        sh 'docker compose build'
      }
    }

   stage('Push Docker Images') {
      steps {
        withCredentials([
          usernamePassword(
            credentialsId: 'dockerhub',
            usernameVariable: 'DOCKER_USER',
            passwordVariable: 'DOCKER_PASS',
          ),
        ]) {
          sh '''
            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
            docker compose push
          '''
        }
      }
    }
  }
}

