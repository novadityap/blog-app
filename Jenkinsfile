pipeline {

  agent {
    docker {
      image 'node:22.15-alpine'
      args '-v /var/jenkins_home:/var/jenkins_home'
    }
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Prepare environment files') {
      steps {
        script {
          def clientEnv = readProperties file: '/var/jenkins_home/env/.env.client.blogapp'
          writeFile file: '.env.client', text: clientEnv.collect { k, v -> "${k}=${v}" }.join('\n')
        }
      }
    }

    stage('Install client dependencies and build') {
      steps {
         dir('client') {
          sh '''
            cp ../.env .env
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
            set -a
            source .env
            set +a
            npm run test
          '''
        }
      }
    }
  }
} 