#!/bin/bash
git pull

docker build . -t srizan10/automata

docker stop automata

docker rm automata

docker run -d -t --name automata -p 8090:3000 --restart unless-stopped srizan10/automata