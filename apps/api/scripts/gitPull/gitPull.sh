#!/bin/bash
REPO=$(echo $NT_ARGS | jq -r '.requestBody.repository.name')

if [ -z "$REPO" ]; then
  echo "No repository provided"
  exit 1
fi

case $REPO in
  "handler")
    echo "Pulling handler"
    cd sernHandlerV2
    git pull
    ;;
  "website")
    echo "Pulling website"
    cd website
    git pull
    ;;
  "sern-community")
    echo "Pulling sern-community"
    cd sern-community
    git pull
    ;;
  "atm-playground")
    echo "Got playground"
    ;;
  *)
    echo "Invalid repository provided: $REPO"
    exit 1
esac

if [ -z "$(git diff --name-only HEAD~1 HEAD | grep package.json)" ]; then
    echo "No changes in package.json"
else
    echo "Changes in package.json"
    yarn install
fi