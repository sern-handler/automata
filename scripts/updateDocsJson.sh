#!/bin/bash

cd repos/sern-community
git pull
# merge all changes from main to docsjson to be updated
git checkout docsjson
git merge main
git -c user.name="sern bot" -c user.email="$2" commit -m "chore: merge changes from main"
git push https://sernbot:$1@github.com/sern-handler/sern-community.git

cd ..
cd website
npm run typedoc-json
cd ..
cd sern-community
git add .
git -c user.name="sern bot" -c user.email="$2" commit -m "chore: update typedoc"
git push https://sernbot:$1@github.com/sern-handler/sern-community.git
curl -L \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $1" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/sern-handler/sern-community/pulls \
  -d '{"title":"chore: update typedoc","body":"automated typedoc update (as of the new latest update in the handler)","head":"docsjson","base":"main"}'
git checkout main