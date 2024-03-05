FROM node:21-slim

WORKDIR /bot

RUN apt update && \
    apt install curl -y && \
    curl -sSL -o argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64 && \
    install -m 555 argocd-linux-amd64 /usr/local/bin/argocd && \
    rm argocd-linux-amd64

# Copy project files
COPY package*.json ./
RUN npm install

# Copy remaining project files
COPY . .

RUN chmod +x entrypoint.sh

CMD ["/bin/bash", "entrypoint.sh"]