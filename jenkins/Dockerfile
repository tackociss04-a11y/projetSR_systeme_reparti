FROM jenkins/jenkins:lts

USER root

RUN apt-get update && \
    apt-get install -y \
      docker.io \
      python3 \
      python3-pip \
      python3-venv \
      libpq-dev \
      curl && \
    pip3 install --no-cache-dir --break-system-packages \
      django \
      djangorestframework \
      psycopg2-binary \
      flake8 \
      pytest \
      pytest-django \
      gunicorn && \
    curl -LO https://dl.k8s.io/release/$(curl -Ls https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl && \
    chmod +x kubectl && \
    mv kubectl /usr/local/bin/kubectl && \
    usermod -aG docker jenkins && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

USER jenkins