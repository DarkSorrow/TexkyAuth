#!/bin/sh

if [[ $NODE_ENV == "production" ]]; then
  envsubst < /app/env-config.js.dist > /usr/share/nginx/html/texky-app/config.js
else
  envsubst < /app/env-config.js.dist > /app/public/config.js
fi


exec "$@"
