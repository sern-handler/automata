#!/bin/bash

echo "SERN AUTOMATA SETUP SCRIPT"
cd apps/api

rm -rf repos/

echo -ne "Creating repos folder"
mkdir repos
cd repos
echo " done"

if [$IS_SRIZAN == "true"]
then
    echo -ne "Detected Sr Izan on development environment. chowning repos folder"
    sudo chown -R srizan:srizan .
    echo " done"
fi

echo -ne "Installing sern CLI"
npm install -g @sern/cli
echo " done"

echo "Cloning repos"
# handler (clone it as sernHandlerV2)
echo -ne "- handler"
git clone https://github.com/sern-handler/handler.git sernHandlerV2/ > /dev/null 2>&1
echo " done"
# website
echo -ne "- website"
git clone https://github.com/sern-handler/website.git > /dev/null 2>&1
echo " done"
# sern community discord bot
echo -ne "- discord bot"
git clone https://github.com/sern-handler/sern-community.git > /dev/null 2>&1
echo " done"

echo -ne "Installing yarn"
npm install -g yarn > /dev/null 2>&1
echo " done"

echo "Installing npm packages"
# website
echo -ne "- website"
cd website
yarn > /dev/null 2>&1
cd ..
echo " done"
# handler
echo -ne "- handler"
cd sernHandlerV2
yarn > /dev/null 2>&1
cd ..
echo " done"
# discord bot
echo -ne "- discord bot"
cd sern-community
yarn > /dev/null 2>&1
cd ..
echo " done"

# go back to the initial folder (for development purposes)
cd ..
