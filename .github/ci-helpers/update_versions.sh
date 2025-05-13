#!/bin/bash

# Check if a version parameter is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <version>"
  exit 1
fi

# Assign the parameter to a variable
version=$1

echo "Setting version to $version..."

# Print the original lines
echo "Before:"
grep "discordBotImage:" deployment/helm/values.yaml

# Update Chart.yaml
sed -i "s/^version:.*/version: ${version}/" deployment/helm/Chart.yaml
sed -i "s/^appVersion:.*/appVersion: ${version}/" deployment/helm/Chart.yaml

# Update image tag in values.yaml
sed -i "s|\(discordBotImage: .*:v\)[0-9]\+\.[0-9]\+\.[0-9]\+|\1${version}|" deployment/helm/values.yaml

# Print the result
echo "After:"
grep "discordBotImage:" deployment/helm/values.yaml