FROM node:lts-alpine

RUN apk add git bash

WORKDIR /app

RUN bash util/setup.sh

COPY package.json ./

RUN npm install

COPY . .

RUN tsc --build

RUN node dist/index.js