pipeline {

  agent any

  tools {
    nodejs 'node:22'
  }

  environment {
    DOCKER_IMAGE = 'novadityap/blog-app-server'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install client dependencies and build') {
      steps {
         dir('client') {
          sh '''
            cp /var/jenkins_home/env/.env.client.blogapp .env
            npm install
            npm run build
          '''
        }
      }
    }

    stage('Install server dependencies') {
      steps {
        dir('server') {
          sh 'npm install'
        }
      }
    }

    stage('Test server') {
      steps {
        dir('server') {
          sh '''
            cp /var/jenkins_home/env/.env.server.blogapp .env
            npm run test
          '''
        }
      }
    }

    stage('Build server docker image') {
      steps {
        dir('server') {
          sh 'docker build -t $DOCKER_IMAGE .'
        }
      }
    }

    stage('Push server docker image') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh '''
            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
            docker push $DOCKER_IMAGE
          '''
        }
      }
    }
  }
} 