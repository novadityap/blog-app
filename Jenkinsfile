pipeline {
  agent any

  stages {
    stage('Clean Workspace') {
      steps {
        deleteDir() 
      }
    }

    stage ('Checkout') {
      steps {
        checkout scm
      }
    }

   stage('Copy env file') {
  steps {
  withCredentials([file(credentialsId: 'blog-app-client-env', variable: 'CLIENT_ENV')]) {
    sh 'cp "$CLIENT_ENV" client/.env'
  }

  withCredentials([file(credentialsId: 'blog-app-server-env', variable: 'SERVER_ENV')]) {
    sh 'cp "$SERVER_ENV" server/.env'
  }
}
}


    stage ('Build Docker Compose Dev') {
      steps {
        sh 'docker compose -f docker-compose.dev.yml up -d --build'
      }
    }

    stage ('Run Server Tests') {
      steps {
        sh 'docker compose -f docker-compose.dev.yml exec server npm run test'
      }
    }

    stage ('Stop Docker Compose') {
      steps {
        sh 'docker compose -f docker-compose.dev.yml down -v'
      }
    }

    stage ('Build and Push Docker Images') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh '''
            docker compose build
            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
            docker compose push
          '''
        }
      }
    }
  }
}
