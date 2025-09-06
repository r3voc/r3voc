#!/bin/bash

if [ ! -d .git ]; then
    echo "Error: This script must be run from the root of a git repository."
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "Error: You have uncommitted changes. Please commit or stash them before running this script."
    exit 1
fi

# Check if we are on main branch
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" != "main" ]; then
    echo "Error: You must be on the 'main' branch to run this script."
    exit 1
fi

# Pull the latest changes from the remote repository
git pull origin main
if [ $? -ne 0 ]; then
    echo "Error: Failed to pull the latest changes from the remote repository."
    exit 1
fi

# Update all git submodules
git submodule update --init --recursive
if [ $? -ne 0 ]; then
    echo "Error: Failed to update git submodules."
    exit 1
fi

# rebuild the docker-compose project
docker-compose build
if [ $? -ne 0 ]; then
    echo "Error: Failed to build the docker-compose project."
    exit 1
fi

echo "Update completed successfully."
