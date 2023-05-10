FROM node:lts-alpine

RUN apk add git bash curl
RUN bash < <(curl -s https://raw.githubusercontent.com/babashka/babashka/master/install)

WORKDIR /app

COPY . .

RUN bash ./util/setup.sh

RUN npm install

RUN tsc --build

RUN node dist/index.js