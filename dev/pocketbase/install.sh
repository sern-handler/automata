PB_VERSION="0.20.1"

echo "Downloading PocketBase version $PB_VERSION..."
curl -L -# "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip" -o /tmp/pocketbase.zip

# Extract the content into the pocketbase directory
echo
echo "Extracting PocketBase..."
unzip /tmp/pocketbase.zip -d ./

# Clean up the downloaded zip file
rm /tmp/pocketbase.zip
rm ./CHANGELOG*.md
rm ./LICENSE.md