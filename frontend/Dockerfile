FROM node:trixie-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
CMD ["npx", "expo", "start", "--host", "tunnel", "--port", "8081"]
