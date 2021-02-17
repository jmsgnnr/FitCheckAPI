#!/bin/bash

API="http://localhost:4741"
URL_PATH="/fit"

curl "${API}${URL_PATH}" \
  --include \
  --request POST \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer ${TOKEN}" \
  --data '{
    "fit": {
      "name": "'"${NAME}"'",
      "brand": "'"${BRAND}"'",
      "site": "'"${SITE}"'"
    }
  }'

echo