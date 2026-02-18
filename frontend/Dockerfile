FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install -g @angular/cli && npm install

COPY . .

EXPOSE 4200 

CMD ["ng", "serve", "--host", "0.0.0.0"]
