FROM node:alpine
WORKDIR /app
COPY package.json .
RUN npm install && npm install typescript -g
COPY . .
RUN npx tsc
CMD ["node", "./dist/index.js"]