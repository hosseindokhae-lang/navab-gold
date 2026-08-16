#!/bin/zsh
set -e
echo "Starting Navab Gold on port 3000..."
npm start &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null || true' EXIT
sleep 2
if command -v cloudflared >/dev/null 2>&1; then
  echo ""
  echo "Public Instagram-friendly link will appear below."
  echo "Keep this Terminal open while the site is public."
  cloudflared tunnel --url http://localhost:3000
else
  echo "cloudflared is not installed."
  echo "Install it first, then run this script again."
  echo "The site itself is available at http://localhost:3000"
  wait $SERVER_PID
fi
