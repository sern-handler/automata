GITHUBTOKEN=$(echo $@ | jq ".githubToken")
EMAIL=$(echo $@ | jq ".email")

git add .
git -c user.name="sern bot" -c user.email="$EMAIL" commit -m "chore: update api documentation"
git push --force https://sernbot:$GITHUBTOKEN@github.com/sern-handler/website.git