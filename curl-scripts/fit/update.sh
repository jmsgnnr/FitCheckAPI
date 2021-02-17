#!/bin/bash

API="http://localhost:4741"
URL_PATH="/fit"

curl "${API}${URL_PATH}/${ID}" \
  --include \
  --request PATCH \
  --header "Content-Type: application/json" \
--header "Authorization: Bearer ${TOKEN}" \
--data '{
    "fit": {
      "name": "'"${NAME}"'",
      "brand":"'"${BRAND}"'",
      "site":"'"${SITE}"'"
    }
  }'

echo
