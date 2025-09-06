#!/bin/bash

# First check if docker-compose container is running
if [ "$(docker-compose ps -q)" ]; then
    echo "Docker container is running"
else
    echo "Docker container is not running"
    exit 1
fi

# check if username and password are provided
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: $0 <username> <password>"
    exit 1
fi

# Register user in the running container by running "yarn start create-user <username> <password>" in /app/r3voc-mgmt-backend
docker-compose exec r3voc yarn --cwd /app/r3voc-mgmt-backend start create-user "$1" "$2"

echo "User $1 registered successfully"
exit 0