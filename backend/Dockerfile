FROM node:18

WORKDIR /app

COPY . .

RUN npm install --include=dev

EXPOSE 3000

CMD ["npm", "run", "dev"]
