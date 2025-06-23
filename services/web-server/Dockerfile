FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

COPY . .

RUN npm install
RUN npm run build
RUN npm run build:frontend

EXPOSE 80

CMD ["node", "dist/server.js"]