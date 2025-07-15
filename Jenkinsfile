  pipeline {
    agent any

    stages {
      stage('Checkout & Clean') {
        steps {
          cleanWs()
          checkout scm
        }
      }

      stage('Copy env file') {
        steps {
          withCredentials([
            file(credentialsId: 'blog-app-client-dev-env', variable: 'CLIENT_DEV_ENV'),
            file(credentialsId: 'blog-app-client-prod-env', variable: 'CLIENT_PROD_ENV'),
            file(credentialsId: 'blog-app-server-dev-env', variable: 'SERVER_DEV_ENV'),
          ]) {
            sh """
              cp "$CLIENT_DEV_ENV" client/.env.development
              cp "$CLIENT_PROD_ENV" client/.env.production
              cp "$SERVER_DEV_ENV" server/.env.development
            """
          }
        }
      }

      stage('Start Dev Containers') {
        steps {
          sh '''
            docker system prune -af --volumes || true
            docker compose -f docker-compose.development.yml down --volumes --remove-orphans || true
            docker compose -f docker-compose.development.yml up -d --build
          '''
        }
      }

      stage('Run Server Tests') {
        steps {
          sh 'docker compose -f docker-compose.development.yml exec server npm run test'
        }
      }

      stage('Build Production Docker Images') {
        steps {
          sh 'docker compose -f docker-compose.production.yml build'
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
              docker compose -f docker-compose.production.yml push
            '''
          }
        }
      }
    }

    post {
     always {
      sh '''
        docker compose -f docker-compose.development.yml down --volumes --remove-orphans || true
        docker system prune -af --volumes || true
      '''
      cleanWs()
    }
  }
}

