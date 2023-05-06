#!/bin/bash

cd repos/sern-community
git checkout -b docsjson
cd ..
cd website
npm run typedoc-json
cd ..
cd sern-community
git add .
git commit -m "chore: update typedoc"
git push https://sernbot:$1@github.com/sern-handler/sern-community.git
curl -L \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $1"\
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/sern-handler/sern-community/pulls \
  -d '{"title":"chore: update typedoc","body":"automated typedoc update (as of the new latest update in the handler)","head":"docsjson","base":"main"}'