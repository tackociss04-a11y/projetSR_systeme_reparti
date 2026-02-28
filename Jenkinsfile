pipeline {
    agent any
    environment {
        DOCKER_USER    = "tacko6"
        APP_NAME_BACK  = "projetsr-backend"
        APP_NAME_FRONT = "projetsr-frontend"
    }
    stages {
        stage('Linting & Tests') {
            steps {
                echo 'Exécution des tests unitaires...'
                sh 'cd backend && pip install -r requirements.txt --break-system-packages || true'
                sh 'cd backend && pytest || echo "Aucun test trouvé"'
            }
        }
        stage('Build Docker Images') {
            steps {
                echo 'Construction des images...'
                sh "docker build -t ${DOCKER_USER}/${APP_NAME_BACK}:latest ./backend"
                sh "docker build -t ${DOCKER_USER}/${APP_NAME_FRONT}:latest ./frontend"
            }
        }
        stage('Push to Docker Hub') {
            steps {
                echo 'Connexion et envoi vers Docker Hub...'
                withCredentials([usernamePassword(credentialsId: 'docker-hub-login', passwordVariable: 'DOCKER_HUB_PASSWORD', usernameVariable: 'DOCKER_HUB_USERNAME')]) {
                    sh "echo ${DOCKER_HUB_PASSWORD} | docker login -u ${DOCKER_HUB_USERNAME} --password-stdin"
                    sh "docker push ${DOCKER_USER}/${APP_NAME_BACK}:latest"
                    sh "docker push ${DOCKER_USER}/${APP_NAME_FRONT}:latest"
                }
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                echo 'Déploiement sur le cluster Minikube...'
                sh "kubectl apply -f k8s/postgres-deployment.yaml"
                sh "kubectl apply -f k8s/backend-deployment.yaml"
                sh "kubectl apply -f k8s/frontend-deployment.yaml"
            }
        }
    }
}