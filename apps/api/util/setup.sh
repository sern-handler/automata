#!/bin/bash

echo "SERN AUTOMATA SETUP SCRIPT"

rm -rf repos/

echo -ne "Creating repos folder"
mkdir repos
cd repos
echo " done"

if [ -x "$(command -v sern)" ]; then
    echo "sern CLI already installed"
else
    echo -ne "Installing sern CLI"
    npm install -g @sern/cli
    echo " done"
fi

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

echo -ne " (resetting yarn lock)"
# this had to be done
rm yarn.lock
touch yarn.lock

yarn > /dev/null 2>&1
cd ..
echo " done both"
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

echo "SSH keys part"
echo -ne "Adding ssh config"
rm ~/.ssh/config
mkdir ~/.ssh
cp ./ssh.conf ~/.ssh/config
echo " done"

# go back to the initial folder (for development purposes)
cd ..
