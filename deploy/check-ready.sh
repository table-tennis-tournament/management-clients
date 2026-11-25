#!/usr/bin/env bash
# Checks from outside that the tournament system is ready, through nginx like a client:
#   nginx, the backend's readiness (database, mktt's tables, Flyway, WebSocket broker),
#   the three apps and a WebSocket handshake on /ttt-websocket.
#
#   ./check-ready.sh [base-url]        default: http://localhost
#
# Exit code 0 when everything is ready, 1 otherwise.
set -u

BASE="${1:-http://localhost}"
BASE="${BASE%/}"
FAILED=0

check() { # name, expected status, curl arguments...
  local name="$1" expected="$2"
  shift 2
  local status
  status=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$@")
  if [ "$status" = "$expected" ]; then
    printf '  ok    %-22s %s\n' "$name" "$status"
  else
    printf '  FAIL  %-22s %s (expected %s)\n' "$name" "${status:-no answer}" "$expected"
    FAILED=1
  fi
}

echo "Checking $BASE"
check "nginx /healthz" 200 "$BASE/healthz"
check "readiness /readyz" 200 "$BASE/readyz"
check "admin-view" 200 "$BASE/admin-view/"
check "tablemanager-view" 200 "$BASE/tablemanager-view/"
check "result-view" 200 "$BASE/result-view/"
# a WebSocket upgrade through nginx to the backend's STOMP endpoint: 101 Switching Protocols
check "websocket handshake" 101 "$BASE/ttt-websocket" \
  -H 'Connection: Upgrade' -H 'Upgrade: websocket' \
  -H 'Sec-WebSocket-Version: 13' -H 'Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ=='

echo
echo "Readiness details:"
body=$(curl -s --max-time 10 "$BASE/readyz")
if command -v jq >/dev/null 2>&1; then
  printf '%s\n' "$body" | jq -r '
    (.components // {}) | to_entries[] |
    "  \(.value.status | if . == "UP" then "ok  " else "DOWN" end)  \(.key)  \(.value.details // {} | tostring)"'
else
  printf '%s\n' "${body:-  no answer}"
fi

echo
if [ "$FAILED" = 0 ]; then echo "READY"; else echo "NOT READY"; fi
exit "$FAILED"
