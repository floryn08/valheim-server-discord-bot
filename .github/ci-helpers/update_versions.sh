#!/bin/bash

# Check if a version parameter is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <version>"
  exit 1
fi

# Assign the parameter to a variable
version=$1

sed -i "s/^version:.*/version: ${version}/" deployment/helm/Chart.yaml
sed -i "s/^appVersion:.*/appVersion: ${version}/" deployment/helm/Chart.yaml
sed -i "s/:[0-9]\+\.[0-9]\+\.[0-9]\+/:${version}/" deployment/helm/values.yaml
