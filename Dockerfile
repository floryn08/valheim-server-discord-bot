FROM node:20-slim

WORKDIR /bot

# Copy project files
COPY package*.json ./
RUN npm install

# Copy remaining project files
COPY . .

RUN chmod +x entrypoint.sh

CMD ["/bin/bash", "entrypoint.sh"]