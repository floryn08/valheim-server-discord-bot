FROM node:24-slim

WORKDIR /bot

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built application
COPY dist/ ./dist/

CMD ["node", "dist/index.js"]