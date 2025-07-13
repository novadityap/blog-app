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
      sh '''
        echo "Isi direktori root:"
        ls -la
        echo "Isi direktori client:"
        ls -la client

        if [ -f "$CLIENT_ENV" ]; then
          echo "Menyalin $CLIENT_ENV ke client/.env"
          cp "$CLIENT_ENV" client/.env
        else
          echo "File environment tidak ditemukan: $CLIENT_ENV"
          exit 1
        fi
      '''
    }

    withCredentials([file(credentialsId: 'blog-app-server-env', variable: 'SERVER_ENV')]) {
      sh '''
        echo "Isi direktori server:"
        ls -la server

        if [ -f "$SERVER_ENV" ]; then
          echo "Menyalin $SERVER_ENV ke server/.env"
          cp "$SERVER_ENV" server/.env
        else
          echo "File environment tidak ditemukan: $SERVER_ENV"
          exit 1
        fi
      '''
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
        sh 'docker compose -f docker-compose.dev.yml exec blog-app-server-dev npm run test'
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
