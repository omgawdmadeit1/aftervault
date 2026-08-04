#!/bin/sh
set -eu
cd /workspace

# Healthy if the app responds with HTML (not just any TCP listener)
if curl -sf --max-time 3 http://127.0.0.1:8080/ | head -c 200 | grep -q "html\|AfterVault\|DOCTYPE\|root"; then
  exit 0
fi

# Free a stuck listener on 8080, then start fresh
if command -v fuser >/dev/null 2>&1; then
  fuser -k 8080/tcp >/dev/null 2>&1 || true
fi
sleep 1

npm run dev >>/tmp/app-startup.log 2>&1 &

# Wait briefly for readiness
i=0
while [ "$i" -lt 40 ]; do
  if curl -sf --max-time 2 http://127.0.0.1:8080/ >/dev/null 2>&1; then
    exit 0
  fi
  i=$((i + 1))
  sleep 0.5
done

echo "startup: dev server did not become ready on :8080" >>/tmp/app-startup.log
exit 1
