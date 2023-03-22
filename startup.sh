#!/bin/bash

npm run build && nohup node app.js &
echo "Server On"

exit 0
