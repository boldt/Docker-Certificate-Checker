FROM node:13.1.0-alpine

WORKDIR /app/

COPY package.json .
RUN npm install

COPY index.js .
COPY config.example.js config.js

CMD ["node", "index.js"]
