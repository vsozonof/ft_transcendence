FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install --include=dev && npm install -g nodemon

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

