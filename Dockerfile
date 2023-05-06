FROM node:lts-alpine

RUN apk add git bash curl
RUN bash < <(curl -s https://raw.githubusercontent.com/babashka/babashka/master/install)

WORKDIR /app

RUN bash ./util/setup.sh

COPY package.json ./

RUN npm install

COPY . .

RUN tsc --build

RUN node dist/index.js