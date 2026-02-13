FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install -g @angular/cli@12
RUN npm install

COPY . .

EXPOSE 4200

CMD ["npm", "start"]
