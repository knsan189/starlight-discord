#!/bin/bash

pgrep starlight-discord | xargs kill
echo "디스코드 서버 종료"
exit 0
