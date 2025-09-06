#!/bin/bash

# entrypoint.sh for r3voc

set -e
set -o pipefail

# we need to run the following commands:
# - inside /app/r3voc-mgmt-backend, run "yarn start"
# - inside /app/r3voc-mgmt-ui, run "yarn dev"

# if one of the commands fails, we want to exit the script with a non-zero status code

# start the backend in the background
(
  cd /app/r3voc-mgmt-backend
  HOST=0.0.0.0 yarn start
) &

# start the UI in the foreground
(
  cd /app/r3voc-mgmt-ui
  yarn preview --host
) &

# wait for all background jobs to finish
wait -n

# if we get here, it means one of the commands failed
exit 1
