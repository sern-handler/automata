GITHUBTOKEN=$(echo $@ | jq ".githubToken")
EMAIL=$(echo $@ | jq ".email")

git add .
git -c user.name="sern bot" -c user.email="$EMAIL" commit -m "chore: update typedoc"
git push https://sernbot:$GITHUBTOKEN@github.com/sern-handler/sern-community.git