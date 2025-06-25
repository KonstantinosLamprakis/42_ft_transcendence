FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

COPY . .

RUN npm install
RUN npm run build

EXPOSE 4000

VOLUME ["/data"]

CMD ["node", "dist/server.js"]
