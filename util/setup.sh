#!/bin/bash

echo "SERN AUTOMATA SETUP SCRIPT"

rm -rf repos/

echo -ne "Creating repos folder"
mkdir repos
cd repos
echo " done"

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
npm i > /dev/null 2>&1
cd ..
echo " done"
# handler
echo -ne "- handler"
cd sernHandlerV2
npm i > /dev/null 2>&1
cd ..
echo " done"
# discord bot
echo -ne "- discord bot (using yarn)"
cd sern-community
yarn install > /dev/null 2>&1
cd ..
echo " done"

# go back to the initial folder (for development purposes)
cd ..
