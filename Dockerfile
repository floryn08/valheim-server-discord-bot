FROM node:21-slim

WORKDIR /bot

# Copy project files
COPY package*.json ./
RUN npm install

# Copy remaining project files
COPY . .

CMD ["node", "index.js"]