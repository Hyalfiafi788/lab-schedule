#!/usr/bin/env bash
set -e
cd /workspace/hematology_book
rm -f /home/ubuntu/.config/google-chrome/SingletonLock 2>/dev/null || true
PROF=$(mktemp -d)
google-chrome --headless=new --no-sandbox --disable-gpu --disable-dbus \
  --user-data-dir="$PROF" --no-pdf-header-footer \
  --print-to-pdf=Essentials_of_Hematology.pdf \
  "file:///workspace/hematology_book/hematology_atlas.html" >/tmp/chrome.log 2>&1 &
CPID=$!
# wait up to 40s for the PDF written message
for i in $(seq 1 40); do
  if grep -q "bytes written to file" /tmp/chrome.log 2>/dev/null; then break; fi
  sleep 1
done
sleep 1
kill "$CPID" 2>/dev/null || true
wait "$CPID" 2>/dev/null || true
echo "done"
