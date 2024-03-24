GITHUBTOKEN=$(echo $NT_ARGS | jq ".githubToken")
EMAIL=$(echo $NT_ARGS | jq ".email")

git add .
git -c user.name="sern bot" -c user.email="$EMAIL" commit -m "chore: update api documentation"
git remote set-url origin git@github.com:sern-handler/website.git
git push --force