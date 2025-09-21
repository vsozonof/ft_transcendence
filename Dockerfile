#Backend/Dockerfile
FROM node:18

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
