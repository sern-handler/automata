#!/bin/bash

cd repos/sern-community
git checkout main
git pull

cd ..
cd website
mv ./docusaurus.config.js ./original.docusaurus.config.js
mv ./docgen.docusaurus.config.js ./docusaurus.config.js
npm run build
mv docusaurus.config.js docgen.docusaurus.config.js
mv original.docusaurus.config.js docusaurus.config.js
npm run typedoc-json
git add .
git -c user.name="sern bot" -c user.email="$2" commit -m "chore: update api documentation"
git push https://sernbot:$1@github.com/sern-handler/website.git
cd ..
cd sern-community
git add .
git -c user.name="sern bot" -c user.email="$2" commit -m "chore: update typedoc"
git push https://sernbot:$1@github.com/sern-handler/sern-community.git