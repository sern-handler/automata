#!/bin/bash

echo "SERN AUTOMATA SETUP SCRIPT"

echo "Creating repos folder..."
mkdir repos
cd repos

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

# go back to the initial folder (for development purposes)
cd ..
