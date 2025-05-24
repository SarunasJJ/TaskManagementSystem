FROM node:19-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install && \
    npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "start"]