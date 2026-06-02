#!/bin/bash
# Double-click this to launch the pursuits dashboard as an app (with editing + add-note).
# It starts the local server and opens the browser. Close the Terminal window to stop.
cd "$(dirname "$0")/.." || exit 1
echo "Starting pursuits dashboard…"
exec node dashboard/serve.js
